import type { Metadata } from "next";
import { LeadForm } from "@/components/marketing/lead-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Contact us</h1>
      <p className="mt-4 text-muted-foreground">
        Questions about the course, a batch, or a payment? Send us a
        message and we&apos;ll get back to you.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        support@zero2brands.com
      </p>
      <div className="mt-8">
        <LeadForm source="contact" />
      </div>
    </div>
  );
}
