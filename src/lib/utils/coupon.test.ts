import { describe, it, expect } from "vitest";
import { computeDiscount, validateCoupon, type CouponRecord } from "./coupon";

function baseCoupon(overrides: Partial<CouponRecord> = {}): CouponRecord {
  return {
    id: "coupon-1",
    code: "SAVE10",
    discount_type: "percent",
    discount_value: 10,
    max_uses: null,
    used_count: 0,
    per_user_limit: 1,
    product_id: null,
    min_amount_bdt: null,
    starts_at: null,
    ends_at: null,
    is_active: true,
    ...overrides,
  };
}

describe("computeDiscount", () => {
  it("computes percent discount and rounds", () => {
    expect(computeDiscount(4999, "percent", 10)).toBe(500); // round(499.9)
  });

  it("computes fixed discount", () => {
    expect(computeDiscount(4999, "fixed", 500)).toBe(500);
  });

  it("never exceeds the price", () => {
    expect(computeDiscount(100, "fixed", 500)).toBe(100);
  });

  it("never goes negative", () => {
    expect(computeDiscount(100, "fixed", -50)).toBe(0);
  });
});

describe("validateCoupon", () => {
  it("rejects a missing coupon", () => {
    const result = validateCoupon({
      coupon: null,
      productId: "p1",
      priceBdt: 1000,
      userRedemptionCount: 0,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects an inactive coupon", () => {
    const result = validateCoupon({
      coupon: baseCoupon({ is_active: false }),
      productId: "p1",
      priceBdt: 1000,
      userRedemptionCount: 0,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects a coupon scoped to a different product", () => {
    const result = validateCoupon({
      coupon: baseCoupon({ product_id: "other-product" }),
      productId: "p1",
      priceBdt: 1000,
      userRedemptionCount: 0,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects when max uses reached", () => {
    const result = validateCoupon({
      coupon: baseCoupon({ max_uses: 5, used_count: 5 }),
      productId: "p1",
      priceBdt: 1000,
      userRedemptionCount: 0,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects when the user already redeemed it", () => {
    const result = validateCoupon({
      coupon: baseCoupon({ per_user_limit: 1 }),
      productId: "p1",
      priceBdt: 1000,
      userRedemptionCount: 1,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects below minimum amount", () => {
    const result = validateCoupon({
      coupon: baseCoupon({ min_amount_bdt: 2000 }),
      productId: "p1",
      priceBdt: 1000,
      userRedemptionCount: 0,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects outside the date window", () => {
    const result = validateCoupon({
      coupon: baseCoupon({
        starts_at: "2099-01-01T00:00:00Z",
      }),
      productId: "p1",
      priceBdt: 1000,
      userRedemptionCount: 0,
    });
    expect(result.valid).toBe(false);
  });

  it("accepts a valid coupon and computes the final amount", () => {
    const result = validateCoupon({
      coupon: baseCoupon({ discount_type: "percent", discount_value: 20 }),
      productId: "p1",
      priceBdt: 5000,
      userRedemptionCount: 0,
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.discountBdt).toBe(1000);
      expect(result.finalAmountBdt).toBe(4000);
    }
  });
});
