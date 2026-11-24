import { expect, test } from "@playwright/test";

test.describe("signed out", () => {
  test("a visitor is sent to sign in, and returned to where they were going", async ({ page }) => {
    await page.goto("/members");
    await expect(page).toHaveURL(/\/login\?next=%2Fmembers$/);
    await expect(page.locator("#login-title")).toBeVisible();
  });

  test("the sign-in form explains what is wrong and keeps what was typed", async ({ page }) => {
    await page.goto("/login");
    const form = page.locator('form:has(input[name="password"])');
    await form.locator('input[name="email"]').fill("not-an-email");
    await form.locator('input[name="password"]').fill("short");
    await form.locator('button[type="submit"]').click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
    await expect(form.locator('input[name="email"]')).toHaveValue("not-an-email");
  });

  test("terms and policies can be read without an account", async ({ page }) => {
    await page.goto("/legal");
    await expect(page.getByRole("heading", { level: 1, name: "Terms and policies" })).toBeVisible();
    for (const title of [
      "Terms of Service",
      "Privacy Notice",
      "Business Terms",
      "Refund and Cancellation Policy",
      "Community Rules",
    ]) {
      await expect(page.getByRole("link", { name: title }).first()).toBeVisible();
    }
    await page.goto("/legal/privacy");
    await expect(page.getByRole("heading", { level: 1, name: "Privacy Notice" })).toBeVisible();
    await expect(page.getByText("Draft for review").first()).toBeVisible();
  });

  test("an unknown policy is a 404, not a sign-in page", async ({ page }) => {
    const response = await page.goto("/legal/no-such-document");
    expect(response?.status()).toBe(404);
  });

  test("fonts are served, not redirected to sign in", async ({ request }) => {
    const response = await request.get("/fonts/inter-latin-wght-normal.woff2", { maxRedirects: 0 });
    expect(response.status()).toBe(200);
  });

  test("responses carry the security headers", async ({ request }) => {
    const headers = (await request.get("/login")).headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age=");
  });
});
