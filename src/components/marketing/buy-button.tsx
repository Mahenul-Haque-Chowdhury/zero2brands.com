"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { fireMetaPixelEvent } from "@/lib/analytics/meta-pixel";
import { fireGa4Event } from "@/lib/analytics/ga4";

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

      // Shared event_id with the server-side CAPI Purchase event fired
      // from the grant path uses the invoice number, so this
      // InitiateCheckout uses it too for consistent Meta reporting.
      fireMetaPixelEvent("InitiateCheckout", data.invoiceNumber, {
        content_ids: [productId],
      });
      fireGa4Event("begin_checkout", { product_id: productId });

      window.location.href = data.bkashURL;
    });
  }

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={pending}
      className={`h-12 bg-accent px-8 text-base font-medium text-accent-foreground hover:bg-accent/90 ${fullWidth ? "w-full" : ""}`}
    >
      {pending ? "Starting checkout..." : "Enroll now with bKash"}
    </Button>
  );
}
