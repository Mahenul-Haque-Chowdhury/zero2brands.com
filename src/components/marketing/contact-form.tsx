"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitLeadAction } from "@/lib/leads/actions";
import { fireMetaPixelEvent } from "@/lib/analytics/meta-pixel";
import { fireGa4Event } from "@/lib/analytics/ga4";
import { cn } from "cn";

const QUERY_TYPES = [
  "General question",
  "Course access issue",
  "Payment or refund",
  "Live batch",
  "Partnership",
  "Something else",
];

/**
 * A general enquiry form, deliberately separate from the GrayVally lead
 * form on /build-your-store. Those two are asking different questions
 * (a store-building brief vs. a general question), so they shouldn't share
 * fields like business name and project type. This one matches exactly
 * what the `leads` table stores: name, phone, email.
 */
export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldClass =
    "h-11 w-full rounded-lg border border-input bg-secondary/60 px-3.5 text-sm text-foreground outline-none transition-[color,background-color,border-color,box-shadow] duration-200 placeholder:text-muted-foreground hover:border-muted-foreground/30 focus-visible:border-accent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-accent/30";

  const labelClass = "text-sm font-medium text-foreground";

  function handleSubmit(formData: FormData) {
    formData.set("source", "contact");
    startTransition(async () => {
      const result = await submitLeadAction(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setError(null);
      setDone(true);
      fireMetaPixelEvent("Lead", `lead_contact_${Date.now()}`, {
        content_name: "contact",
      });
      fireGa4Event("generate_lead", { source: "contact" });
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-6 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 className="size-5" />
        </span>
        <p className="font-medium text-foreground">Message received</p>
        <p className="text-sm text-muted-foreground">
          We will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="contact-fullName" className={labelClass}>
          Full name
        </label>
        <input
          id="contact-fullName"
          name="fullName"
          required
          autoComplete="name"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="contact-phone" className={labelClass}>
            Phone number
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            className={fieldClass}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="contact-email" className={labelClass}>
            Email{" "}
            <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="contact-queryType" className={labelClass}>
          What is this about
        </label>
        {/* Native select, same reasoning as the GrayVally lead form: posts
            with the form with no extra state, and uses the OS picker on
            mobile. */}
        <select
          id="contact-queryType"
          name="queryType"
          defaultValue=""
          className={cn(fieldClass, "appearance-none bg-no-repeat pr-10")}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235b6b7c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundPosition: "right 0.875rem center",
          }}
        >
          <option value="" disabled>
            Select one
          </option>
          {QUERY_TYPES.map((t) => (
            <option key={t} value={t} className="text-foreground">
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="contact-message" className={labelClass}>
          Message{" "}
          <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          placeholder="Tell us more."
          className={cn(fieldClass, "h-auto resize-y py-3 leading-relaxed")}
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        size="lg"
        className="mt-1 h-11 w-full bg-accent text-base font-medium text-accent-foreground transition-transform duration-200 hover:bg-accent/90 active:scale-[0.99]"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending
          </>
        ) : (
          "Send message"
        )}
      </Button>
    </form>
  );
}
