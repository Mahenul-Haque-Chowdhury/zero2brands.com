"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function RevokeDeviceButton({ sessionId }: { sessionId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("active_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) {
        toast.error("Could not sign out that device.");
        return;
      }
      toast.success("Device signed out.");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={handleClick}
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
