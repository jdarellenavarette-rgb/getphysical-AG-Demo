import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Browser tests for the Business Suite. They run against a production build (`pnpm build` first).
 *
 * The public tests need no backend. The signed-in tests need a real Supabase project and a test
 * account, given as E2E_EMAIL and E2E_PASSWORD, with NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY set when the app was built. They only read; they change no data.
 */
export default defineConfig({
  testDir: "./e2e",
  // One account and one "active business" cookie are shared, so tests run one at a time.
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
