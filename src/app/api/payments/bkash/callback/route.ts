import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { executeBkashPayment, queryBkashPayment } from "@/lib/bkash/client";
import { fireServerPurchaseEvent } from "@/lib/analytics/meta-capi";
import { queueEmail } from "@/lib/email/resend";
import { queueSms } from "@/lib/sms/gateway";
import { toJson } from "@/lib/utils/json";

/**
 * bKash redirects the customer here after they complete (or abandon)
 * checkout. There is no server-to-server IPN in the standard flow, so THIS
 * request is what finalizes the payment via Execute Payment, with Query
 * Payment as the fallback when Execute itself fails or times out.
 *
 * Idempotency is checked first because customers refresh this page and hit
 * back — a second hit must never double-grant or double-charge.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const paymentID = searchParams.get("paymentID");
  const status = searchParams.get("status");

  if (!paymentID) {
    return NextResponse.redirect(`${origin}/payment/failed`);
  }

  const admin = createAdminClient();

  const { data: payment } = await admin
    .from("payments")
    .select("*")
    .eq("bkash_payment_id", paymentID)
    .maybeSingle();

  if (!payment) {
    // Never trust the query string alone if we have no matching row.
    return NextResponse.redirect(`${origin}/payment/failed`);
  }

  // Idempotency: already resolved, just send them to the right page.
  if (payment.status === "completed") {
    return NextResponse.redirect(
      `${origin}/payment/success?invoice=${payment.merchant_invoice_number}`
    );
  }
  if (payment.status === "failed" || payment.status === "cancelled") {
    return NextResponse.redirect(`${origin}/payment/${payment.status}`);
  }

  if (status !== "success") {
    const finalStatus = status === "cancel" ? "cancelled" : "failed";
    await admin
      .from("payments")
      .update({
        status: finalStatus,
        failure_reason: `bkash_callback_status_${status}`,
      })
      .eq("id", payment.id);
    return NextResponse.redirect(`${origin}/payment/${finalStatus}`);
  }

  try {
    const executeRes = await executeBkashPayment(paymentID);

    if (executeRes.transactionStatus === "Completed") {
      return await finalizeCompletedPayment({
        admin,
        paymentRowId: payment.id,
        amountBdt: payment.amount_bdt,
        executeResponse: executeRes,
        origin,
        invoiceNumber: payment.merchant_invoice_number,
      });
    }

    // Execute did not report Completed — fall through to Query below to
    // find the true state rather than assuming failure.
  } catch {
    // Execute failed or timed out. Do not assume failure — fall through.
  }

  try {
    const queryRes = await queryBkashPayment(paymentID);
    await admin
      .from("payments")
      .update({ bkash_query_response: toJson(queryRes) })
      .eq("id", payment.id);

    if (queryRes.transactionStatus === "Completed") {
      return await finalizeCompletedPayment({
        admin,
        paymentRowId: payment.id,
        amountBdt: payment.amount_bdt,
        executeResponse: queryRes,
        origin,
        invoiceNumber: payment.merchant_invoice_number,
      });
    }

    if (
      queryRes.transactionStatus === "Failed" ||
      queryRes.transactionStatus === "Cancelled"
    ) {
      await admin
        .from("payments")
        .update({
          status: "failed",
          failure_reason: `bkash_query_${queryRes.transactionStatus}`,
        })
        .eq("id", payment.id);
      return NextResponse.redirect(`${origin}/payment/failed`);
    }

    // Still ambiguous: leave as `processing` and let reconciliation (Phase
    // 4.7) resolve it. Show the customer the pending/polling screen.
    return NextResponse.redirect(
      `${origin}/payment/success?invoice=${payment.merchant_invoice_number}&pending=1`
    );
  } catch {
    // Query itself failed. Leave processing for reconciliation to pick up.
    return NextResponse.redirect(
      `${origin}/payment/success?invoice=${payment.merchant_invoice_number}&pending=1`
    );
  }
}

async function finalizeCompletedPayment(params: {
  admin: ReturnType<typeof createAdminClient>;
  paymentRowId: string;
  amountBdt: number;
  executeResponse: {
    amount: string;
    currency: string;
    trxID?: string;
    customerMsisdn?: string;
    payerReference?: string;
  };
  origin: string;
  invoiceNumber: string;
}) {
  const { admin, paymentRowId, amountBdt, executeResponse, origin, invoiceNumber } =
    params;

  // Amount/currency verification: never trust the gateway blindly.
  const returnedAmount = Math.round(parseFloat(executeResponse.amount));
  if (returnedAmount !== amountBdt || executeResponse.currency !== "BDT") {
    await admin
      .from("payments")
      .update({
        status: "failed",
        failure_reason: "amount_mismatch",
        bkash_execute_response: toJson(executeResponse),
      })
      .eq("id", paymentRowId);
    // TODO: alert admin via Sentry/email — implemented once Sentry is wired.
    return NextResponse.redirect(`${origin}/payment/failed`);
  }

  await admin
    .from("payments")
    .update({
      status: "completed",
      bkash_trx_id: executeResponse.trxID,
      bkash_customer_msisdn: executeResponse.customerMsisdn,
      bkash_payer_reference: executeResponse.payerReference,
      bkash_execute_response: toJson(executeResponse),
      paid_at: new Date().toISOString(),
    })
    .eq("id", paymentRowId);

  const { error: grantError } = await admin.rpc("grant_access_for_payment", {
    p_payment_id: paymentRowId,
  });

  if (grantError) {
    // Payment is marked completed but the grant transaction failed. This
    // must surface loudly — reconciliation's daily cross-check (Phase 4.7)
    // catches "completed payment, no enrollment" as a safety net, but this
    // should also alert immediately once Sentry is wired in Phase 14.
    console.error("grant_access_for_payment failed", grantError);
  }

  // Fire-and-forget side effects. Never block the redirect on these, and a
  // failure here must never roll back the enrollment above.
  void fireServerPurchaseEvent({ paymentId: paymentRowId }).catch(() => {});
  void queueEmail({ template: "purchase_confirmation", paymentId: paymentRowId }).catch(
    () => {}
  );
  void queueSms({ template: "purchase_confirmation", paymentId: paymentRowId }).catch(
    () => {}
  );

  return NextResponse.redirect(`${origin}/payment/success?invoice=${invoiceNumber}`);
}
