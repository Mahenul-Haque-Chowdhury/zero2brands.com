"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const HEARTBEAT_INTERVAL_MS = 60 * 1000;
const SESSION_TOKEN_STORAGE_KEY = "z2b_device_session_token";

function getOrCreateSessionToken(): string {
  let token = sessionStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
  if (!token) {
    token = crypto.randomUUID();
    sessionStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
  }
  return token;
}

/**
 * Registers this device/tab as an active session on mount, then heartbeats
 * every 60 seconds while the tab is visible. If the server reports the
 * session was revoked (evicted by another device logging in, hitting the
 * 2-device limit), signs the user out with a clear message.
 *
 * Mount this once near the root of the authenticated dashboard layout.
 */
export function useSessionHeartbeat() {
  const router = useRouter();
  const registeredRef = useRef(false);

  useEffect(() => {
    const token = getOrCreateSessionToken();

    async function send(register: boolean) {
      try {
        const res = await fetch("/api/session/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionToken: token,
            register,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        });
        const data = await res.json().catch(() => ({ revoked: false }));
        if (data.revoked) {
          const supabase = createClient();
          await supabase.auth.signOut();
          toast.error(
            "You were signed out because your account was used on another device."
          );
          router.push("/login");
        }
      } catch {
        // Network hiccup: do not sign the user out over a transient failure.
      }
    }

    if (!registeredRef.current) {
      registeredRef.current = true;
      void send(true);
    }

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        void send(false);
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [router]);
}
