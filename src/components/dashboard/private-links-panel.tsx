"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, MessageCircle, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBatchPrivateLinks } from "@/lib/batches/actions";

export function PrivateLinksPanel({ batchId }: { batchId: string }) {
  const [links, setLinks] = useState<{
    whatsapp: string | null;
    facebook: string | null;
    telegram: string | null;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleReveal() {
    startTransition(async () => {
      const result = await getBatchPrivateLinks(batchId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setLinks(result);
    });
  }

  if (links) {
    return (
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3">
        {links.whatsapp ? (
          <a
            href={links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <MessageCircle className="size-3.5" />
            WhatsApp group
          </a>
        ) : null}
        {links.facebook ? (
          <a
            href={links.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Users className="size-3.5" />
            Facebook group
          </a>
        ) : null}
        {links.telegram ? (
          <a
            href={links.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Send className="size-3.5" />
            Telegram
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReveal}
      disabled={pending}
      className="w-fit"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Loading
        </>
      ) : (
        "Show group links"
      )}
    </Button>
  );
}
