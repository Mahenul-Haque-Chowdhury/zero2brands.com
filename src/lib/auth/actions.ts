"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  onboardingSchema,
} from "@/lib/validations/auth";
import { checkRateLimit, limiters } from "@/lib/ratelimit/index";

export type ActionResult = { error: string } | { success: true };

async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function signupAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
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
  if (userRes.user) {
    await supabase
      .from("profiles")
      .update({ phone })
      .eq("id", userRes.user.id);
  }

  redirect("/onboarding");
}

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;
  const ip = await getClientIp();

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
    return { error: "Invalid email or password." };
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
