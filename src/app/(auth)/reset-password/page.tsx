"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { resetPasswordAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    null
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Choose a new password
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Use at least 8 characters. You&apos;ll be signed in with this
          password next time.
        </p>
      </div>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
            className="h-11 rounded-lg bg-secondary/60"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={8}
            required
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
              Saving
            </>
          ) : (
            "Save new password"
          )}
        </Button>
      </form>
    </div>
  );
}
