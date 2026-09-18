"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitLeadAction } from "@/lib/leads/actions";
import { fireMetaPixelEvent } from "@/lib/analytics/meta-pixel";
import { fireGa4Event } from "@/lib/analytics/ga4";

export function LeadForm({ source }: { source: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      fireMetaPixelEvent("Lead", `lead_${source}_${Date.now()}`, { content_name: source });
      fireGa4Event("generate_lead", { source });
    });
  }

  if (done) {
    return (
      <p className="rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
        Thanks, we received your request and will be in touch soon.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" name="phone" type="tel" placeholder="01XXXXXXXXX" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" name="email" type="email" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Message (optional)</Label>
        <Textarea id="message" name="message" rows={3} />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-fit"
      >
        {pending ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
