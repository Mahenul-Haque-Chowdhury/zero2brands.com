import "server-only";
import { createHash, randomInt } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { queueSms } from "@/lib/sms/gateway";

const CODE_LENGTH = 6;
const CODE_TTL_MINUTES = 5;
const MAX_VERIFY_ATTEMPTS = 5;

function hashCode(code: string, phone: string): string {
  // Salted with the phone number so two users who happen to draw the same
  // 6-digit code don't produce the same hash.
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

function generateCode(): string {
  return randomInt(0, 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, "0");
}

/**
 * Generates and sends a login OTP to the given (already-normalised) BD
 * phone number, storing only its hash. Call sites are responsible for rate
 * limiting and for deciding whether the phone should be allowed to request
 * one (e.g. must already belong to a registered account for login).
 */
export async function sendLoginOtp(phone: string): Promise<void> {
  const admin = createAdminClient();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await admin.from("otp_codes").insert({
    phone,
    purpose: "login",
    code_hash: hashCode(code, phone),
    expires_at: expiresAt.toISOString(),
  });

  await queueSms({
    template: "otp",
    to: phone,
    data: { code },
  });
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "too_many_attempts" };

/**
 * Verifies a submitted OTP against the most recent unconsumed code for this
 * phone/purpose. Single-use: marks the row consumed on success so it can't
 * be replayed, and caps verification attempts per code to blunt brute force
 * against the 6-digit space.
 */
export async function verifyLoginOtp(
  phone: string,
  code: string
): Promise<VerifyOtpResult> {
  const admin = createAdminClient();

  const { data: row } = await admin
    .from("otp_codes")
    .select("id, code_hash, attempts, expires_at, consumed_at")
    .eq("phone", phone)
    .eq("purpose", "login")
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row) {
    return { ok: false, reason: "invalid" };
  }

  if (new Date(row.expires_at) < new Date()) {
    return { ok: false, reason: "expired" };
  }

  if (row.attempts >= MAX_VERIFY_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" };
  }

  const submittedHash = hashCode(code, phone);
  if (submittedHash !== row.code_hash) {
    await admin
      .from("otp_codes")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id);
    return { ok: false, reason: "invalid" };
  }

  await admin
    .from("otp_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", row.id);

  return { ok: true };
}
