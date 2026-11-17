import Link from "next/link";

export default function NotFound() {
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
      <section style={{ maxWidth: 440, textAlign: "center" }}>
        <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Page not found</h1>
        <p style={{ color: "#D1D5DB", fontSize: 15, margin: "0 0 20px" }}>
          That address doesn&apos;t exist in the Business Suite.
        </p>
        <Link href="/" style={{ color: "#FDA4AF", fontWeight: 700 }}>
          Go to the dashboard
        </Link>
      </section>
    </main>
  );
}
