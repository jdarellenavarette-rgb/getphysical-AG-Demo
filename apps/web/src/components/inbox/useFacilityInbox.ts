"use client";

import { useCallback, useEffect, useState } from "react";
import { describeStanding, memberStandingSchema, type MessageRow, type StandingLabel } from "sodia-core";
import { loadFacilityInbox, type InboxThread } from "../../app/actions/crm";
import { getBrowserSupabase } from "../../lib/supabase/browser";

export interface InboxMessage {
  id: string;
  fromVenue: boolean;
  text: string;
  time: string;
}

export interface InboxTicket {
  /** Conversation id. */
  id: string;
  memberName: string;
  handle: string;
  lastMessage: string;
  time: string;
  /** The member wrote last, so the thread is waiting on the venue. */
  waiting: boolean;
  /** Null when the person is not on the venue's member list. */
  standing: StandingLabel | null;
  isActiveMember: boolean;
  lastVisit: string;
  messages: InboxMessage[];
}

export type InboxStatus = "loading" | "empty" | "success" | "error" | "session_expired" | "permission_denied";

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function toTicket(thread: InboxThread): InboxTicket {
  const last = thread.messages[thread.messages.length - 1];
  const standing = memberStandingSchema.safeParse(thread.membershipStatus);
  return {
    id: thread.conversationId,
    memberName: thread.athleteName,
    handle: thread.athleteHandle ?? "",
    lastMessage: last?.body ?? "No messages yet",
    time: formatTime(thread.lastMessageAt),
    waiting: Boolean(last && !last.fromFacility),
    standing: standing.success ? describeStanding(standing.data) : null,
    isActiveMember: standing.success && standing.data === "ACTIVE",
    lastVisit: thread.lastVisitAt ? formatTime(thread.lastVisitAt) : "never",
    messages: thread.messages.map((m) => ({
      id: m.id,
      fromVenue: m.fromFacility,
      text: m.body,
      time: formatTime(m.createdAt),
    })),
  };
}

/** Venue inbox: server-loaded threads plus live updates over RLS-scoped Realtime. */
export function useFacilityInbox(facilityId: string) {
  const [tickets, setTickets] = useState<InboxTicket[]>([]);
  const [status, setStatus] = useState<InboxStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const result = await loadFacilityInbox(facilityId);
    if (!result.ok) {
      setStatus(result.state === "form_validation" ? "error" : result.state);
      setErrorMessage(result.state === "form_validation" ? "Invalid request" : result.message);
      return;
    }
    setTickets(result.data.map(toTicket));
    setStatus(result.data.length === 0 ? "empty" : "success");
    setErrorMessage(null);
  }, [facilityId]);

  useEffect(() => {
    void reload();
    const supabase = getBrowserSupabase();
    // RLS also delivers the operator's own DMs and other venues they staff, so messages for
    // threads not in this inbox are ignored; new threads arrive through the conversations
    // subscription, which is filtered to this venue.
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
          const fromVenue = row.sender_kind === "FACILITY";
          const updated: InboxTicket = {
            ...ticket,
            messages: [...ticket.messages, { id: row.id, fromVenue, text: row.body, time: formatTime(row.created_at) }],
            lastMessage: row.body,
            time: formatTime(row.created_at),
            waiting: !fromVenue,
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
