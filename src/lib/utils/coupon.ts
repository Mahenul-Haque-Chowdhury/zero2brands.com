/**
 * Pure coupon discount calculation, kept dependency-free so it is easy to
 * unit test (Phase 15.1) and so the payment-create route can compute the
 * final amount server-side without trusting anything from the client.
 */

export interface CouponRecord {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  per_user_limit: number;
  product_id: string | null;
  min_amount_bdt: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

export interface CouponValidationInput {
  coupon: CouponRecord | null;
  productId: string;
  priceBdt: number;
  userRedemptionCount: number;
  now?: Date;
}

export type CouponValidationResult =
  | { valid: true; discountBdt: number; finalAmountBdt: number }
  | { valid: false; reason: string };

export function computeDiscount(
  priceBdt: number,
  discountType: "percent" | "fixed",
  discountValue: number
): number {
  const raw =
    discountType === "percent"
      ? Math.round((priceBdt * discountValue) / 100)
      : discountValue;
  return Math.max(0, Math.min(raw, priceBdt));
}

export function validateCoupon(
  input: CouponValidationInput
): CouponValidationResult {
  const { coupon, productId, priceBdt, userRedemptionCount } = input;
  const now = input.now ?? new Date();

  if (!coupon) {
    return { valid: false, reason: "Coupon not found." };
  }
  if (!coupon.is_active) {
    return { valid: false, reason: "This coupon is no longer active." };
  }
  if (coupon.product_id && coupon.product_id !== productId) {
    return { valid: false, reason: "This coupon does not apply to this product." };
  }
  if (coupon.starts_at && now < new Date(coupon.starts_at)) {
    return { valid: false, reason: "This coupon is not active yet." };
  }
  if (coupon.ends_at && now > new Date(coupon.ends_at)) {
    return { valid: false, reason: "This coupon has expired." };
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { valid: false, reason: "This coupon has reached its usage limit." };
  }
  if (userRedemptionCount >= coupon.per_user_limit) {
    return { valid: false, reason: "You have already used this coupon." };
  }
  if (
    coupon.min_amount_bdt !== null &&
    priceBdt < coupon.min_amount_bdt
  ) {
    return {
      valid: false,
      reason: `This coupon requires a minimum purchase of ${coupon.min_amount_bdt} BDT.`,
    };
  }

  const discountBdt = computeDiscount(
    priceBdt,
    coupon.discount_type,
    coupon.discount_value
  );

  return {
    valid: true,
    discountBdt,
    finalAmountBdt: priceBdt - discountBdt,
  };
}
