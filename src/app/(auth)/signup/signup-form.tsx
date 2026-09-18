"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signupAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/shared/google-sign-in-button";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, null);

  return (
    <div>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            required
            autoComplete="name"
            className="h-11 rounded-lg bg-secondary/60"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-11 rounded-lg bg-secondary/60"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="01XXXXXXXXX"
            required
            autoComplete="tel"
            className="h-11 rounded-lg bg-secondary/60"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-11 rounded-lg bg-secondary/60"
          />
        </div>
        {state && "error" in state ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} size="lg" className="w-full">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <GoogleSignInButton />
    </div>
  );
}
