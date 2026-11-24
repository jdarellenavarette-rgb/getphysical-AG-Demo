import Link from "next/link";
import { DraftNotice } from "../../components/ui/legal";
import { LEGAL_DOCUMENTS } from "../../lib/legal/documents";

export const metadata = { title: "Terms and policies" };

export default function LegalIndexPage() {
  return (
    <>
      <h1 className="text-3xl">Terms and policies</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        The agreements and policies for the Sodia app and the GetPhysical Business Suite.
      </p>
      <DraftNotice />
      <ul className="mt-6 grid gap-3">
        {LEGAL_DOCUMENTS.map((document) => (
          <li key={document.slug}>
            <Link
              href={`/legal/${document.slug}`}
              className="block rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted"
            >
              <span className="block text-lg font-bold">{document.title}</span>
              <span className="mt-1 block text-sm font-medium text-muted-foreground">{document.audience}</span>
              <span className="mt-2 block text-sm">{document.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
