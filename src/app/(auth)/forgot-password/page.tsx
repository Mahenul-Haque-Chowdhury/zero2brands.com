"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    null
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We&apos;ll email you a link to reset it.
        </p>
      </div>
      {state && "success" in state ? (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent">
            <CheckCircle2 className="size-5" />
          </span>
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, a reset link is on its
            way. Check your inbox.
          </p>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
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
                Sending
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      )}
      <p className="text-center text-sm text-muted-foreground">
        Remembered it after all?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
        >
          Back to log in
        </Link>
      </p>
    </div>
  );
}
