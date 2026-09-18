"use client";

import { useEffect } from "react";
import { fireMetaPixelEvent } from "@/lib/analytics/meta-pixel";
import { fireGa4Event } from "@/lib/analytics/ga4";

export function ViewContentTracker({
  contentId,
  contentName,
}: {
  contentId: string;
  contentName: string;
}) {
  useEffect(() => {
    fireMetaPixelEvent("ViewContent", `view_${contentId}_${Date.now()}`, {
      content_ids: [contentId],
      content_name: contentName,
    });
    fireGa4Event("view_item", { item_id: contentId, item_name: contentName });
    // Fires once per mount, which is once per page view — correct here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
