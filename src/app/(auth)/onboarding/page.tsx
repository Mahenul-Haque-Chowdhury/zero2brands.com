"use client";

import { useActionState, useState } from "react";
import { completeOnboardingAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DISTRICTS = [
  "Dhaka", "Chattogram", "Khulna", "Rajshahi", "Sylhet", "Barishal",
  "Rangpur", "Mymensingh", "Comilla", "Gazipur", "Narayanganj", "Other",
];

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    null
  );
  const [district, setDistrict] = useState("");
  const [visibility, setVisibility] = useState("students_only");

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          A few more details
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We need your phone number to run your enrollment and support.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form action={formAction} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="district">District</Label>
              <Select
                value={district}
                onValueChange={(v) => setDistrict(v ?? "")}
              >
                <SelectTrigger id="district" className="w-full">
                  <SelectValue placeholder="Select your district" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="district" value={district} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="businessName">
                Business name{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input id="businessName" name="businessName" />
            </div>
            <div className="grid gap-2">
              <Label>Who can see your profile?</Label>
              <Select
                value={visibility}
                onValueChange={(v) => setVisibility(v ?? "students_only")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="students_only">
                    Other students only
                  </SelectItem>
                  <SelectItem value="public">
                    Public (anyone visiting the site)
                  </SelectItem>
                  <SelectItem value="private">
                    Private (hidden from the directory)
                  </SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="visibility" value={visibility} />
              <p className="text-xs text-muted-foreground">
                Other enrolled students may see your name, district and
                business name depending on this setting. You can change it
                anytime in Settings.
              </p>
            </div>
            {state && "error" in state ? (
              <p className="text-sm text-destructive">{state.error}</p>
            ) : null}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving…" : "Continue to dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
