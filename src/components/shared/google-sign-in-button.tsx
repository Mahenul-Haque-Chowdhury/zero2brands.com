"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { signInWithGoogleAction } from "@/lib/auth/actions";

export function GoogleSignInButton({ next }: { next?: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={pending}
      onClick={() => startTransition(() => signInWithGoogleAction(next))}
    >
      {pending ? "Redirecting…" : "Continue with Google"}
    </Button>
  );
}
