"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeBdPhone } from "@/lib/validations/auth";
import { checkRateLimit, limiters } from "@/lib/ratelimit/index";
import { queueEmail } from "@/lib/email/resend";

const leadSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim(),
  email: z.string().trim().email().optional().or(z.literal("")),
  businessName: z.string().trim().max(200).optional(),
  projectType: z.string().trim().max(100).optional(),
  message: z.string().trim().max(2000).optional(),
  source: z.string().trim().max(50),
});

export async function submitLeadAction(
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";

  const rl = await checkRateLimit(limiters.publicFormPerIp, ip);
  if (!rl.success) {
    return { error: "Too many submissions. Please try again later." };
  }

  const parsed = leadSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    businessName: formData.get("businessName"),
    projectType: formData.get("projectType"),
    message: formData.get("message"),
    source: formData.get("source"),
  });

  if (!parsed.success) {
    return { error: "Please check the form and try again." };
  }

  const normalizedPhone = normalizeBdPhone(parsed.data.phone);
  if (!normalizedPhone) {
    return { error: "Enter a valid Bangladeshi mobile number." };
  }

  const admin = createAdminClient();

  if (parsed.data.source === "build_your_store") {
    await admin.from("store_requests").insert({
      full_name: parsed.data.fullName,
      phone: normalizedPhone,
      email: parsed.data.email || null,
      business_name: parsed.data.businessName || null,
      product_category: parsed.data.projectType || null,
      message: parsed.data.message || null,
      source: parsed.data.source,
    });

    void queueEmail({
      template: "store_request_internal",
      to: "support@zero2brands.com",
      data: { fullName: parsed.data.fullName, phone: normalizedPhone },
    }).catch(() => {});
    void queueEmail({
      template: "store_request_received",
      to: parsed.data.email || undefined,
      data: { fullName: parsed.data.fullName },
    }).catch(() => {});
  } else {
    await admin.from("leads").insert({
      full_name: parsed.data.fullName,
      phone: normalizedPhone,
      email: parsed.data.email || null,
      source: "organic",
    });
  }

  return { success: true };
}
