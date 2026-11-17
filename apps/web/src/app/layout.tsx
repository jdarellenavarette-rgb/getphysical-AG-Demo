import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "GetPhysical Business Suite", template: "%s | GetPhysical Business Suite" },
  description: "Members, check-in, messaging and sales for gyms and clubs on GetPhysical.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // An explicit choice is stored in a cookie; without one the page follows the system setting.
  const stored = (await cookies()).get("gp_theme")?.value;
  const theme = stored === "dark" || stored === "light" ? stored : undefined;
  return (
    <html lang="en" data-theme={theme}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
