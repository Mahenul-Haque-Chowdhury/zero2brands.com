import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { refundBkashPayment, queryBkashRefundStatus } from "@/lib/bkash/client";
import { toJson } from "@/lib/utils/json";

/**
 * Admin-triggered refund. Calls bKash Refund, stores the response, then
 * marks the payment refunded and revokes the associated enrollment in one
 * transaction-like sequence (best-effort atomicity via sequential updates
 * guarded by status checks — Postgres doesn't give us a single RPC here
 * because the bKash call must happen strictly between the two writes).
 */
export async function processRefund(params: {
  paymentId: string;
  reason: string;
  actorId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const admin = createAdminClient();

  const { data: payment } = await admin
    .from("payments")
    .select("*")
    .eq("id", params.paymentId)
    .single();

  if (!payment || payment.status !== "completed") {
    return { success: false, error: "Payment is not in a refundable state." };
  }
  if (!payment.bkash_trx_id || !payment.bkash_payment_id) {
    return { success: false, error: "Missing bKash transaction reference." };
  }

  try {
    const refundRes = await refundBkashPayment({
      paymentID: payment.bkash_payment_id,
      trxID: payment.bkash_trx_id,
      amount: payment.amount_bdt.toFixed(2),
      sku: payment.product_id,
      reason: params.reason,
    });

    await admin
      .from("payments")
      .update({
        status: "refunded",
        refunded_at: new Date().toISOString(),
        refund_reason: params.reason,
      })
      .eq("id", payment.id);

    await admin
      .from("enrollments")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        revoked_reason: `refund: ${params.reason}`,
      })
      .eq("payment_id", payment.id);

    await admin
      .from("batch_enrollments")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        revoked_reason: `refund: ${params.reason}`,
      })
      .eq("payment_id", payment.id);

    await admin.from("audit_log").insert({
      actor_id: params.actorId,
      action: "payment_refunded",
      entity_type: "payment",
      entity_id: payment.id,
      after: toJson({ refundRes }),
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Refund failed.",
    };
  }
}

/** Polls a pending refund's status. Called from the refund-status cron. */
export async function pollRefundStatus(paymentID: string, trxID: string) {
  return queryBkashRefundStatus({ paymentID, trxID });
}

/**
 * Revokes access without refunding (terms violations such as content
 * sharing). Does not touch bKash at all.
 */
export async function revokeAccessWithoutRefund(params: {
  paymentId: string;
  reason: string;
  actorId: string;
}): Promise<void> {
  const admin = createAdminClient();

  await admin
    .from("enrollments")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      revoked_reason: params.reason,
    })
    .eq("payment_id", params.paymentId);

  await admin
    .from("batch_enrollments")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      revoked_reason: params.reason,
    })
    .eq("payment_id", params.paymentId);

  await admin.from("audit_log").insert({
    actor_id: params.actorId,
    action: "access_revoked_no_refund",
    entity_type: "payment",
    entity_id: params.paymentId,
    after: { reason: params.reason },
  });
}
