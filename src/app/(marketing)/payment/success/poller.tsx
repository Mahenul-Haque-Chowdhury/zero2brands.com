"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 90_000;

export function SuccessPagePoller({ invoice }: { invoice: string }) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const start = Date.now();
    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      if (Date.now() - start > MAX_POLL_MS) {
        setTimedOut(true);
        return;
      }

      try {
        const res = await fetch(
          `/api/payments/bkash/status?invoice=${encodeURIComponent(invoice)}`
        );
        const data = await res.json();
        if (data.status === "completed") {
          window.location.reload();
          return;
        }
        if (data.status === "failed" || data.status === "cancelled") {
          window.location.href = `/payment/${data.status}`;
          return;
        }
      } catch {
        // Ignore transient errors and keep polling.
      }

      setTimeout(poll, POLL_INTERVAL_MS);
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [invoice]);

  if (timedOut) {
    return (
      <p className="max-w-sm text-sm text-muted-foreground">
        This is taking longer than usual. Your invoice number is{" "}
        <strong className="text-foreground">{invoice}</strong>, please
        contact support with this number if access doesn&apos;t appear
        within a few minutes.
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      Invoice: <strong className="text-foreground">{invoice}</strong>
    </p>
  );
}
