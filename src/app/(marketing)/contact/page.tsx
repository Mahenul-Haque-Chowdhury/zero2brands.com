import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { LeadForm } from "@/components/marketing/lead-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        Get in touch
      </p>
      <h1 className="mt-2 text-balance text-3xl font-semibold sm:text-4xl">
        Contact us
      </h1>
      <p className="mt-4 text-muted-foreground">
        Questions about the course, a batch, or a payment? Send us a
        message and we&apos;ll get back to you.
      </p>
      <p className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <Mail className="size-4 text-accent" />
        support@zero2brands.com
      </p>

      <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <LeadForm source="contact" />
      </div>
    </div>
  );
}
