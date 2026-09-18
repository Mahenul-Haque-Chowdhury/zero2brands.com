"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const PROGRESS_SEND_INTERVAL_MS = 15_000;
const WATERMARK_REPOSITION_MS = 25_000;
const SESSION_TOKEN_STORAGE_KEY = "z2b_device_session_token";

interface VideoPlayerProps {
  lessonId: string;
  courseId: string;
  /** Shown in the visible watermark overlay — typically the student's phone. */
  watermarkLabel: string;
}

function getSessionToken(): string {
  if (typeof window === "undefined") return "";
  let token = sessionStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
  if (!token) {
    token = crypto.randomUUID();
    sessionStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
  }
  return token;
}

/**
 * Bunny iframe embed with a signed, short-lived token plus a dynamic
 * watermark overlay. Per Phase 5.3 of the build plan: this is deliberate
 * defense-in-depth, not a claim of being uncrackable — someone technical
 * can still load the signed URL directly. Bunny's own server-side
 * watermark (configured in the library, if available on the plan) is the
 * durable layer; this CSS overlay is the visible deterrent and, combined
 * with the phone number shown, the traceability layer.
 */
export function VideoPlayer({ lessonId, courseId, watermarkLabel }: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watermarkPos, setWatermarkPos] = useState({ top: "10%", left: "10%" });
  const containerRef = useRef<HTMLDivElement>(null);
  const lastReportedRef = useRef({ watchedSeconds: 0, positionSeconds: 0 });
  const watchedAccumulatorRef = useRef(0);

  const fetchToken = useCallback(async () => {
    try {
      const res = await fetch("/api/video/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, sessionToken: getSessionToken() }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "session_expired") {
          toast.error("Please sign in again to continue watching.");
        }
        setError(data.message ?? "This lesson is not available right now.");
        return;
      }

      setEmbedUrl(data.url);
      setError(null);
    } catch {
      setError("Could not load the video. Check your connection.");
    }
  }, [lessonId]);

  useEffect(() => {
    void fetchToken();
    // Re-fetch a fresh token well before the 3h expiry if the tab stays
    // open that long.
    const refreshInterval = setInterval(fetchToken, 2.5 * 60 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [fetchToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos({
        top: `${10 + Math.random() * 70}%`,
        left: `${10 + Math.random() * 70}%`,
      });
    }, WATERMARK_REPOSITION_MS);
    return () => clearInterval(interval);
  }, []);

  const sendProgress = useCallback(
    (ended = false) => {
      const payload = {
        lessonId,
        courseId,
        watchedSeconds: watchedAccumulatorRef.current,
        lastPositionSeconds: lastReportedRef.current.positionSeconds,
        ended,
      };
      navigator.sendBeacon?.(
        "/api/video/progress",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      ) ??
        fetch("/api/video/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
    },
    [lessonId, courseId]
  );

  useEffect(() => {
    // Bunny's player posts postMessage events; listen for time updates to
    // drive both the accumulator and periodic sends. Debounced to once per
    // PROGRESS_SEND_INTERVAL_MS via the interval below rather than on
    // every message.
    function handleMessage(event: MessageEvent) {
      if (!event.origin.includes("mediadelivery.net")) return;
      const data = event.data;
      if (data && typeof data === "object" && "currentTime" in data) {
        lastReportedRef.current.positionSeconds = Math.round(
          Number(data.currentTime) || 0
        );
        watchedAccumulatorRef.current += 1; // coarse: one tick per message
      }
      if (data && data.event === "ended") {
        sendProgress(true);
      }
    }

    window.addEventListener("message", handleMessage);
    const sendInterval = setInterval(() => sendProgress(false), PROGRESS_SEND_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        sendProgress(false);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(sendInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      sendProgress(false);
    };
  }, [sendProgress]);

  if (error) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full overflow-hidden rounded-lg bg-black"
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: "none" }}
    >
      {embedUrl ? (
        <iframe
          src={embedUrl}
          loading="lazy"
          className="h-full w-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-white/60">
          Loading video…
        </div>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute select-none rounded bg-black/30 px-2 py-1 text-xs font-medium text-white/70 transition-all duration-1000"
        style={{ top: watermarkPos.top, left: watermarkPos.left }}
      >
        {watermarkLabel}
      </div>
    </div>
  );
}
