"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
      <div className="flex flex-wrap gap-2 rounded-lg border p-3 text-sm">
        {links.whatsapp ? (
          <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="underline">
            WhatsApp group
          </a>
        ) : null}
        {links.facebook ? (
          <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="underline">
            Facebook group
          </a>
        ) : null}
        {links.telegram ? (
          <a href={links.telegram} target="_blank" rel="noopener noreferrer" className="underline">
            Telegram
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleReveal} disabled={pending} className="w-fit">
      {pending ? "Loading…" : "Show group links"}
    </Button>
  );
}
