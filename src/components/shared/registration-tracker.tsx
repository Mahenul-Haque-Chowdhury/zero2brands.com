"use client";

import { useEffect } from "react";
import { fireMetaPixelEvent } from "@/lib/analytics/meta-pixel";
import { fireGa4Event } from "@/lib/analytics/ga4";

const FLAG_KEY = "z2b_registration_tracked";

/**
 * Fires CompleteRegistration exactly once per browser, the first time a
 * user reaches the dashboard after finishing onboarding. Using a
 * localStorage flag rather than firing on every onboarding page visit
 * avoids double-counting for OAuth users who might revisit /onboarding.
 */
export function RegistrationTracker({ userId }: { userId: string }) {
  useEffect(() => {
    const key = `${FLAG_KEY}_${userId}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    fireMetaPixelEvent("CompleteRegistration", `reg_${userId}`);
    fireGa4Event("sign_up");
  }, [userId]);

  return null;
}
