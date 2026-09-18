"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { loginAction } from "@/lib/auth/actions";
import { GoogleSignInButton } from "@/components/shared/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpLoginForm } from "./otp-login-form";
import { cn } from "cn";

function PasswordLoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="grid gap-1.5">
        <Label htmlFor="identifier">Email or phone number</Label>
        <Input
          id="identifier"
          name="identifier"
          type="text"
          required
          autoComplete="username"
          placeholder="you@example.com or 01XXXXXXXXX"
          className="h-11 rounded-lg bg-secondary/60"
        />
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-accent underline-offset-4 transition-colors hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
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
            Logging in
          </>
        ) : (
          "Log in"
        )}
      </Button>
    </form>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? undefined;
  const [method, setMethod] = useState<"password" | "otp">("password");

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-secondary/60 p-1">
        <button
          type="button"
          onClick={() => setMethod("password")}
          className={cn(
            "rounded-md py-1.5 text-sm font-medium transition-colors",
            method === "password"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMethod("otp")}
          className={cn(
            "rounded-md py-1.5 text-sm font-medium transition-colors",
            method === "otp"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          SMS code
        </button>
      </div>

      {method === "password" ? (
        <PasswordLoginForm next={next} />
      ) : (
        <OtpLoginForm />
      )}

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <GoogleSignInButton next={next} />
    </div>
  );
}
