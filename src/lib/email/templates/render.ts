import "server-only";
import type { EmailTemplate } from "@/lib/email/resend";

/**
 * Minimal placeholder renderer. Real React Email templates are built out in
 * Phase 13; this keeps the send pipeline functional end to end in the
 * meantime with plain, honest copy (never fake data).
 */
export async function renderEmailTemplate(
  template: EmailTemplate,
  data: Record<string, unknown>
): Promise<{ subject: string; html: string; text: string }> {
  const subjectMap: Record<EmailTemplate, string> = {
    welcome_verification: "Welcome to Zero2Brands — verify your email",
    password_reset: "Reset your Zero2Brands password",
    purchase_confirmation: "Your Zero2Brands purchase is confirmed",
    access_activated: "Your Zero2Brands access is now active",
    enrollment_manual: "You've been enrolled in Zero2Brands",
    batch_enrollment: "You're enrolled in your live batch",
    session_reminder_24h: "Your live session is tomorrow",
    session_cancelled: "A live session has been rescheduled",
    course_completion: "Congratulations on completing the course!",
    refund_processed: "Your refund has been processed",
    store_request_received: "We received your store request",
    store_request_internal: "New store request submitted",
    device_signed_out: "A device was signed out of your account",
  };

  const subject = subjectMap[template];
  const bodyLines = Object.entries(data)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join("\n");

  const text = `${subject}\n\n${bodyLines}\n\nZero2Brands`;
  const html = `<div style="font-family: sans-serif; padding: 24px;"><h2>${subject}</h2><pre style="white-space:pre-wrap;">${bodyLines}</pre><p>Zero2Brands</p></div>`;

  return { subject, html, text };
}
