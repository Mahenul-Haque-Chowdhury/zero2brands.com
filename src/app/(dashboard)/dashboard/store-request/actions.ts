"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { queueEmail } from "@/lib/email/resend";

const schema = z.object({
  businessName: z.string().trim().min(1).max(200),
  productCategory: z.string().trim().max(120).optional(),
  budgetRange: z.string().trim().max(60).optional(),
  message: z.string().trim().max(2000).optional(),
});

export async function submitStoreRequestAction(
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const parsed = schema.safeParse({
    businessName: formData.get("businessName"),
    productCategory: formData.get("productCategory"),
    budgetRange: formData.get("budgetRange"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: "Please check the form and try again." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, email")
    .eq("id", user.id)
    .single();

  if (!profile?.phone) {
    return { error: "Your profile is missing a phone number." };
  }

  const admin = createAdminClient();
  await admin.from("store_requests").insert({
    user_id: user.id,
    full_name: profile.full_name ?? "",
    phone: profile.phone,
    email: profile.email,
    business_name: parsed.data.businessName,
    product_category: parsed.data.productCategory || null,
    budget_range: parsed.data.budgetRange || null,
    message: parsed.data.message || null,
    source: "dashboard_cta",
  });

  void queueEmail({
    template: "store_request_internal",
    to: "support@zero2brands.com",
    data: { fullName: profile.full_name, phone: profile.phone },
  }).catch(() => {});
  void queueEmail({
    template: "store_request_received",
    userId: user.id,
    data: { fullName: profile.full_name },
  }).catch(() => {});

  return { success: true };
}
