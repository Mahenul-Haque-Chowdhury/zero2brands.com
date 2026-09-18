"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    null
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll email you a link to reset it.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {state && "success" in state ? (
            <p className="text-sm text-muted-foreground">
              If an account exists for that email, a reset link is on its
              way. Check your inbox.
            </p>
          ) : (
            <form action={formAction} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              {state && "error" in state ? (
                <p className="text-sm text-destructive">{state.error}</p>
              ) : null}
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
