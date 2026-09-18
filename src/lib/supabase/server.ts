import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { serverEnv } from "@/lib/env";

/**
 * Server Supabase client for Server Components, Server Actions and Route
 * Handlers. Uses the anon key plus the request's cookies, so RLS applies as
 * the logged-in user — this is NOT a privileged client.
 *
 * In a Server Component, cookies() is read-only, so `set`/`remove` are
 * no-ops there; middleware.ts is what actually refreshes the session cookie
 * on every request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component where cookies() is read-only.
            // Middleware handles the actual session refresh, so this is safe
            // to swallow.
          }
        },
      },
    }
  );
}
