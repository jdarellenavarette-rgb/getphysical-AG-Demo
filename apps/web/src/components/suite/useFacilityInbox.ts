"use client";

import { useCallback, useEffect, useState } from "react";
import type { MessageRow } from "sodia-core";
import { loadFacilityInbox, type InboxThread } from "../../app/actions/crm";
import { getBrowserSupabase } from "../../lib/supabase/browser";

export interface InboxTicket {
  id: string; // conversation id
  athleteId: string;
  athleteName: string;
  avatar: string;
  handle: string;
  channel: "GATE_EXPIRATION" | "AT_RISK" | "FORM_CHECK" | "GENERAL_INQUIRY";
  lastMessage: string;
  time: string;
  unread: boolean;
  status: "OPEN" | "RESOLVED";
  tag: string;
  tagColor: string;
  athleteMeta: { membership: string; lastVisit: string; primary1RM?: string; phone: string };
  messages: { id: string; sender: "athlete" | "business"; text: string; time: string }[];
}

export type InboxStatus = "loading" | "empty" | "success" | "error" | "session_expired" | "permission_denied";

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "GP"
  );
}

function toTicket(thread: InboxThread): InboxTicket {
  const last = thread.messages[thread.messages.length - 1];
  const active = thread.membershipStatus === "ACTIVE";
  return {
    id: thread.conversationId,
    athleteId: thread.athleteId,
    athleteName: thread.athleteName,
    avatar: initials(thread.athleteName),
    handle: thread.athleteHandle ?? "",
    channel: "GENERAL_INQUIRY",
    lastMessage: last?.body ?? "No messages yet",
    time: formatTime(thread.lastMessageAt),
    unread: Boolean(last && !last.fromFacility),
    status: "OPEN",
    tag: active ? "Active member" : "Inactive member",
    tagColor: active ? "#059669" : "#9CA3AF",
    athleteMeta: {
      membership: thread.membershipStatus ?? "—",
      lastVisit: thread.lastVisitAt ? new Date(thread.lastVisitAt).toLocaleString() : "No check-ins yet",
      phone: "—",
    },
    messages: thread.messages.map((m) => ({
      id: m.id,
      sender: m.fromFacility ? "business" : "athlete",
      text: m.body,
      time: formatTime(m.createdAt),
    })),
  };
}

/** Facility CRM inbox: server-loaded threads + live updates over RLS-scoped Realtime. */
export function useFacilityInbox(facilityId: string) {
  const [tickets, setTickets] = useState<InboxTicket[]>([]);
  const [status, setStatus] = useState<InboxStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const result = await loadFacilityInbox(facilityId);
    if (!result.ok) {
      setStatus(result.state === "form_validation" ? "error" : result.state);
      setErrorMessage(
        result.state === "form_validation"
          ? "Invalid request"
          : `${result.message}${result.code ? ` (ref ${result.code})` : ""}`,
      );
      return;
    }
    setTickets(result.data.map(toTicket));
    setStatus(result.data.length === 0 ? "empty" : "success");
    setErrorMessage(null);
  }, [facilityId]);

  useEffect(() => {
    void reload();
    const supabase = getBrowserSupabase();
    // RLS also delivers the operator's own DMs and other facilities they staff, so
    // messages for threads not in this inbox are ignored; new threads arrive through
    // the conversations subscription, which is filtered to this facility.
    const onThreadChange = (payload: { new: unknown }) => {
      const id = (payload.new as { id?: string }).id;
      setTickets((current) => {
        if (id && !current.some((t) => t.id === id)) void reload();
        return current;
      });
    };
    const threadFilter = { schema: "public", table: "conversations", filter: `facility_id=eq.${facilityId}` };
    const channel = supabase
      .channel(`facility-inbox:${facilityId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const row = payload.new as MessageRow;
        setTickets((current) => {
          const index = current.findIndex((t) => t.id === row.conversation_id);
          if (index === -1) return current;
          const ticket = current[index]!;
          if (ticket.messages.some((m) => m.id === row.id)) return current;
          const fromFacility = row.sender_kind === "FACILITY";
          const updated: InboxTicket = {
            ...ticket,
            messages: [
              ...ticket.messages,
              {
                id: row.id,
                sender: fromFacility ? "business" : "athlete",
                text: row.body,
                time: formatTime(row.created_at),
              },
            ],
            lastMessage: row.body,
            time: formatTime(row.created_at),
            unread: !fromFacility,
          };
          return [updated, ...current.filter((_, i) => i !== index)];
        });
        setStatus("success");
      })
      .on("postgres_changes", { event: "INSERT", ...threadFilter }, onThreadChange)
      .on("postgres_changes", { event: "UPDATE", ...threadFilter }, onThreadChange)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [facilityId, reload]);

  return { tickets, setTickets, status, errorMessage, reload };
}
