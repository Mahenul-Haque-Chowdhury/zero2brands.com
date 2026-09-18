import { NextResponse, type NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBkashPayment } from "@/lib/bkash/client";
import { validateCoupon, type CouponRecord } from "@/lib/utils/coupon";
import { checkRateLimit, limiters } from "@/lib/ratelimit/index";
import { toJson } from "@/lib/utils/json";

const bodySchema = z.object({
  productId: z.string().uuid(),
  couponCode: z.string().trim().optional(),
});

/**
 * Creates a bKash payment. Never trusts amount or discount from the client:
 * the price comes from `products.price_bdt`, and any coupon is validated
 * and its discount computed entirely server-side.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed || !profile.phone) {
    return NextResponse.json(
      { error: "Please complete onboarding first." },
      { status: 400 }
    );
  }

  const rl = await checkRateLimit(limiters.paymentCreatePerUser, user.id);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many payment attempts. Please try again later." },
      { status: 429 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: product } = await admin
    .from("products")
    .select("*")
    .eq("id", parsed.data.productId)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) {
    return NextResponse.json(
      { error: "This product is not available." },
      { status: 404 }
    );
  }

  // Prevent double purchase of something the user already holds.
  if (product.type === "course" && product.course_id) {
    const { data: hasAccess } = await admin.rpc("has_course_access", {
      uid: user.id,
      cid: product.course_id,
    });
    if (hasAccess) {
      return NextResponse.json(
        { error: "You already have access to this course." },
        { status: 400 }
      );
    }
  } else if (product.type === "batch" && product.batch_id) {
    const { data: hasAccess } = await admin.rpc("has_batch_access", {
      uid: user.id,
      bid: product.batch_id,
    });
    if (hasAccess) {
      return NextResponse.json(
        { error: "You already have access to this batch." },
        { status: 400 }
      );
    }
  }

  let discountBdt = 0;
  let couponId: string | null = null;

  if (parsed.data.couponCode) {
    const { data: coupon } = await admin
      .from("coupons")
      .select("*")
      .eq("code", parsed.data.couponCode.toUpperCase())
      .maybeSingle<CouponRecord>();

    const { count: redemptionCount } = await admin
      .from("coupon_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("coupon_id", coupon?.id ?? "")
      .eq("user_id", user.id);

    const result = validateCoupon({
      coupon,
      productId: product.id,
      priceBdt: product.price_bdt,
      userRedemptionCount: redemptionCount ?? 0,
    });

    if (!result.valid) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    discountBdt = result.discountBdt;
    couponId = coupon!.id;
  }

  const finalAmount = product.price_bdt - discountBdt;
  const merchantInvoiceNumber = `Z2B-${nanoid(12)}`;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  const { data: payment, error: insertError } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      product_id: product.id,
      merchant_invoice_number: merchantInvoiceNumber,
      gateway: "bkash",
      amount_bdt: finalAmount,
      discount_bdt: discountBdt,
      coupon_id: couponId,
      status: "pending",
      ip_address: ip === "unknown" ? null : ip,
      user_agent: userAgent,
    })
    .select("id")
    .single();

  if (insertError || !payment) {
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 500 }
    );
  }

  try {
    const bkashRes = await createBkashPayment({
      payerReference: profile.phone,
      amountBdt: finalAmount,
      merchantInvoiceNumber,
    });

    await admin
      .from("payments")
      .update({
        bkash_payment_id: bkashRes.paymentID,
        bkash_create_response: toJson(bkashRes),
        status: "processing",
      })
      .eq("id", payment.id);

    return NextResponse.json({
      bkashURL: bkashRes.bkashURL,
      invoiceNumber: merchantInvoiceNumber,
    });
  } catch (err) {
    await admin
      .from("payments")
      .update({
        status: "failed",
        failure_reason: err instanceof Error ? err.message : "unknown error",
      })
      .eq("id", payment.id);

    return NextResponse.json(
      { error: "Could not reach bKash. Please try again shortly." },
      { status: 502 }
    );
  }
}
