"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  onboardingSchema,
  requestLoginOtpSchema,
  verifyLoginOtpSchema,
  normalizeBdPhone,
} from "@/lib/validations/auth";
import { checkRateLimit, limiters } from "@/lib/ratelimit/index";
import { sendLoginOtp, verifyLoginOtp } from "@/lib/auth/otp";

export type ActionResult = { error: string } | { success: true };
export type SignupResult =
  | { error: string }
  | { success: true; needsEmailConfirmation: boolean };

async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function signupAction(
  _prev: SignupResult | null,
  formData: FormData
): Promise<SignupResult> {
  const ip = await getClientIp();
  const rl = await checkRateLimit(limiters.signupPerIp, ip);
  if (!rl.success) {
    return { error: "Too many signup attempts. Please try again later." };
  }

  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { fullName, email, phone, password } = parsed.data;

  // Duplicate phone check up front (unique constraint also backs this).
  const admin = createAdminClient();
  const { data: existingPhone } = await admin
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existingPhone) {
    return { error: "This phone number is already registered." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Phone is stored after handle_new_user creates the profile row. Best
  // effort here; onboarding also collects it if this update races the
  // trigger.
  const { data: userRes } = await supabase.auth.getUser();

  // With "Confirm sign up" enabled in Supabase, signUp() succeeds but
  // returns no session until the user clicks the emailed confirmation
  // link — getUser() returns null in that case. Redirecting to /onboarding
  // then would just bounce them to /login with no explanation, so surface
  // a "check your email" state instead of assuming a session exists.
  if (!userRes.user) {
    return { success: true, needsEmailConfirmation: true };
  }

  await supabase.from("profiles").update({ phone }).eq("id", userRes.user.id);

  redirect("/onboarding");
}

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { identifier, password } = parsed.data;
  const ip = await getClientIp();

  // The login field accepts either an email or a BD phone number. If it
  // normalises as a phone, resolve the account's email server-side first —
  // Supabase's password grant only accepts email, phone isn't a login
  // credential on the auth.users side.
  const asPhone = normalizeBdPhone(identifier);
  let email: string;

  if (asPhone) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("email")
      .eq("phone", asPhone)
      .maybeSingle();

    if (!profile) {
      // Same generic message as a wrong password, so this can't be used to
      // enumerate which phone numbers are registered.
      return { error: "Invalid email/phone or password." };
    }
    email = profile.email;
  } else {
    const emailParse = z.string().trim().toLowerCase().email().safeParse(identifier);
    if (!emailParse.success) {
      return { error: "Enter a valid email or Bangladeshi phone number." };
    }
    email = emailParse.data;
  }

  const [emailLimit, ipLimit] = await Promise.all([
    checkRateLimit(limiters.loginPerEmail, email),
    checkRateLimit(limiters.loginPerIp, ip),
  ]);

  if (!emailLimit.success || !ipLimit.success) {
    return { error: "Too many login attempts. Please try again later." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid email/phone or password." };
  }

  redirect("/dashboard");
}

/**
 * Step 1 of OTP login: send a 6-digit code by SMS to a phone that already
 * belongs to a registered account. Returns a generic success either way so
 * this can't be used to enumerate registered phone numbers — the SMS itself
 * only sends when a matching profile exists.
 */
export async function requestLoginOtpAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = requestLoginOtpSchema.safeParse({
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { phone } = parsed.data;
  const ip = await getClientIp();

  const [phoneLimit, ipLimit] = await Promise.all([
    checkRateLimit(limiters.otpRequestPerPhone, phone),
    checkRateLimit(limiters.otpRequestPerIp, ip),
  ]);

  if (!phoneLimit.success || !ipLimit.success) {
    return { error: "Too many code requests. Please try again later." };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (profile) {
    await sendLoginOtp(phone);
  }

  return { success: true };
}

/**
 * Step 2 of OTP login: verify the code, then establish a real Supabase
 * session server-side via generateLink + verifyOtp (the standard pattern
 * for a custom OTP flow that still needs to end in a normal session cookie,
 * since the service-role client cannot sign a user in directly).
 */
export async function verifyLoginOtpAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = verifyLoginOtpSchema.safeParse({
    phone: formData.get("phone"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { phone, code } = parsed.data;

  const rl = await checkRateLimit(limiters.otpVerifyPerPhone, phone);
  if (!rl.success) {
    return { error: "Too many attempts. Please request a new code." };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("phone", phone)
    .maybeSingle();

  if (!profile) {
    return { error: "Invalid or expired code." };
  }

  const result = await verifyLoginOtp(phone, code);
  if (!result.ok) {
    if (result.reason === "expired") {
      return { error: "That code has expired. Request a new one." };
    }
    if (result.reason === "too_many_attempts") {
      return { error: "Too many attempts. Request a new code." };
    }
    return { error: "Invalid or expired code." };
  }

  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email: profile.email,
    });

  if (linkError || !linkData.properties?.hashed_token) {
    return { error: "Something went wrong. Please try again." };
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "email",
    token_hash: linkData.properties.hashed_token,
  });

  if (verifyError) {
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}

export async function signInWithGoogleAction(next?: string) {
  const supabase = await createClient();
  const h = await headers();
  const origin = h.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;

  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth_failed");
  }

  redirect(data.url);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const rl = await checkRateLimit(
    limiters.passwordResetPerEmail,
    parsed.data.email
  );
  if (!rl.success) {
    return { error: "Too many reset attempts. Please try again later." };
  }

  const supabase = await createClient();
  const h = await headers();
  const origin = h.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;

  // Always return success regardless of whether the email exists, so this
  // endpoint cannot be used to enumerate registered emails.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/reset-password`,
  });

  return { success: true };
}

export async function resetPasswordAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?reset=success");
}

export async function completeOnboardingAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = onboardingSchema.safeParse({
    phone: formData.get("phone"),
    district: formData.get("district"),
    businessName: formData.get("businessName"),
    visibility: formData.get("visibility") || "students_only",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      phone: parsed.data.phone,
      district: parsed.data.district,
      business_name: parsed.data.businessName || null,
      visibility: parsed.data.visibility,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "This phone number may already be in use." };
  }

  redirect("/dashboard");
}
