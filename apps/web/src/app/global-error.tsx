"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/** Last-resort boundary for failures in the root layout itself. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0B0D12", color: "#F3F4F6", fontFamily: "system-ui, sans-serif" }}>
        <main
          role="alert"
          style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}
        >
          <div>
            <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Something went wrong</h1>
            <p style={{ color: "#D1D5DB", margin: "0 0 20px" }}>Please retry. Your data has not changed.</p>
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
                cursor: "pointer",
              }}
            >
              Retry
            </button>
            {error.digest && <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 16 }}>Reference: {error.digest}</p>}
          </div>
        </main>
      </body>
    </html>
  );
}
