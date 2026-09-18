import "server-only";
import { Resend } from "resend";
import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

let client: Resend | null = null;

function getResendClient(): Resend | null {
  if (!serverEnv.RESEND_API_KEY) return null;
  if (!client) client = new Resend(serverEnv.RESEND_API_KEY);
  return client;
}

export type EmailTemplate =
  | "welcome_verification"
  | "password_reset"
  | "purchase_confirmation"
  | "access_activated"
  | "enrollment_manual"
  | "batch_enrollment"
  | "session_reminder_24h"
  | "session_cancelled"
  | "course_completion"
  | "refund_processed"
  | "store_request_received"
  | "store_request_internal"
  | "device_signed_out"
  | "admin_weekly_summary";

interface QueueEmailParams {
  template: EmailTemplate;
  paymentId?: string;
  userId?: string;
  to?: string;
  data?: Record<string, unknown>;
}

/**
 * Sends an email and logs it to email_log. Never called inline in a
 * request the user is waiting on for anything payment-critical — call
 * after the transaction commits and swallow failures at the call site
 * (Phase 13.3). This function itself never throws to the caller for a
 * send failure; it logs and returns.
 */
export async function queueEmail(params: QueueEmailParams): Promise<void> {
  const admin = createAdminClient();
  const resend = getResendClient();

  let recipient = params.to;
  let templateData = params.data ?? {};

  if (!recipient && params.userId) {
    const { data } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", params.userId)
      .maybeSingle();
    recipient = data?.email;
    templateData = { fullName: data?.full_name, ...templateData };
  }

  if (params.paymentId) {
    const { data } = await admin
      .from("payments")
      .select(
        "user_id, amount_bdt, merchant_invoice_number, bkash_trx_id, products(title), profiles:user_id(email, full_name)"
      )
      .eq("id", params.paymentId)
      .maybeSingle<{
        user_id: string;
        amount_bdt: number;
        merchant_invoice_number: string;
        bkash_trx_id: string | null;
        products: { title: string } | null;
        profiles: { email: string; full_name: string | null } | null;
      }>();

    if (!recipient) recipient = data?.profiles?.email ?? undefined;

    templateData = {
      fullName: data?.profiles?.full_name,
      amountBdt: data?.amount_bdt,
      invoiceNumber: data?.merchant_invoice_number,
      trxId: data?.bkash_trx_id,
      productTitle: data?.products?.title,
      ...templateData, // explicit data passed by the caller always wins
    };
  }

  if (!recipient) {
    await admin.from("email_log").insert({
      recipient: "unknown",
      template: params.template,
      status: "skipped_no_recipient",
    });
    return;
  }

  if (!resend) {
    // Resend not configured (no API key yet) — log and move on rather than
    // throwing, so payment flows never fail because email isn't wired up.
    await admin.from("email_log").insert({
      recipient,
      template: params.template,
      status: "skipped_not_configured",
    });
    return;
  }

  try {
    const { renderEmailTemplate } = await import("@/lib/email/templates/render");
    const { subject, html, text } = await renderEmailTemplate(
      params.template,
      templateData
    );

    const result = await resend.emails.send({
      from: serverEnv.EMAIL_FROM,
      replyTo: serverEnv.EMAIL_REPLY_TO,
      to: recipient,
      subject,
      html,
      text,
    });

    await admin.from("email_log").insert({
      recipient,
      template: params.template,
      provider_message_id: result.data?.id ?? null,
      status: result.error ? "failed" : "sent",
      error: result.error?.message ?? null,
    });
  } catch (err) {
    await admin.from("email_log").insert({
      recipient,
      template: params.template,
      status: "failed",
      error: err instanceof Error ? err.message : "unknown error",
    });
  }
}
