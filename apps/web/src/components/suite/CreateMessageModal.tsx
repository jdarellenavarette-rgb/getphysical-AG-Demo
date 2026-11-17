"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { X, Send, CheckCircle } from "lucide-react";
import { type SuiteMode } from "./HeroPromoCard";
import {
  loadBroadcastAudiences,
  sendCrmBroadcast,
  type BroadcastAudiences,
  type BroadcastSummary,
} from "../../app/actions/crm";
import { useActiveFacility } from "./ActiveFacilityContext";

interface CreateMessageModalProps {
  visible: boolean;
  onClose: () => void;
  suiteMode: SuiteMode;
  onBroadcastSent?: (broadcast: BroadcastSummary) => void;
}

export function CreateMessageModal({ visible, onClose, suiteMode, onBroadcastSent }: CreateMessageModalProps) {
  const [audience, setAudience] = useState<"ALL" | "SEGMENT_1" | "SEGMENT_2" | "SEGMENT_3">("ALL");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const facility = useActiveFacility();

  const [audiences, setAudiences] = useState<BroadcastAudiences | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Real reach for this facility: active members and any segments it has set up.
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    void loadBroadcastAudiences(facility.id).then((result) => {
      if (!cancelled && result.ok) setAudiences(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [visible, facility.id]);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Dialog behaviour: focus moves in on open, Escape closes, focus returns on close.
  useEffect(() => {
    if (!visible) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [visible]);

  if (!visible) return null;

  const getModalConfig = () => {
    switch (suiteMode) {
      case "CLUBDASH":
        return {
          title: "Facility & Affiliated Club Broadcast",
          sub: "Broadcast court schedule changes and affiliated club notices",
          placeholderTitle: "e.g. Court 3 & 4 Resurfacing Scheduled for Tomorrow 06:00-10:00",
          placeholderBody: "Notice to all affiliated leagues: Alternate slots reserved in Court Alpha.",
          promoLabel: "Promo code to show in the message (optional)",
        };
      case "COACHDASH":
        return {
          title: "Coach Client CRM & Program Nudge",
          sub: "Send macrocycle updates, recovery reminders, and client nudges",
          placeholderTitle: "e.g. Week 4 Deload & 1RM Progression Check",
          placeholderBody: "Ensure your post-workout heart rates and video form checks are logged today.",
          promoLabel: "Promo code to show in the message (optional)",
        };
      case "ORGANIZERDASH":
        return {
          title: "Tournament Participant Broadcast",
          sub: "Dispatch bracket updates, check-in calls, and rule packs",
          placeholderTitle: "e.g. Official Bracket Draw Released & Court Allocation Finalized",
          placeholderBody: "All team captains must check in at Gate B 30 minutes prior to first whistle.",
          promoLabel: "Promo code to show in the message (optional)",
        };
      case "GYMDASH":
      default:
        return {
          title: "Manage Messaging & Promos",
          sub: "Send newsletters, promos, and reminders within your gym",
          placeholderTitle: "e.g. Flash 48-Hour Recovery Clinic & Sauna Access",
          placeholderBody: "Exclusive recovery masterclass with verified PR reviews this Saturday.",
          promoLabel: "Promo code to show in the message (optional)",
        };
    }
  };

  const cfg = getModalConfig();

  const handleSend = () => {
    setFieldErrors({});
    setFormError(null);
    startTransition(async () => {
      const result = await sendCrmBroadcast({
        facilityId: facility.id,
        suiteMode,
        audience,
        title,
        body,
        promoCode,
        badgeText: `${suiteMode} CRM`,
      });
      if (!result.ok) {
        if (result.state === "form_validation") setFieldErrors(result.fieldErrors);
        else setFormError(result.message);
        return;
      }
      setRecipientCount(result.data.recipientCount);
      setIsSent(true);
      onBroadcastSent?.(result.data);
      setTimeout(() => {
        setIsSent(false);
        setTitle("");
        setBody("");
        setPromoCode("");
        onClose();
      }, 1800);
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="broadcast-dialog-title"
        tabIndex={-1}
        style={{
          outline: "none",
          width: "100%",
          maxWidth: "540px",
          backgroundColor: "#111319",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "24px",
          padding: "28px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.85)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #FF6B7A, #E11D48)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={16} color="#FFFFFF" />
            </div>
            <div>
              <h3 id="broadcast-dialog-title" style={{ fontSize: "17px", fontWeight: 900, color: "#FFFFFF" }}>
                {cfg.title}
              </h3>
              <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{cfg.sub}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "16px",
              backgroundColor: "#1A1D27",
              color: "#9CA3AF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {isSent ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <CheckCircle size={48} color="#10B981" style={{ margin: "0 auto 14px" }} />
            <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF" }}>Broadcast sent</h4>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "6px" }}>
              {recipientCount === 0
                ? `No active members of ${facility.name} to receive it, so nothing was delivered.`
                : `Delivered to ${recipientCount} ${recipientCount === 1 ? "member" : "members"} of ${facility.name}.`}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Target Audience */}
            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Audience
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {[
                  { id: "ALL" as const, label: "All active members" },
                  ...(audiences?.segments ?? []).map((segment) => ({ id: segment.key, label: segment.label })),
                ].map((aud) => (
                  <button
                    key={aud.id}
                    type="button"
                    aria-pressed={audience === aud.id}
                    onClick={() => setAudience(aud.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      backgroundColor: audience === aud.id ? "#E11D48" : "#181B24",
                      color: audience === aud.id ? "#FFFFFF" : "#D1D5DB",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      cursor: "pointer",
                    }}
                  >
                    {aud.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: "12px", color: "#D1D5DB", margin: "8px 0 0" }}>
                {audiences === null
                  ? "Checking who this will reach…"
                  : audience !== "ALL"
                    ? "Goes to the active members in this segment."
                    : audiences.activeMembers === 0
                      ? `${facility.name} has no active members yet, so nobody would receive this.`
                      : `Goes to ${audiences.activeMembers} active ${audiences.activeMembers === 1 ? "member" : "members"} of ${facility.name}.`}
              </p>
            </div>

            {/* Headline */}
            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Broadcast Headline
              </label>
              <input
                aria-label="Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={cfg.placeholderTitle}
                style={{
                  width: "100%",
                  backgroundColor: "#181B24",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            {/* Body */}
            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Message Content
              </label>
              <textarea
                aria-label="Message"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={cfg.placeholderBody}
                rows={3}
                style={{
                  width: "100%",
                  backgroundColor: "#181B24",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  outline: "none",
                  resize: "none",
                }}
              />
            </div>

            {/* Optional Voucher Tag */}
            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {cfg.promoLabel}
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  aria-label="Promo code (optional)"
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="e.g. GPVIP20"
                  style={{
                    flex: 1,
                    backgroundColor: "#181B24",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    color: "#FF5364",
                    fontWeight: 800,
                    fontSize: "12px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPromoCode("METROGP2026")}
                  style={{
                    backgroundColor: "#1F2432",
                    color: "#D1D5DB",
                    padding: "0 12px",
                    borderRadius: "10px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  Generate Code
                </button>
              </div>
            </div>

            {(Object.keys(fieldErrors).length > 0 || formError) && (
              <div
                role="alert"
                style={{
                  backgroundColor: "#2A1418",
                  color: "#FCA5A5",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
              >
                {formError ?? Object.values(fieldErrors).join(" · ")}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSend}
              disabled={isPending || (audience === "ALL" && audiences?.activeMembers === 0)}
              style={{
                marginTop: "10px",
                padding: "12px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #FF6B7A 0%, #FF3D57 50%, #E11D48 100%)",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 900,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(225, 29, 72, 0.4)",
              }}
            >
              <Send size={15} />
              <span>{isPending ? "Sending…" : "Broadcast Now"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
