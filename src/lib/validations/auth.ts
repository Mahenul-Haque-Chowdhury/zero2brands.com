import { z } from "zod";

// Bangladeshi mobile number: optional +88/88 prefix, then 01 followed by a
// valid operator digit (3-9) and 8 more digits.
export const BD_PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;

/**
 * Normalises a Bangladeshi phone number to the canonical `01XXXXXXXXX` form
 * so duplicate detection and SMS sending work off one consistent shape.
 * Returns null if the input does not match a valid BD mobile number.
 */
export function normalizeBdPhone(raw: string): string | null {
  const trimmed = raw.trim().replace(/[\s-]/g, "");
  if (!BD_PHONE_REGEX.test(trimmed)) return null;
  const digitsOnly = trimmed.replace(/^\+?88/, "");
  return digitsOnly;
}

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "qwerty123",
  "letmein1",
  "11111111",
  "abc12345",
  "iloveyou",
]);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine(
    (val) => !COMMON_PASSWORDS.has(val.toLowerCase()),
    "This password is too common. Please choose another."
  );

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .refine((val) => normalizeBdPhone(val) !== null, {
      message: "Enter a valid Bangladeshi mobile number",
    })
    .transform((val) => normalizeBdPhone(val)!),
  password: passwordSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z.object({
  phone: z
    .string()
    .trim()
    .refine((val) => normalizeBdPhone(val) !== null, {
      message: "Enter a valid Bangladeshi mobile number",
    })
    .transform((val) => normalizeBdPhone(val)!),
  district: z.string().trim().min(2, "Please select your district"),
  businessName: z.string().trim().max(200).optional().or(z.literal("")),
  visibility: z.enum(["public", "students_only", "private"]).default(
    "students_only"
  ),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
