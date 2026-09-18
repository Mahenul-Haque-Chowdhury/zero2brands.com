import "server-only";
import { nanoid } from "nanoid";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Records a manual payment (student sent money to a personal bKash number
 * and messaged on Facebook — common in this market, per Phase 4.10) and
 * grants access through the same transactional function real bKash
 * payments use, so there is exactly one grant code path in the system.
 */
export async function recordManualPayment(params: {
  userId: string;
  productId: string;
  amountBdt: number;
  bkashReference: string;
  note: string;
  actorId: string;
}): Promise<{ success: true; paymentId: string } | { success: false; error: string }> {
  const admin = createAdminClient();

  const { data: payment, error } = await admin
    .from("payments")
    .insert({
      user_id: params.userId,
      product_id: params.productId,
      merchant_invoice_number: `Z2B-MANUAL-${nanoid(10)}`,
      gateway: "manual",
      amount_bdt: params.amountBdt,
      status: "completed",
      paid_at: new Date().toISOString(),
      bkash_payer_reference: params.bkashReference,
      failure_reason: null,
    })
    .select("id")
    .single();

  if (error || !payment) {
    return { success: false, error: "Could not record the payment." };
  }

  const { error: grantError } = await admin.rpc("grant_access_for_payment", {
    p_payment_id: payment.id,
  });

  if (grantError) {
    return { success: false, error: "Payment recorded but access grant failed." };
  }

  await admin.from("audit_log").insert({
    actor_id: params.actorId,
    action: "manual_payment_recorded",
    entity_type: "payment",
    entity_id: payment.id,
    after: { note: params.note, bkashReference: params.bkashReference },
  });

  return { success: true, paymentId: payment.id };
}
