/** @type {import('next').NextConfig} */

// Baseline security headers for every response (OWASP secure-headers recommendations).
// A full Content-Security-Policy is intentionally not set yet: it must allow the
// Supabase / Google / Apple OAuth redirects and needs its own tuning pass.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["sodia-core"],
  experimental: {
    // Server Actions here only carry small forms; cap bodies well below the 1 MB default.
    serverActions: { bodySizeLimit: "100kb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
