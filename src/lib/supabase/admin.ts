import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { serverEnv } from "@/lib/env";

/**
 * Service-role Supabase client. BYPASSES ROW LEVEL SECURITY ENTIRELY.
 *
 * Use this in exactly three places, per the build plan's non-negotiable
 * security rules:
 *   1. The bKash payment routes (create/callback/execute/query/refund,
 *      reconciliation cron).
 *   2. Admin mutations, and only AFTER an explicit role check via
 *      requireAdmin() — never as a shortcut around RLS for convenience.
 *   3. Cron jobs.
 *
 * Never import this into a client component. The `server-only` guard above
 * makes that a build failure rather than a runtime leak.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
