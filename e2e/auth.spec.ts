import { test, expect } from "@playwright/test";

/**
 * Phase 15.1 E2E skeleton: signup, onboarding, login. These require a
 * seeded local Supabase instance (npm run db:reset locally, or a
 * dedicated test Supabase project) with the dev server pointed at it —
 * not runnable against the placeholder credentials this repo ships with.
 * The skeleton is written now so the test IDs and flow are locked in;
 * fill in real assertions once a test Supabase project exists.
 */

test.describe("signup and onboarding", () => {
  test("a new user can sign up, complete onboarding, and reach the dashboard", async ({
    page,
  }) => {
    await page.goto("/signup");

    await page.getByLabel("Full name").fill("Test Student");
    await page.getByLabel("Email").fill(`test-${Date.now()}@example.com`);
    await page.getByLabel("Phone number").fill("01712345678");
    await page.getByLabel("Password").fill("TestPassword123");

    await page.getByRole("button", { name: /create account/i }).click();

    // Redirects to /onboarding on success.
    await expect(page).toHaveURL(/\/onboarding/);

    await page.getByLabel("Phone number").fill("01712345678");
    // District select interaction depends on the shadcn Select component
    // rendering — fill in once running against a live environment.

    await page.getByRole("button", { name: /continue to dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("login", () => {
  test("shows an error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("nonexistent@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });
});
