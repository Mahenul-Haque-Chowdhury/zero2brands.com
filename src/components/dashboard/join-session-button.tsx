"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getZoomJoinUrl } from "@/lib/batches/actions";

export function JoinSessionButton({ liveSessionId }: { liveSessionId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await getZoomJoinUrl(liveSessionId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <Button
      size="sm"
      onClick={handleClick}
      disabled={pending}
      className="shrink-0 transition-transform duration-200 active:scale-[0.98]"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Loading
        </>
      ) : (
        <>
          <Video className="size-4" />
          Join session
        </>
      )}
    </Button>
  );
}
