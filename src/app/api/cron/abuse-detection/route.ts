import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Nightly job. Flags (never auto-bans, per Phase 14.6 — Bangladeshi mobile
 * carriers rotate IPs aggressively and false positives are common) accounts
 * with unusual token volume, many distinct IPs, or many device
 * fingerprints, surfacing them on the admin watchlist via audit_log for
 * human review.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: recentAccess } = await admin
    .from("video_access_log")
    .select("user_id, ip_address, token_issued_at")
    .gte("token_issued_at", since);

  const byUser = new Map<string, { ips: Set<string>; count: number }>();
  for (const row of recentAccess ?? []) {
    if (!row.user_id) continue;
    const entry = byUser.get(row.user_id) ?? { ips: new Set<string>(), count: 0 };
    if (row.ip_address) entry.ips.add(String(row.ip_address));
    entry.count++;
    byUser.set(row.user_id, entry);
  }

  const { data: recentSessions } = await admin
    .from("active_sessions")
    .select("user_id, device_fingerprint")
    .gte("created_at", since);

  const devicesByUser = new Map<string, Set<string>>();
  for (const row of recentSessions ?? []) {
    if (!row.device_fingerprint) continue;
    const set = devicesByUser.get(row.user_id) ?? new Set<string>();
    set.add(row.device_fingerprint);
    devicesByUser.set(row.user_id, set);
  }

  // Compute the 95th percentile of token request counts to flag outliers,
  // rather than a fixed magic number that breaks as usage patterns shift.
  const counts = [...byUser.values()].map((v) => v.count).sort((a, b) => a - b);
  const p95Index = Math.floor(counts.length * 0.95);
  const p95Threshold = counts[p95Index] ?? Infinity;

  const flagged: string[] = [];

  for (const [userId, entry] of byUser.entries()) {
    const distinctDevices = devicesByUser.get(userId)?.size ?? 0;
    const reasons: string[] = [];

    if (entry.ips.size > 8) reasons.push("more than 8 distinct IPs in 24h");
    if (distinctDevices > 3) reasons.push("more than 3 device fingerprints");
    if (counts.length > 10 && entry.count > p95Threshold) {
      reasons.push("token request volume above 95th percentile");
    }

    if (reasons.length > 0) {
      flagged.push(userId);
      await admin.from("audit_log").insert({
        action: "abuse_watchlist_flag",
        entity_type: "profile",
        entity_id: userId,
        after: {
          reasons,
          distinctIps: entry.ips.size,
          distinctDevices,
          tokenRequests: entry.count,
        },
      });
    }
  }

  return NextResponse.json({ flaggedCount: flagged.length });
}
