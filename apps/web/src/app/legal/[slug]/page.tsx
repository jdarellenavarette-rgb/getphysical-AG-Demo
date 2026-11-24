import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DraftNotice } from "../../../components/ui/legal";
import { LEGAL_DOCUMENTS, LEGAL_UPDATED, LEGAL_VERSION, findLegalDocument } from "../../../lib/legal/documents";

export function generateStaticParams() {
  return LEGAL_DOCUMENTS.map((document) => ({ slug: document.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: findLegalDocument((await params).slug)?.title ?? "Policy" };
}

/** Consecutive "• " lines become one list; everything else is a paragraph. */
function groupBody(body: string[]): (string | string[])[] {
  const blocks: (string | string[])[] = [];
  for (const line of body) {
    const last = blocks.at(-1);
    if (!line.startsWith("• ")) blocks.push(line);
    else if (Array.isArray(last)) last.push(line.slice(2));
    else blocks.push([line.slice(2)]);
  }
  return blocks;
}

export default async function LegalDocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const document = findLegalDocument((await params).slug);
  if (!document) notFound();

  return (
    <article>
      <Link
        href="/legal"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden />
        All policies
      </Link>
      <h1 className="text-3xl">{document.title}</h1>
      <p className="mt-2 text-muted-foreground">{document.audience}</p>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Version {LEGAL_VERSION} · Last updated {LEGAL_UPDATED}
      </p>
      <DraftNotice />
      <p className="mt-6 text-lg">{document.summary}</p>

      {document.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-xl font-bold">{section.heading}</h2>
          <div className="mt-3 grid gap-3 leading-relaxed">
            {groupBody(section.body).map((block, index) =>
              Array.isArray(block) ? (
                <ul key={index} className="grid list-disc gap-2 pl-6">
                  {block.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p key={index}>{block}</p>
              ),
            )}
          </div>
        </section>
      ))}
    </article>
  );
}
