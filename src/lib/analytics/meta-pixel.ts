"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a browser-side Meta Pixel event with a client-generated eventID
 * that must ALSO be passed to the server-side CAPI call for the same
 * logical event, so Meta deduplicates rather than double-counting revenue.
 */
export function fireMetaPixelEvent(
  eventName: string,
  eventId: string,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", eventName, params ?? {}, { eventID: eventId });
}

export function fireMetaPixelPageView() {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", "PageView");
}
