"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fireMetaPixelEvent } from "@/lib/analytics/meta-pixel";
import { fireGa4Event } from "@/lib/analytics/ga4";

/** Shown once course progress passes 80%, per Phase 10.3 of the plan. */
export function GrayVallyCta() {
  useEffect(() => {
    fireMetaPixelEvent("ViewContent", `grayvally_cta_impression_${Date.now()}`, {
      content_name: "grayvally_cta",
    });
    fireGa4Event("grayvally_cta_impression");
  }, []);

  function handleClick() {
    fireGa4Event("grayvally_cta_click");
  }

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardContent className="flex flex-col items-start gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Rocket className="size-4" />
          </span>
          <div>
            <p className="font-medium">Ready to launch?</p>
            <p className="text-sm text-muted-foreground">
              Let our partner GrayVally build your store.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleClick}
          className="w-full sm:w-auto"
          render={<Link href="/dashboard/store-request">Get started</Link>}
        />
      </CardContent>
    </Card>
  );
}
