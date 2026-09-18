import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles Supabase's email-link confirmations: signup confirmation,
 * password recovery, email change, and invites all point here by default
 * ({{ .SiteURL }}/auth/confirm?token_hash=...&type=...), which is a
 * different flow from the OAuth `code` exchange in /auth/callback/route.ts.
 *
 * Signup confirmation lands the user on /onboarding (a fresh account has
 * never completed it); other types land on /dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next");

  const fallbackNext = type === "signup" ? "/onboarding" : "/dashboard";
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : fallbackNext;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
