import "server-only";
import { render } from "@react-email/components";
import type { EmailTemplate } from "@/lib/email/resend";
import { PurchaseConfirmationEmail } from "./components/purchase-confirmation";
import { GenericNoticeEmail } from "./components/generic-notice";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zero2brands.com";

/**
 * Maps each template to its React Email component. purchase_confirmation
 * has a dedicated component (it carries the most transactional detail —
 * invoice, trxID, amount); every other template shares GenericNoticeEmail
 * with template-specific copy, since they're all a greeting plus one or
 * two lines plus an optional link.
 */
export async function renderEmailTemplate(
  template: EmailTemplate,
  data: Record<string, unknown>
): Promise<{ subject: string; html: string; text: string }> {
  const str = (key: string, fallback = "") =>
    typeof data[key] === "string" ? (data[key] as string) : fallback;
  const num = (key: string) => (typeof data[key] === "number" ? (data[key] as number) : 0);

  let subject: string;
  let element: React.ReactElement;

  switch (template) {
    case "purchase_confirmation":
      subject = "Your Zero2Brands purchase is confirmed";
      element = PurchaseConfirmationEmail({
        fullName: str("fullName", "there"),
        productTitle: str("productTitle", "your course"),
        amountBdt: num("amountBdt"),
        invoiceNumber: str("invoiceNumber"),
        trxId: str("trxId"),
        courseUrl: `${SITE_URL}/dashboard/course`,
      });
      break;

    case "welcome_verification":
      subject = "Welcome to Zero2Brands, verify your email";
      element = GenericNoticeEmail({
        heading: "Welcome to Zero2Brands",
        fullName: str("fullName"),
        lines: ["Please verify your email to get started."],
        ctaLabel: "Verify email",
        ctaUrl: str("verifyUrl", SITE_URL),
      });
      break;

    case "password_reset":
      subject = "Reset your Zero2Brands password";
      element = GenericNoticeEmail({
        heading: "Reset your password",
        lines: ["Click below to choose a new password. This link expires soon."],
        ctaLabel: "Reset password",
        ctaUrl: str("resetUrl", SITE_URL),
      });
      break;

    case "access_activated":
      subject = "Your Zero2Brands access is now active";
      element = GenericNoticeEmail({
        heading: "Your access is now active",
        fullName: str("fullName"),
        lines: [
          "We confirmed your payment and your access is now live. Sorry for the short delay.",
        ],
        ctaLabel: "Go to your course",
        ctaUrl: `${SITE_URL}/dashboard/course`,
      });
      break;

    case "enrollment_manual":
      subject = "You've been enrolled in Zero2Brands";
      element = GenericNoticeEmail({
        heading: "You're enrolled",
        fullName: str("fullName"),
        lines: ["An admin has granted you access to the course."],
        ctaLabel: "Go to your course",
        ctaUrl: `${SITE_URL}/dashboard/course`,
      });
      break;

    case "batch_enrollment":
      subject = "You're enrolled in your live batch";
      element = GenericNoticeEmail({
        heading: "You're enrolled in your batch",
        fullName: str("fullName"),
        lines: [str("scheduleNote", "Check your dashboard for the session schedule.")],
        ctaLabel: "View your batch",
        ctaUrl: `${SITE_URL}/dashboard/my-batches`,
      });
      break;

    case "session_reminder_24h":
      subject = "Your live session is tomorrow";
      element = GenericNoticeEmail({
        heading: "Session reminder",
        lines: [`"${str("sessionTitle")}" starts in about 24 hours.`],
        ctaLabel: "View session",
        ctaUrl: `${SITE_URL}/dashboard/my-batches`,
      });
      break;

    case "session_cancelled":
      subject = "A live session has been rescheduled";
      element = GenericNoticeEmail({
        heading: "Session rescheduled",
        lines: [`"${str("sessionTitle")}" has a new time. Check your dashboard.`],
        ctaLabel: "View batch",
        ctaUrl: `${SITE_URL}/dashboard/my-batches`,
      });
      break;

    case "course_completion":
      subject = "Congratulations on completing the course!";
      element = GenericNoticeEmail({
        heading: "You did it!",
        fullName: str("fullName"),
        lines: ["Your certificate is ready."],
        ctaLabel: "View certificate",
        ctaUrl: `${SITE_URL}/dashboard/certificates`,
      });
      break;

    case "refund_processed":
      subject = "Your refund has been processed";
      element = GenericNoticeEmail({
        heading: "Refund processed",
        fullName: str("fullName"),
        lines: [
          "Your refund has been processed by bKash. It may take a few days to appear.",
        ],
      });
      break;

    case "store_request_received":
      subject = "We received your store request";
      element = GenericNoticeEmail({
        heading: "Request received",
        fullName: str("fullName"),
        lines: ["GrayVally will be in touch with you soon."],
      });
      break;

    case "store_request_internal":
      subject = "New store request submitted";
      element = GenericNoticeEmail({
        heading: "New store request",
        lines: [`${str("fullName")} · ${str("phone")}`],
        ctaLabel: "View in management",
        ctaUrl: `${SITE_URL}/management/store-requests`,
      });
      break;

    case "device_signed_out":
      subject = "A device was signed out of your account";
      element = GenericNoticeEmail({
        heading: "Device signed out",
        fullName: str("fullName"),
        lines: [
          "One of your devices was signed out because your account reached the two-device limit.",
        ],
        ctaLabel: "Manage devices",
        ctaUrl: `${SITE_URL}/dashboard/settings/devices`,
      });
      break;

    case "admin_weekly_summary":
      subject = "Zero2Brands weekly summary";
      element = GenericNoticeEmail({
        heading: "Weekly summary",
        lines: [
          `Revenue this week: ৳${num("revenue").toLocaleString()}`,
          `New course enrollments: ${num("newEnrollments")}`,
          `New batch enrollments: ${num("newBatchEnrollments")}`,
        ],
        ctaLabel: "Open management dashboard",
        ctaUrl: `${SITE_URL}/management`,
      });
      break;

    default:
      subject = "Zero2Brands notification";
      element = GenericNoticeEmail({ heading: subject, lines: [] });
  }

  const html = await render(element);
  const text = await render(element, { plainText: true });

  return { subject, html, text };
}
