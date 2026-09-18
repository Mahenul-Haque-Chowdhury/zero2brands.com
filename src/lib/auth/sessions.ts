import "server-only";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const MAX_ACTIVE_SESSIONS = 2;
const HEARTBEAT_LIVE_WINDOW_MINUTES = 5;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function buildDeviceFingerprint(input: {
  userAgent: string;
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
}): string {
  const raw = `${input.userAgent}|${input.screenWidth ?? ""}x${input.screenHeight ?? ""}|${input.timezone ?? ""}`;
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Registers a new active session for the user, evicting the oldest session
 * if the user is already at the concurrent-session limit. This is the
 * platform's primary anti-account-sharing control (Phase 3.5).
 */
export async function registerSession(params: {
  userId: string;
  sessionToken: string;
  deviceFingerprint: string;
  userAgent: string;
  ipAddress: string;
}): Promise<{ evictedSessionId: string | null }> {
  const admin = createAdminClient();
  const tokenHash = hashToken(params.sessionToken);

  const cutoff = new Date(
    Date.now() - HEARTBEAT_LIVE_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const { data: liveSessions } = await admin
    .from("active_sessions")
    .select("id, last_heartbeat_at")
    .eq("user_id", params.userId)
    .gt("last_heartbeat_at", cutoff)
    .order("last_heartbeat_at", { ascending: true });

  let evictedSessionId: string | null = null;

  if (liveSessions && liveSessions.length >= MAX_ACTIVE_SESSIONS) {
    const oldest = liveSessions[0];
    await admin.from("active_sessions").delete().eq("id", oldest.id);
    evictedSessionId = oldest.id;
  }

  await admin.from("active_sessions").insert({
    user_id: params.userId,
    session_token_hash: tokenHash,
    device_fingerprint: params.deviceFingerprint,
    user_agent: params.userAgent,
    ip_address: params.ipAddress,
    last_heartbeat_at: new Date().toISOString(),
  });

  return { evictedSessionId };
}

/**
 * Updates the heartbeat for a session token. Returns `revoked: true` if the
 * session no longer exists (evicted by another device logging in), telling
 * the client to sign out.
 */
export async function heartbeatSession(params: {
  sessionToken: string;
}): Promise<{ revoked: boolean }> {
  const admin = createAdminClient();
  const tokenHash = hashToken(params.sessionToken);

  const { data, error } = await admin
    .from("active_sessions")
    .update({ last_heartbeat_at: new Date().toISOString() })
    .eq("session_token_hash", tokenHash)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { revoked: true };
  }

  return { revoked: false };
}

export async function isSessionLive(sessionToken: string): Promise<boolean> {
  const admin = createAdminClient();
  const tokenHash = hashToken(sessionToken);
  const cutoff = new Date(
    Date.now() - HEARTBEAT_LIVE_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const { data } = await admin
    .from("active_sessions")
    .select("id")
    .eq("session_token_hash", tokenHash)
    .gt("last_heartbeat_at", cutoff)
    .maybeSingle();

  return !!data;
}
