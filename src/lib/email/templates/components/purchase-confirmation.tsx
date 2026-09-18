import { Text, Button } from "@react-email/components";
import { EmailLayout } from "./layout";

export function PurchaseConfirmationEmail({
  fullName,
  productTitle,
  amountBdt,
  invoiceNumber,
  trxId,
  courseUrl,
}: {
  fullName: string;
  productTitle: string;
  amountBdt: number;
  invoiceNumber: string;
  trxId: string;
  courseUrl: string;
}) {
  return (
    <EmailLayout preview={`Your purchase of ${productTitle} is confirmed`}>
      <Text>Hi {fullName},</Text>
      <Text>
        Your payment for <strong>{productTitle}</strong> is confirmed. Your
        access is active now.
      </Text>
      <Text style={{ fontSize: "13px", color: "#52525b" }}>
        Invoice: {invoiceNumber}
        <br />
        bKash transaction ID: {trxId}
        <br />
        Amount: ৳{amountBdt.toLocaleString()}
      </Text>
      <Button
        href={courseUrl}
        style={{
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          padding: "10px 20px",
          borderRadius: "6px",
          marginTop: "16px",
          display: "inline-block",
        }}
      >
        Go to your course
      </Button>
    </EmailLayout>
  );
}
