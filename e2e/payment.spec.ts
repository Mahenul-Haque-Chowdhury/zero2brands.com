import { test, expect } from "@playwright/test";

/**
 * Phase 15.1: "sandbox bKash purchase end to end". Requires real bKash
 * sandbox credentials configured (BKASH_IS_SANDBOX=true) and a logged-in
 * test user. Skipped by default since this repo ships without live
 * credentials — remove the skip once BKASH_APP_KEY etc. are set in a test
 * environment.
 */
test.describe("bKash sandbox checkout", () => {
  test.skip(true, "requires bKash sandbox credentials in the test environment");

  test("a logged-in user can complete a sandbox purchase", async ({ page }) => {
    await page.goto("/course");
    await page.getByRole("button", { name: /enroll now/i }).click();

    // Redirects to bKash's sandbox checkout page.
    await page.waitForURL(/bka\.sh/);

    // Fill in bKash sandbox test wallet number and OTP per their docs.
    // ...

    // After completing checkout, bKash redirects back to our callback,
    // which redirects to /payment/success.
    await expect(page).toHaveURL(/\/payment\/success/);
    await expect(page.getByText(/payment successful/i)).toBeVisible();
  });

  test("double-hitting the callback URL does not double-enroll", async () => {
    // Hit /api/payments/bkash/callback?paymentID=...&status=success twice
    // with the same paymentID and assert only one enrollment row exists
    // and only one confirmation email was queued.
  });
});
