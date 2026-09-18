"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { submitStoreRequestAction } from "./actions";
import { fireGa4Event } from "@/lib/analytics/ga4";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function StoreRequestForm({ profile }: { profile: Profile }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitStoreRequestAction(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setError(null);
      setDone(true);
      fireGa4Event("grayvally_cta_submission");
    });
  }

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent">
            <CheckCircle2 className="size-5" />
          </span>
          <p className="text-sm text-muted-foreground">
            Thanks, GrayVally will reach out to you soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              name="businessName"
              defaultValue={profile.business_name ?? ""}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="productCategory">Product category</Label>
            <Input
              id="productCategory"
              name="productCategory"
              defaultValue={profile.business_category ?? ""}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="budgetRange">Budget range</Label>
            <Input id="budgetRange" name="budgetRange" placeholder="e.g. 20,000 to 50,000 BDT" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Anything else?</Label>
            <Textarea id="message" name="message" rows={3} />
          </div>
          {error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting
              </>
            ) : (
              "Submit request"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
