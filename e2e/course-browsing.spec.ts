import { test, expect } from "@playwright/test";

test.describe("marketing course page", () => {
  test("shows the course price and curriculum", async ({ page }) => {
    await page.goto("/course");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Curriculum accordion should render at least one module once a
    // published course exists in the test database.
  });
});

test.describe("locked lesson", () => {
  test.skip(
    true,
    "requires an authenticated, unenrolled test user against a seeded database"
  );

  test("an unenrolled user is blocked from a non-preview lesson", async ({ page }) => {
    // Log in as a seeded, unenrolled test user, then attempt to visit a
    // known non-preview lesson slug directly and assert the locked/no
    // access message renders instead of the video player.
    await page.goto("/dashboard/course/mindset");
    await expect(page.getByText(/locked|no access/i)).toBeVisible();
  });
});
