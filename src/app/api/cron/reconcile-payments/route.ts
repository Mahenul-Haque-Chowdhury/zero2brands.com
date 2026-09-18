import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { queryBkashPayment } from "@/lib/bkash/client";
import { fireServerPurchaseEvent } from "@/lib/analytics/meta-capi";
import { queueEmail } from "@/lib/email/resend";
import { toJson } from "@/lib/utils/json";

/**
 * Runs every 15 minutes (Vercel Cron, see vercel.json). This is the safety
 * net for bKash's missing IPN — without it, a customer whose browser died
 * before hitting the callback (or whose Execute call timed out) pays and
 * receives nothing. See Phase 4.7 of the build plan.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const twentyFourHoursAgo = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: stuckPayments } = await admin
    .from("payments")
    .select("id, bkash_payment_id, created_at")
    .eq("status", "processing")
    .eq("gateway", "bkash")
    .lt("created_at", tenMinutesAgo)
    .not("bkash_payment_id", "is", null);

  const results = {
    checked: 0,
    granted: 0,
    failed: 0,
    stillUnknown: 0,
    flaggedForReview: 0,
  };

  for (const payment of stuckPayments ?? []) {
    results.checked++;
    if (!payment.bkash_payment_id) continue;

    try {
      const queryRes = await queryBkashPayment(payment.bkash_payment_id);

      await admin
        .from("payments")
        .update({ bkash_query_response: toJson(queryRes) })
        .eq("id", payment.id);

      if (queryRes.transactionStatus === "Completed") {
        const returnedAmount = Math.round(parseFloat(queryRes.amount));

        const { data: fullPayment } = await admin
          .from("payments")
          .select("amount_bdt")
          .eq("id", payment.id)
          .single();

        if (
          fullPayment &&
          returnedAmount === fullPayment.amount_bdt &&
          queryRes.currency === "BDT"
        ) {
          await admin
            .from("payments")
            .update({
              status: "completed",
              bkash_trx_id: queryRes.trxID,
              bkash_customer_msisdn: queryRes.customerMsisdn,
              bkash_payer_reference: queryRes.payerReference,
              paid_at: new Date().toISOString(),
            })
            .eq("id", payment.id);

          const { error: grantError } = await admin.rpc(
            "grant_access_for_payment",
            { p_payment_id: payment.id }
          );

          if (!grantError) {
            results.granted++;
            void fireServerPurchaseEvent({ paymentId: payment.id }).catch(() => {});
            void queueEmail({
              template: "access_activated",
              paymentId: payment.id,
            }).catch(() => {});
          }
        } else {
          await admin
            .from("payments")
            .update({ status: "failed", failure_reason: "amount_mismatch" })
            .eq("id", payment.id);
          results.failed++;
        }
      } else if (
        queryRes.transactionStatus === "Failed" ||
        queryRes.transactionStatus === "Cancelled"
      ) {
        await admin
          .from("payments")
          .update({
            status: "failed",
            failure_reason: `reconciliation_${queryRes.transactionStatus}`,
          })
          .eq("id", payment.id);
        results.failed++;
      } else {
        results.stillUnknown++;
        if (payment.created_at < twentyFourHoursAgo) {
          results.flaggedForReview++;
          await admin.from("audit_log").insert({
            action: "payment_flagged_for_manual_review",
            entity_type: "payment",
            entity_id: payment.id,
            after: toJson({ reason: "unresolved_after_24h", queryRes }),
          });
        }
      }
    } catch (err) {
      results.stillUnknown++;
      await admin.from("audit_log").insert({
        action: "reconciliation_query_failed",
        entity_type: "payment",
        entity_id: payment.id,
        after: { error: err instanceof Error ? err.message : "unknown" },
      });
    }
  }

  // Daily cross-check: completed payments with no matching enrollment, and
  // enrollments with no payment. Only run once per day (guarded by hour).
  const hour = new Date().getUTCHours();
  if (hour === 3) {
    await runDailyCrossCheck(admin);
  }

  return NextResponse.json(results);
}

async function runDailyCrossCheck(admin: ReturnType<typeof createAdminClient>) {
  const { data: orphanPayments } = await admin
    .from("payments")
    .select("id, product_id, user_id")
    .eq("status", "completed");

  const orphaned: string[] = [];
  for (const p of orphanPayments ?? []) {
    const { data: product } = await admin
      .from("products")
      .select("type, course_id, batch_id")
      .eq("id", p.product_id)
      .maybeSingle();
    if (!product) continue;

    if (product.type === "course" && product.course_id) {
      const { data: enrollment } = await admin
        .from("enrollments")
        .select("id")
        .eq("user_id", p.user_id)
        .eq("course_id", product.course_id)
        .maybeSingle();
      if (!enrollment) orphaned.push(p.id);
    } else if (product.type === "batch" && product.batch_id) {
      const { data: enrollment } = await admin
        .from("batch_enrollments")
        .select("id")
        .eq("user_id", p.user_id)
        .eq("batch_id", product.batch_id)
        .maybeSingle();
      if (!enrollment) orphaned.push(p.id);
    }
  }

  if (orphaned.length > 0) {
    await admin.from("audit_log").insert({
      action: "daily_crosscheck_orphaned_payments",
      entity_type: "payment",
      after: { payment_ids: orphaned },
    });
  }
}
