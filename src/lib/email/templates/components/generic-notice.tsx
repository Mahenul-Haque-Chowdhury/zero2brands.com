import { Text, Button } from "@react-email/components";
import { EmailLayout } from "./layout";

/**
 * Shared template for the simpler transactional notices (access activated,
 * manual enrollment, batch enrollment, session reminder/cancellation,
 * course completion, refund processed, store request receipts, device
 * signed out). Each has slightly different copy but the same shape —
 * greeting, one or two body lines, an optional CTA — so one parameterized
 * component covers them rather than a dozen near-duplicate files.
 */
export function GenericNoticeEmail({
  heading,
  fullName,
  lines,
  ctaLabel,
  ctaUrl,
}: {
  heading: string;
  fullName?: string;
  lines: string[];
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  return (
    <EmailLayout preview={heading}>
      <Text style={{ fontSize: "16px", fontWeight: 600 }}>{heading}</Text>
      {fullName ? <Text>Hi {fullName},</Text> : null}
      {lines.map((line, i) => (
        <Text key={i}>{line}</Text>
      ))}
      {ctaLabel && ctaUrl ? (
        <Button
          href={ctaUrl}
          style={{
            backgroundColor: "#0a0a0a",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: "6px",
            marginTop: "16px",
            display: "inline-block",
          }}
        >
          {ctaLabel}
        </Button>
      ) : null}
    </EmailLayout>
  );
}
