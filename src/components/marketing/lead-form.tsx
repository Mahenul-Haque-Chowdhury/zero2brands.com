"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitLeadAction } from "@/lib/leads/actions";
import { fireMetaPixelEvent } from "@/lib/analytics/meta-pixel";
import { fireGa4Event } from "@/lib/analytics/ga4";
import { cn } from "cn";

const PROJECT_TYPES = [
  "E-commerce store",
  "Business website",
  "Mobile app",
  "Custom software or automation",
  "SEO and digital marketing",
  "Something else",
];

/**
 * Used on both the contact page and inside the white card on the
 * /build-your-store navy hero. Fields are taller than the shadcn default
 * (h-11 rather than h-8) and carry a soft filled surface, so they read as
 * interactive rather than as bare outlines.
 */
export function LeadForm({ source }: { source: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldClass =
    "h-11 w-full rounded-lg border border-input bg-secondary/60 px-3.5 text-sm text-foreground outline-none transition-[color,background-color,border-color,box-shadow] duration-200 placeholder:text-muted-foreground hover:border-muted-foreground/30 focus-visible:border-accent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-accent/30";

  const labelClass = "text-sm font-medium text-foreground";

  function handleSubmit(formData: FormData) {
    formData.set("source", source);
    startTransition(async () => {
      const result = await submitLeadAction(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setError(null);
      setDone(true);
      fireMetaPixelEvent("Lead", `lead_${source}_${Date.now()}`, {
        content_name: source,
      });
      fireGa4Event("generate_lead", { source });
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-6 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 className="size-5" />
        </span>
        <p className="font-medium text-foreground">Request received</p>
        <p className="text-sm text-muted-foreground">
          The team will reach out, usually within one to two business days.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="lead-fullName" className={labelClass}>
          Full name
        </label>
        <input
          id="lead-fullName"
          name="fullName"
          required
          autoComplete="name"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="lead-phone" className={labelClass}>
            Phone number
          </label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            className={fieldClass}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="lead-email" className={labelClass}>
            Email{" "}
            <span className="text-muted-foreground">
              (optional)
            </span>
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            autoComplete="email"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="lead-businessName" className={labelClass}>
            Business name{" "}
            <span className="text-muted-foreground">
              (optional)
            </span>
          </label>
          <input
            id="lead-businessName"
            name="businessName"
            autoComplete="organization"
            className={fieldClass}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="lead-projectType" className={labelClass}>
            Project type
          </label>
          {/* Native select rather than the shadcn popover: it posts with the
              form without extra state or a hidden mirror input, and it uses
              the OS picker on mobile. */}
          <select
            id="lead-projectType"
            name="projectType"
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
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t} className="text-foreground">
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="lead-message" className={labelClass}>
          Message{" "}
          <span className="text-muted-foreground">
            (optional)
          </span>
        </label>
        <textarea
          id="lead-message"
          name="message"
          rows={4}
          placeholder="Tell us what you are building."
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
          "Send request"
        )}
      </Button>
    </form>
  );
}
