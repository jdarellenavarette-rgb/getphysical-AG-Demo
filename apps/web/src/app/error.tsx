"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/** Shown when a page fails to load. `digest` is the reference support can match to server logs. */
export default function SuiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "#0B0D12",
        color: "#F3F4F6",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <section role="alert" style={{ maxWidth: 440, textAlign: "center" }}>
        <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>We couldn&apos;t load the Business Suite</h1>
        <p style={{ color: "#D1D5DB", fontSize: 15, margin: "0 0 20px" }}>
          This is a problem on our side, not something you did. Your data has not changed.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            border: "none",
            background: "#E11D48",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
        {error.digest && <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 16 }}>Reference: {error.digest}</p>}
      </section>
    </main>
  );
}
