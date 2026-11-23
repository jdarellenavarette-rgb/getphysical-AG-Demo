import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "../../components/shell/BrandMark";

/** Public pages: readable without signing in, and linked from the Sodia app. */
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link href="/legal" aria-label="GetPhysical legal documents">
            <BrandMark tagline />
          </Link>
          <Link href="/" className="text-sm font-semibold underline-offset-4 hover:underline">
            Go to the Business Suite
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10">{children}</main>
    </div>
  );
}
