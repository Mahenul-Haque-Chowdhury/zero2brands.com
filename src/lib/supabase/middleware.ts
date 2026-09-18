import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const PROTECTED_DASHBOARD_PREFIX = "/dashboard";
const PROTECTED_ADMIN_PREFIX = "/admin";
const AUTH_PAGES = ["/login", "/signup"];
const LAST_SEEN_UPDATE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Validates that `next` is a safe same-origin relative path before using it
 * as a redirect target, closing the open-redirect hole a raw query param
 * would create (e.g. `/login?next=//evil.com`).
 */
export function sanitizeNextParam(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session (required — do not remove this call, it keeps
  // server components' cookie-derived session in sync).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.startsWith(PROTECTED_DASHBOARD_PREFIX);
  const isAdminRoute = pathname.startsWith(PROTECTED_ADMIN_PREFIX);
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (!user && (isDashboardRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_banned, onboarding_completed, last_seen_at")
      .eq("id", user.id)
      .single();

    if (profile?.is_banned) {
      const url = request.nextUrl.clone();
      url.pathname = "/suspended";
      url.search = "";
      if (pathname !== "/suspended") {
        return NextResponse.redirect(url);
      }
    }

    if (
      isAdminRoute &&
      profile &&
      !["admin", "superadmin", "instructor"].includes(profile.role)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (
      isDashboardRoute &&
      !pathname.startsWith("/dashboard/settings") && // allow reaching settings while incomplete
      profile &&
      !profile.onboarding_completed &&
      pathname !== "/onboarding"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Throttled last_seen_at update: at most once per 5 minutes, and never
    // blocking the response — fire and forget.
    const lastSeen = profile?.last_seen_at
      ? new Date(profile.last_seen_at).getTime()
      : 0;
    if (Date.now() - lastSeen > LAST_SEEN_UPDATE_INTERVAL_MS) {
      void supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", user.id)
        .then(() => {});
    }
  }

  return supabaseResponse;
}
