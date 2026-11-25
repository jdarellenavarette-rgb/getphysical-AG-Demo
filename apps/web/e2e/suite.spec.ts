import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

/**
 * The main path of every workspace the test account belongs to: each section in the side menu
 * opens, shows its heading, and raises no error. Read-only, so it is safe against shared data.
 */
test.describe("signed in", () => {
  // In CI these must run: a missing account there is a broken pipeline, not a reason to skip.
  test.skip(!process.env.CI && (!email || !password), "Set E2E_EMAIL and E2E_PASSWORD to run the signed-in tests.");
  test.beforeAll(() => {
    if (!email || !password) throw new Error("E2E_EMAIL and E2E_PASSWORD are not set.");
  });
  test.describe.configure({ mode: "serial" });

  let page: Page;
  const pageErrors: string[] = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto("/login");
    const form = page.locator('form:has(input[name="password"])');
    await form.locator('input[name="email"]').fill(email ?? "");
    await form.locator('input[name="password"]').fill(password ?? "");
    await form.locator('button[type="submit"]').click();
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 45_000 });
  });

  test.afterAll(async () => {
    await page.close();
  });

  const switcher = () => page.locator('select[aria-label="Business"]');
  const menu = () => page.locator('nav[aria-label="Business Suite sections"]');

  test("the account lands on a workspace home with its menu", async () => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(menu().getByRole("link").first()).toBeVisible();
  });

  test("every section of every workspace opens", async () => {
    test.setTimeout(10 * 60_000);
    await page.goto("/");
    const businesses = await switcher().locator("option").allTextContents();
    expect(businesses.length).toBeGreaterThan(0);

    for (const business of businesses) {
      await page.goto("/");
      if ((await switcher().locator("option:checked").textContent()) !== business) {
        // Choosing a business reloads the suite on that business's home.
        await Promise.all([page.waitForEvent("load"), switcher().selectOption({ label: business })]);
        await expect(switcher().locator("option:checked")).toHaveText(business);
      }
      const links = await menu()
        .getByRole("link")
        .evaluateAll((anchors) =>
          anchors.map((a) => ({ href: a.getAttribute("href") ?? "", label: a.textContent ?? "" })),
        );
      // Every workspace has at least a home, an inbox, a till and settings.
      expect(links.map((link) => link.href)).toEqual(expect.arrayContaining(["/", "/inbox", "/till", "/settings"]));

      for (const link of links) {
        await test.step(`${business}: ${link.label.trim()}`, async () => {
          const response = await page.goto(link.href);
          expect(response?.status(), `${link.href} status`).toBe(200);
          await expect(page.locator("h1").first()).toBeVisible();
          await expect(page.getByText("We couldn't load the Business Suite")).toHaveCount(0);
        });
      }
    }
    expect(pageErrors, "errors thrown in the browser").toEqual([]);
  });

  test("a section outside the workspace is not found", async () => {
    await page.goto("/");
    const hrefs = await menu()
      .getByRole("link")
      .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href")));
    const outside = ["/classes", "/schedule", "/clients", "/events"].find((href) => !hrefs.includes(href));
    test.skip(!outside, "This workspace has every section.");
    const response = await page.goto(outside ?? "/");
    expect(response?.status()).toBe(404);
  });

  test("signing out returns to the sign-in page and locks the suite", async () => {
    await page.goto("/");
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL(/\/login/);
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login\?next=%2Fsettings$/);
  });
});
