import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pollRefundStatus } from "@/lib/bkash/refund";
import { toJson } from "@/lib/utils/json";

/**
 * Daily job polling any refund whose bKash status is still pending, since
 * refunds may be asynchronous (Phase 4.9). Payments marked `refunded` with
 * a bkash_trx_id are the candidates; this checks whether bKash's own
 * refund record has settled and logs the result.
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

  const { data: refundedPayments } = await admin
    .from("payments")
    .select("id, bkash_payment_id, bkash_trx_id, refunded_at")
    .eq("status", "refunded")
    .not("bkash_trx_id", "is", null)
    .gte("refunded_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  let checked = 0;
  let stillPending = 0;

  for (const payment of refundedPayments ?? []) {
    if (!payment.bkash_payment_id || !payment.bkash_trx_id) continue;
    checked++;

    try {
      const status = await pollRefundStatus(
        payment.bkash_payment_id,
        payment.bkash_trx_id
      );

      if (status.transactionStatus !== "Completed") {
        stillPending++;
        await admin.from("audit_log").insert({
          action: "refund_status_still_pending",
          entity_type: "payment",
          entity_id: payment.id,
          after: toJson({ status }),
        });
      }
    } catch {
      // Refund status query failed for this payment; leave it for the next run.
    }
  }

  return NextResponse.json({ checked, stillPending });
}
