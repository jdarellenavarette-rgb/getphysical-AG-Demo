import Link from "next/link";
import { LEGAL_UPDATED, LEGAL_VERSION } from "../../lib/legal/documents";
import { Notice } from "./states";

/** Shown on every legal page until the documents have been reviewed and adopted. */
export function DraftNotice() {
  return (
    <Notice tone="warning" role="note">
      Draft for review ({LEGAL_VERSION}, {LEGAL_UPDATED}). This text describes how the platform works today but has not
      yet been reviewed by a lawyer and is not in force. Text in [square brackets] is still to be filled in.
    </Notice>
  );
}

/** Small-print links to the documents people are agreeing to. */
export function LegalLinks({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-sm text-muted-foreground"}>
      <Link href="/legal/terms" className="font-medium underline underline-offset-4">
        Terms
      </Link>
      {" · "}
      <Link href="/legal/privacy" className="font-medium underline underline-offset-4">
        Privacy
      </Link>
      {" · "}
      <Link href="/legal" className="font-medium underline underline-offset-4">
        All policies
      </Link>
    </p>
  );
}
