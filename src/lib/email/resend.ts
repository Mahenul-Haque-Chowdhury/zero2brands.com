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
  | "device_signed_out";

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
  if (!recipient && params.userId) {
    const { data } = await admin
      .from("profiles")
      .select("email")
      .eq("id", params.userId)
      .maybeSingle();
    recipient = data?.email;
  }
  if (!recipient && params.paymentId) {
    const { data } = await admin
      .from("payments")
      .select("user_id, profiles:user_id(email)")
      .eq("id", params.paymentId)
      .maybeSingle<{ user_id: string; profiles: { email: string } | null }>();
    recipient = data?.profiles?.email ?? undefined;
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
      params.data ?? {}
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
