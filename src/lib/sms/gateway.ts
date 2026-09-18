import "server-only";
import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export type SmsTemplate =
  | "purchase_confirmation"
  | "session_reminder_1h"
  | "session_cancelled"
  | "otp";

interface QueueSmsParams {
  template: SmsTemplate;
  paymentId?: string;
  userId?: string;
  to?: string;
  data?: Record<string, unknown>;
}

function renderSms(template: SmsTemplate, data: Record<string, unknown>): string {
  switch (template) {
    case "purchase_confirmation":
      return `Zero2Brands: Payment confirmed. Access your course now: ${data.courseUrl ?? "zero2brands.com/dashboard"}`;
    case "session_reminder_1h":
      return `Zero2Brands: Your live session "${data.sessionTitle ?? ""}" starts in 1 hour. Join from your dashboard.`;
    case "session_cancelled":
      return `Zero2Brands: Your session "${data.sessionTitle ?? ""}" has been rescheduled. Check your dashboard for the new time.`;
    case "otp":
      return `Your Zero2Brands verification code is ${data.code ?? ""}.`;
    default:
      return "Zero2Brands notification.";
  }
}

/**
 * Sends an SMS and logs it to sms_log. Never inline in a request the user
 * is waiting on for payment-critical flows (Phase 13.3) — call after
 * commit and swallow failures at the call site.
 */
export async function queueSms(params: QueueSmsParams): Promise<void> {
  const admin = createAdminClient();

  let recipient = params.to;
  if (!recipient && params.userId) {
    const { data } = await admin
      .from("profiles")
      .select("phone")
      .eq("id", params.userId)
      .maybeSingle();
    recipient = data?.phone ?? undefined;
  }
  if (!recipient && params.paymentId) {
    const { data } = await admin
      .from("payments")
      .select("user_id, profiles:user_id(phone)")
      .eq("id", params.paymentId)
      .maybeSingle<{ user_id: string; profiles: { phone: string | null } | null }>();
    recipient = data?.profiles?.phone ?? undefined;
  }

  if (!recipient) {
    await admin.from("sms_log").insert({
      recipient: "unknown",
      template: params.template,
      status: "skipped_no_recipient",
    });
    return;
  }

  const message = renderSms(params.template, params.data ?? {});

  if (!serverEnv.SMS_API_URL || !serverEnv.SMS_API_KEY) {
    await admin.from("sms_log").insert({
      recipient,
      template: params.template,
      status: "skipped_not_configured",
    });
    return;
  }

  try {
    const res = await fetch(serverEnv.SMS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: serverEnv.SMS_API_KEY,
      },
      body: JSON.stringify({
        to: recipient,
        message,
        senderId: serverEnv.SMS_SENDER_ID,
      }),
    });

    await admin.from("sms_log").insert({
      recipient,
      template: params.template,
      status: res.ok ? "sent" : "failed",
      error: res.ok ? null : `http_${res.status}`,
    });
  } catch (err) {
    await admin.from("sms_log").insert({
      recipient,
      template: params.template,
      status: "failed",
      error: err instanceof Error ? err.message : "unknown error",
    });
  }
}
