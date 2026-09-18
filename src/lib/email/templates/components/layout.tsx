import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            margin: "40px auto",
            padding: "32px",
            borderRadius: "8px",
            maxWidth: "480px",
          }}
        >
          <Text style={{ fontSize: "18px", fontWeight: 600 }}>Zero2Brands</Text>
          <Section>{children}</Section>
          <Hr style={{ margin: "24px 0", borderColor: "#e4e4e7" }} />
          <Text style={{ fontSize: "12px", color: "#71717a" }}>
            Zero2Brands · support@zero2brands.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
