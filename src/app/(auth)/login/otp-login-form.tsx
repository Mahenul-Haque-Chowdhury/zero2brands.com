"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  requestLoginOtpAction,
  verifyLoginOtpAction,
} from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OtpLoginForm() {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [requestState, requestAction, requestPending] = useActionState(
    requestLoginOtpAction,
    null
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyLoginOtpAction,
    null
  );

  // requestLoginOtpAction always resolves to { success: true } once the
  // request itself was accepted (rate limits/validation aside) — it never
  // reveals whether the phone is actually registered, so this advances the
  // UI regardless, same as the server's anti-enumeration behavior intends.
  const advancedForRequest = useRef<typeof requestState>(null);
  useEffect(() => {
    if (
      requestState &&
      requestState !== advancedForRequest.current &&
      "success" in requestState
    ) {
      advancedForRequest.current = requestState;
      setStep("code");
    }
  }, [requestState]);

  if (step === "phone") {
    return (
      <form
        action={(formData) => {
          setPhone(String(formData.get("phone") ?? ""));
          requestAction(formData);
        }}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-1.5">
          <Label htmlFor="otp-phone">Phone number</Label>
          <Input
            id="otp-phone"
            name="phone"
            type="tel"
            placeholder="01XXXXXXXXX"
            required
            autoComplete="tel"
            className="h-11 rounded-lg bg-secondary/60"
          />
        </div>
        {requestState && "error" in requestState ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {requestState.error}
          </p>
        ) : null}
        <Button type="submit" disabled={requestPending} size="lg" className="w-full">
          {requestPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending code
            </>
          ) : (
            "Send code"
          )}
        </Button>
      </form>
    );
  }

  return (
    <form action={verifyAction} className="flex flex-col gap-4">
      <input type="hidden" name="phone" value={phone} />
      <div className="grid gap-1.5">
        <Label htmlFor="otp-code">6-digit code</Label>
        <p className="text-xs text-muted-foreground">
          Sent to {phone}.{" "}
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Change number
          </button>
        </p>
        <Input
          id="otp-code"
          name="code"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="000000"
          required
          autoComplete="one-time-code"
          className="h-11 rounded-lg bg-secondary/60 text-center text-lg tracking-[0.4em]"
        />
      </div>
      {verifyState && "error" in verifyState ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {verifyState.error}
        </p>
      ) : null}
      <Button type="submit" disabled={verifyPending} size="lg" className="w-full">
        {verifyPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Verifying
          </>
        ) : (
          "Verify and log in"
        )}
      </Button>
    </form>
  );
}
