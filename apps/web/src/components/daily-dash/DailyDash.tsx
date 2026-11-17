"use client";

import React, { useState } from "react";

interface ScanEvent {
  id: string;
  name: string;
  avatar: string;
  time: string;
  status: "GRANTED" | "DENIED_EXPIRED" | "OFFLINE_TOTP";
  membership: string;
}

const INITIAL_SCANS: ScanEvent[] = [
  { id: "1", name: "Marcus Cruz", avatar: "MC", time: "10:42 AM", status: "GRANTED", membership: "Nexus VIP Black" },
  { id: "2", name: "Alyssa Ramos", avatar: "AR", time: "10:39 AM", status: "GRANTED", membership: "Daily Punchpass" },
  {
    id: "3",
    name: "Jake Torralba",
    avatar: "JT",
    time: "10:35 AM",
    status: "DENIED_EXPIRED",
    membership: "Expired 2d ago",
  },
  {
    id: "4",
    name: "Elena Rostova",
    avatar: "ER",
    time: "10:28 AM",
    status: "OFFLINE_TOTP",
    membership: "Verified 60s Token",
  },
];

export function DailyDash() {
  const [occupancy] = useState(42);
  const [maxCapacity] = useState(100);
  const scans = INITIAL_SCANS;
  const [posTab, setPosTab] = useState<"ACCESS" | "STORE">("ACCESS");
  const [cart, setCart] = useState<{ id: string; name: string; price: number; type: "ACCESS" | "STORE" }[]>([]);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [cartNotice, setCartNotice] = useState<string | null>(null);

  const addToCart = (item: { id: string; name: string; price: number; type: "ACCESS" | "STORE" }) => {
    const hasOpposite = cart.some((c) => c.type !== item.type);
    if (hasOpposite) {
      setCartNotice("Passes and shop items are sold separately. Finish or clear this cart first.");
      return;
    }
    setCartNotice(null);
    setCart((prev) => [...prev, item]);
  };

  const cartTotal = cart.reduce((acc, i) => acc + i.price, 0);

  const handleTender = (method: string) => {
    if (cart.length === 0) return;
    setCheckoutSuccess(
      `Sample only: ₱${cartTotal.toLocaleString()} by ${method} was not charged and no sale was recorded.`,
    );
    setCart([]);
    setTimeout(() => setCheckoutSuccess(null), 3000);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", height: "100%" }}>
      {/* LEFT: Live Turnstile & Scanner */}
      <div
        style={{
          backgroundColor: "#111827",
          border: "1px solid #1f2937",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#f9fafb" }}>Turnstile Gate 01</h2>
            <p style={{ fontSize: "12px", color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "4px", backgroundColor: "#10b981" }} /> Example
              feed
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase" }}>Inside Now</span>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: occupancy > 85 ? "#ef4444" : "#10b981",
                fontFamily: "monospace",
              }}
            >
              {occupancy} <span style={{ fontSize: "14px", color: "#6b7280" }}>/ {maxCapacity}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#1e293b",
            border: "2px solid #334155",
            borderRadius: "10px",
            padding: "18px",
            textAlign: "center",
            marginBottom: "16px",
            fontSize: "14px",
            fontWeight: 700,
            color: "#cbd5e1",
          }}
        >
          The door scanner is not connected yet. The entries below are examples.
        </div>

        {/* Live Attendance Stream */}
        <h4
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#9ca3af",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          Example entries
        </h4>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {scans.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#1f293780",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #374151",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "16px",
                    backgroundColor: "#374151",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "11px",
                  }}
                >
                  {s.avatar}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#f3f4f6" }}>{s.name}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>{s.membership}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "3px 6px",
                    borderRadius: "4px",
                    backgroundColor: s.status === "DENIED_EXPIRED" ? "#ef444420" : "#10b98120",
                    color: s.status === "DENIED_EXPIRED" ? "#ef4444" : "#10b981",
                  }}
                >
                  {s.status}
                </span>
                <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "3px" }}>{s.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Bifurcated POS Till */}
      <div
        style={{
          backgroundColor: "#111827",
          border: "1px solid #1f2937",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#f9fafb" }}>POS Terminal</h2>
          <div style={{ display: "flex", backgroundColor: "#1f2937", padding: "3px", borderRadius: "8px" }}>
            <button
              onClick={() => setPosTab("ACCESS")}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                backgroundColor: posTab === "ACCESS" ? "#3b82f6" : "transparent",
                color: posTab === "ACCESS" ? "#fff" : "#9ca3af",
              }}
            >
              [Access]
            </button>
            <button
              onClick={() => setPosTab("STORE")}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                backgroundColor: posTab === "STORE" ? "#10b981" : "transparent",
                color: posTab === "STORE" ? "#000" : "#9ca3af",
              }}
            >
              [Store]
            </button>
          </div>
        </div>

        {/* Catalog Items */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
          {posTab === "ACCESS" ? (
            <>
              <button
                onClick={() => addToCart({ id: "a1", name: "1-Day Walk-in Pass", price: 350, type: "ACCESS" })}
                style={{
                  backgroundColor: "#1e293b",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f3f4f6" }}>Walk-in Day Pass</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#38bdf8" }}>
                  ₱350 <span style={{ fontSize: "10px", color: "#9ca3af" }}>+₱15 fee</span>
                </div>
              </button>
              <button
                onClick={() => addToCart({ id: "a2", name: "Monthly All-Access VIP", price: 2499, type: "ACCESS" })}
                style={{
                  backgroundColor: "#1e293b",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f3f4f6" }}>Monthly VIP Sub</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#38bdf8" }}>
                  ₱2,499 <span style={{ fontSize: "10px", color: "#9ca3af" }}>5% fee</span>
                </div>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => addToCart({ id: "s1", name: "Electrolyte Hydration 500ml", price: 80, type: "STORE" })}
                style={{
                  backgroundColor: "#1e293b",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f3f4f6" }}>Electrolyte Bottle</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#34d399" }}>₱80</div>
              </button>
              <button
                onClick={() => addToCart({ id: "s2", name: "Whey Protein Isolate Shake", price: 180, type: "STORE" })}
                style={{
                  backgroundColor: "#1e293b",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f3f4f6" }}>Protein Shake</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#34d399" }}>₱180</div>
              </button>
            </>
          )}
        </div>

        {/* Cart & Checkout */}
        <div
          style={{
            backgroundColor: "#0f172a",
            borderRadius: "8px",
            padding: "12px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              fontWeight: 700,
              color: "#9ca3af",
              marginBottom: "8px",
            }}
          >
            <span>Current Cart ({cart.length} items)</span>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} style={{ color: "#ef4444", fontSize: "11px" }}>
                Clear
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
            {cart.length === 0 ? (
              <div style={{ color: "#64748b", fontSize: "12px", textAlign: "center", margin: "auto" }}>
                Cart is empty
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "#f1f5f9",
                    borderBottom: "1px solid #1e293b",
                    paddingBottom: "4px",
                  }}
                >
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 700 }}>₱{item.price}</span>
                </div>
              ))
            )}
          </div>

          {cartNotice && (
            <div role="alert" style={{ marginTop: "8px", fontSize: "11px", color: "#fca5a5", textAlign: "center" }}>
              {cartNotice}
            </div>
          )}

          {checkoutSuccess && (
            <div
              role="status"
              style={{
                backgroundColor: "#f59e0b20",
                border: "1px solid #f59e0b",
                borderRadius: "6px",
                padding: "8px",
                marginTop: "8px",
                fontSize: "11px",
                color: "#fcd34d",
                textAlign: "center",
              }}
            >
              {checkoutSuccess}
            </div>
          )}

          <div style={{ borderTop: "1px solid #334155", paddingTop: "10px", marginTop: "8px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "16px",
                fontWeight: 800,
                color: "#fff",
                marginBottom: "10px",
              }}
            >
              <span>Total Due</span>
              <span>₱{cartTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <button
                disabled={cart.length === 0}
                onClick={() => handleTender("Cash")}
                style={{
                  backgroundColor: "#10b981",
                  color: "#000",
                  padding: "8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  opacity: cart.length === 0 ? 0.4 : 1,
                }}
              >
                Cash
              </button>
              <button
                disabled={cart.length === 0}
                onClick={() => handleTender("GCash")}
                style={{
                  backgroundColor: "#0284c7",
                  color: "#fff",
                  padding: "8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  opacity: cart.length === 0 ? 0.4 : 1,
                }}
              >
                GCash QR
              </button>
              <button
                disabled={cart.length === 0}
                onClick={() => handleTender("VIP Wallet")}
                style={{
                  backgroundColor: "#8b5cf6",
                  color: "#fff",
                  padding: "8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  opacity: cart.length === 0 ? 0.4 : 1,
                }}
              >
                VIP Balance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
