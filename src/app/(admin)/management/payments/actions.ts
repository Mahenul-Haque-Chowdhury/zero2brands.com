"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { recordManualPayment } from "@/lib/payments/manual";
import { processRefund, revokeAccessWithoutRefund } from "@/lib/bkash/refund";

export async function createManualPaymentAction(formData: FormData) {
  const { user } = await requireAdmin();

  const userId = String(formData.get("userId"));
  const productId = String(formData.get("productId"));
  const amountBdt = Number(formData.get("amountBdt"));
  const bkashReference = String(formData.get("bkashReference"));
  const note = String(formData.get("note") ?? "");

  if (!userId || !productId || !amountBdt) {
    return { error: "Missing required fields." };
  }

  const result = await recordManualPayment({
    userId,
    productId,
    amountBdt,
    bkashReference,
    note,
    actorId: user.id,
  });

  revalidatePath("/management/payments");
  return result;
}

export async function refundPaymentAction(formData: FormData) {
  const { user } = await requireAdmin();
  const paymentId = String(formData.get("paymentId"));
  const reason = String(formData.get("reason") ?? "");

  const result = await processRefund({ paymentId, reason, actorId: user.id });
  revalidatePath("/management/payments");
  return result;
}

export async function revokeAccessAction(formData: FormData) {
  const { user } = await requireAdmin();
  const paymentId = String(formData.get("paymentId"));
  const reason = String(formData.get("reason") ?? "terms_violation");

  await revokeAccessWithoutRefund({ paymentId, reason, actorId: user.id });
  revalidatePath("/management/payments");
  return { success: true };
}
