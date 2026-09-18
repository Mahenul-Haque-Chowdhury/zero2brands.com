import { test, expect } from "@playwright/test";

test.describe("community directory", () => {
  test.skip(true, "requires seeded enrolled and unenrolled test users");

  test("an enrolled student can view the directory", async ({ page }) => {
    // Log in as a seeded enrolled student.
    await page.goto("/dashboard/community");
    await expect(page.getByRole("heading", { name: /community/i })).toBeVisible();
  });

  test("an unpaid student cannot view the directory", async ({ page }) => {
    // Log in as a seeded unpaid/unenrolled student.
    await page.goto("/dashboard/community");
    // requireEnrolledStudent redirects to /dashboard.
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("opening a private profile 404s", async ({ page }) => {
    await page.goto("/dashboard/community/some-private-username");
    await expect(page.getByText(/404|not found/i)).toBeVisible();
  });
});
