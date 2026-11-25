// Prepares a local Supabase stack (`supabase start`) for the browser tests: creates a confirmed
// test account, gives it the four demo businesses, and prints the settings the build and the
// tests need as KEY=value lines. In CI the output is appended to $GITHUB_ENV.
//
// Nothing here touches a hosted project: the stack is created for the run and thrown away.
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";

const status = JSON.parse(execFileSync("supabase", ["status", "-o", "json"], { encoding: "utf8" }));
const apiUrl = status.API_URL;
const anonKey = status.ANON_KEY ?? status.PUBLISHABLE_KEY;
const serviceKey = status.SERVICE_ROLE_KEY ?? status.SECRET_KEY;
if (!apiUrl || !anonKey || !serviceKey) {
  throw new Error(`Local Supabase did not report its URL and keys. Reported: ${Object.keys(status).join(", ")}`);
}

const email = "e2e-owner@getphysical.test";
const password = `E2e-${randomBytes(18).toString("base64url")}`;

async function call(path, key, bearer, body) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${bearer}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${path} failed with ${response.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

await call("/auth/v1/admin/users", serviceKey, serviceKey, {
  email,
  password,
  email_confirm: true,
  user_metadata: { name: "Ella Tester", full_name: "Ella Tester" },
});
// Demo businesses exist only in test mode, which an operator switches on. This stack is ours.
await call("/rest/v1/rpc/admin_set_payments_mode", serviceKey, serviceKey, { p_mode: "sandbox" });
const session = await call("/auth/v1/token?grant_type=password", anonKey, anonKey, { email, password });
// The same demo data a new owner gets from "Try the demo": a gym, a club, a coach and an organizer.
await call("/rest/v1/rpc/create_demo_venue", anonKey, session.access_token, {});

// The mask goes to stderr so it is not written into the environment file with the settings.
if (process.env.GITHUB_ACTIONS) console.error(`::add-mask::${password}`);
for (const [name, value] of Object.entries({
  NEXT_PUBLIC_SUPABASE_URL: apiUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
  E2E_EMAIL: email,
  E2E_PASSWORD: password,
})) {
  console.log(`${name}=${value}`);
}
