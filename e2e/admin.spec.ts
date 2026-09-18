import { test } from "@playwright/test";

test.describe("admin panel", () => {
  test.skip(true, "requires a seeded admin test user");

  test("admin can grant manual access to a student", async ({ page }) => {
    // Log in as a seeded admin, navigate to /admin/payments, open the
    // manual payment dialog, submit valid student/product IDs, and assert
    // a success toast plus a new payments row with gateway='manual'.
    await page.goto("/admin/payments");
    await page.getByRole("button", { name: /record manual payment/i }).click();
  });

  test("admin can revoke a student's access", async () => {
    // Navigate to a known student's detail page and click revoke on one
    // of their enrollments, then assert the status flips to 'revoked'.
  });
});

test.describe("concurrent session eviction", () => {
  test.skip(true, "requires two authenticated browser contexts for the same user");

  test("a third device sign-in evicts the oldest session", async () => {
    // Open two browser contexts, log in as the same seeded user in both
    // (registering two active_sessions rows), then open a third context
    // and log in again. Assert the first context's next heartbeat reports
    // revoked:true and the client signs out with the expected toast.
  });
});
