"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Fetches the Zoom join URL for a live session on click, via a server
 * action — never rendered into the initial page HTML. If it were in page
 * source, it would end up screenshotted and shared. RLS
 * (live_sessions_select_access) additionally enforces has_batch_access on
 * the underlying query, so this is defense in depth, not the only gate.
 */
export async function getZoomJoinUrl(
  liveSessionId: string
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: session } = await supabase
    .from("live_sessions")
    .select("zoom_join_url, scheduled_at, duration_minutes, is_cancelled")
    .eq("id", liveSessionId)
    .maybeSingle();

  if (!session || session.is_cancelled) {
    return { error: "This session is not available." };
  }

  const now = Date.now();
  const scheduledTime = new Date(session.scheduled_at).getTime();
  const windowStart = scheduledTime - 15 * 60 * 1000;
  const windowEnd =
    scheduledTime + (session.duration_minutes + 60) * 60 * 1000;

  if (now < windowStart || now > windowEnd) {
    return {
      error:
        "The join link becomes available 15 minutes before the session starts.",
    };
  }

  if (!session.zoom_join_url) {
    return { error: "The join link has not been added yet." };
  }

  await supabase.from("session_attendance").upsert(
    { live_session_id: liveSessionId, user_id: user.id, joined_at: new Date().toISOString() },
    { onConflict: "live_session_id,user_id" }
  );

  return { url: session.zoom_join_url };
}

/** Fetches batch private group links (WhatsApp/Facebook/Telegram) on demand. */
export async function getBatchPrivateLinks(
  batchId: string
): Promise<
  | { whatsapp: string | null; facebook: string | null; telegram: string | null }
  | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data } = await supabase
    .from("batch_private_links")
    .select("whatsapp_group_url, facebook_group_url, telegram_url")
    .eq("batch_id", batchId)
    .maybeSingle();

  if (!data) {
    return { error: "Not available." };
  }

  return {
    whatsapp: data.whatsapp_group_url,
    facebook: data.facebook_group_url,
    telegram: data.telegram_url,
  };
}
