"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, Megaphone, MessageSquare, Send } from "lucide-react";
import { sendCrmReply } from "../../app/actions/crm";
import { initialsOf } from "../../lib/format";
import type { SuiteMode } from "../../lib/suite-modes";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { EmptyState, Skeleton } from "../ui/states";
import { BroadcastDialog } from "./BroadcastDialog";
import { useFacilityInbox } from "./useFacilityInbox";

type Filter = "ALL" | "WAITING" | "ACTIVE" | "NOT_ACTIVE";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "WAITING", label: "Waiting for reply" },
  { id: "ACTIVE", label: "Active members" },
  { id: "NOT_ACTIVE", label: "Not active" },
];

interface InboxViewProps {
  facilityId: string;
  facilityName: string;
  suiteMode: SuiteMode;
}

/** Two-pane inbox: thread list and conversation. On narrow screens one pane shows at a time. */
export function InboxView({ facilityId, facilityName, suiteMode }: InboxViewProps) {
  const { tickets, setTickets, status, errorMessage, reload } = useFacilityInbox(facilityId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  const replyRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const visible = tickets.filter((t) =>
    filter === "WAITING"
      ? t.waiting
      : filter === "ACTIVE"
        ? t.isActiveMember
        : filter === "NOT_ACTIVE"
          ? !t.isActiveMember
          : true,
  );
  const active = tickets.find((t) => t.id === selectedId) ?? null;
  const messageCount = active?.messages.length ?? 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [selectedId, messageCount]);

  const send = (text: string) => {
    const body = text.trim();
    if (!body || !active) return;
    const conversationId = active.id;
    setReplyError(null);
    startSending(async () => {
      const result = await sendCrmReply({ conversationId, body });
      if (!result.ok) {
        setReplyError(
          result.state === "form_validation" ? Object.values(result.fieldErrors).join(" · ") : result.message,
        );
        return;
      }
      if (replyRef.current) replyRef.current.value = "";
      // Append straight away; the Realtime echo is de-duplicated by message id.
      setTickets((prev) =>
        prev.map((t) =>
          t.id === conversationId && !t.messages.some((m) => m.id === result.data.id)
            ? {
                ...t,
                messages: [...t.messages, { id: result.data.id, fromVenue: true, text: body, time: "Just now" }],
                lastMessage: body,
                waiting: false,
              }
            : t,
        ),
      );
    });
  };

  return (
    <>
      <div className="grid h-[calc(100dvh-13rem)] min-h-[30rem] overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[22rem_1fr]">
        {/* Thread list */}
        <section
          aria-label="Conversations"
          className={cn("flex min-h-0 flex-col border-border lg:border-r", active && "hidden lg:flex")}
        >
          <div className="grid gap-3 border-b border-border p-4">
            <Button onClick={() => setBroadcastOpen(true)}>
              <Megaphone size={16} aria-hidden /> New broadcast
            </Button>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "h-9 shrink-0 rounded-full px-3 text-sm font-semibold transition-colors",
                    filter === f.id ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-border",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto" aria-busy={status === "loading"}>
            {status === "loading" && (
              <div className="grid gap-3 p-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            )}
            {status === "empty" && (
              <EmptyState
                icon={MessageSquare}
                title="No conversations yet"
                description="Send a broadcast to your members to start one. Replies appear here."
              />
            )}
            {(status === "error" || status === "permission_denied" || status === "session_expired") && (
              <div role="alert" className="grid gap-3 p-6 text-center text-sm">
                <p className="text-danger">{errorMessage ?? "We couldn't load the inbox."}</p>
                {status === "session_expired" ? (
                  <a href="/login" className="font-semibold underline">
                    Sign in again
                  </a>
                ) : (
                  <Button variant="secondary" size="sm" className="justify-self-center" onClick={() => void reload()}>
                    Retry
                  </Button>
                )}
              </div>
            )}
            {status === "success" && visible.length === 0 && (
              <div className="grid gap-2 p-6 text-center text-sm text-muted-foreground">
                No conversations match this filter.
                <button
                  type="button"
                  className="font-semibold text-foreground underline"
                  onClick={() => setFilter("ALL")}
                >
                  Show all conversations
                </button>
              </div>
            )}
            <ul>
              {visible.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    aria-current={t.id === selectedId ? "true" : undefined}
                    onClick={() => setSelectedId(t.id)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted",
                      t.id === selectedId && "bg-muted",
                    )}
                  >
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold"
                      aria-hidden
                    >
                      {initialsOf(t.memberName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-semibold">{t.memberName}</span>
                        <span className="shrink-0 text-sm text-muted-foreground">{t.time}</span>
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">{t.lastMessage}</span>
                      <span className="mt-1 flex items-center gap-2">
                        {t.standing ? (
                          <Badge tone={t.standing.tone}>{t.standing.label}</Badge>
                        ) : (
                          <Badge>Not a member</Badge>
                        )}
                        {t.waiting && <Badge tone="danger">Waiting for reply</Badge>}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Conversation */}
        <section aria-label="Conversation" className={cn("min-h-0 flex-col", active ? "flex" : "hidden lg:flex")}>
          {!active ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="Choose a conversation"
                description="Pick a member on the left to read and reply."
              />
            </div>
          ) : (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 lg:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    aria-label="Back to conversations"
                    onClick={() => setSelectedId(null)}
                  >
                    <ArrowLeft size={18} aria-hidden />
                  </Button>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold">{active.memberName}</h2>
                    <p className="truncate text-sm text-muted-foreground">
                      {active.handle || "No username"} · {active.standing?.label ?? "Not a member"} · Last check-in{" "}
                      {active.lastVisit}
                    </p>
                  </div>
                </div>
                {!active.isActiveMember && (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={sending}
                    onClick={() =>
                      send(
                        `Hi ${active.memberName}, you don't have an active pass at ${facilityName} right now. You can renew in the Sodia app from the ${facilityName} page.`,
                      )
                    }
                  >
                    Send renewal reminder
                  </Button>
                )}
              </header>

              <div
                className="min-h-0 flex-1 overflow-y-auto px-4 py-5 lg:px-6"
                role="log"
                aria-label={`Messages with ${active.memberName}`}
              >
                <ol className="grid gap-3">
                  {active.messages.map((m) => (
                    <li key={m.id} className={cn("flex", m.fromVenue ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[min(34rem,85%)] rounded-2xl px-4 py-2.5 text-[0.9375rem] whitespace-pre-wrap",
                          m.fromVenue
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md bg-muted text-foreground",
                        )}
                      >
                        {m.text}
                        <span
                          className={cn(
                            "mt-1 block text-xs",
                            m.fromVenue ? "text-primary-foreground/80" : "text-muted-foreground",
                          )}
                        >
                          {m.time}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
                <div ref={endRef} />
              </div>

              <form
                className="grid gap-2 border-t border-border p-4 lg:px-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  send(replyRef.current?.value ?? "");
                }}
              >
                {replyError && (
                  <p role="alert" className="text-sm text-danger">
                    {replyError}
                  </p>
                )}
                <div className="flex gap-3">
                  <Input
                    ref={replyRef}
                    aria-label={`Reply to ${active.memberName}`}
                    placeholder="Write a reply…"
                    maxLength={4000}
                    autoComplete="off"
                  />
                  <Button type="submit" disabled={sending}>
                    <Send size={16} aria-hidden /> {sending ? "Sending…" : "Send"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>

      <BroadcastDialog
        open={broadcastOpen}
        onClose={() => {
          setBroadcastOpen(false);
          void reload();
        }}
        facilityId={facilityId}
        facilityName={facilityName}
        suiteMode={suiteMode}
      />
    </>
  );
}
