import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { LeadForm } from "@/components/marketing/lead-form";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          Get in touch
        </span>
        <h1 className="mt-3 text-balance text-3xl font-semibold sm:text-4xl">
          Contact us
        </h1>
        <p className="mt-4 text-muted-foreground">
          Questions about the course, a batch, or a payment? Send us a
          message and we&apos;ll get back to you.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Mail className="size-4 shrink-0 text-accent" />
            support@zero2brands.com
          </p>
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="size-4 shrink-0 text-accent" />
            Pubail, Gazipur, Dhaka, Bangladesh
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <LeadForm source="contact" />
        </div>
      </Reveal>
    </div>
  );
}
