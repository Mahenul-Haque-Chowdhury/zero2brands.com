"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function BuyButton({
  productId,
  fullWidth,
}: {
  productId: string;
  fullWidth?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?next=/course`);
        return;
      }

      const res = await fetch("/api/payments/bkash/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not start checkout.");
        return;
      }

      window.location.href = data.bkashURL;
    });
  }

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={pending}
      className={fullWidth ? "w-full" : undefined}
    >
      {pending ? "Starting checkout…" : "Enroll now with bKash"}
    </Button>
  );
}
