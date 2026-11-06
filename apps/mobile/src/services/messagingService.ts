import { EXPLICIT_COLUMNS, type CrmChatMessage, type GetPhysicalClient, type MessageRow } from "sodia-core";
import type { DMThread } from "../components/sodia/InboxView";

/**
 * Reads the signed-in athlete's conversations (facility CRM threads + DMs).
 * RLS limits every query to conversations the user participates in.
 */
export interface LoadedInbox {
  threads: DMThread[];
  messages: Record<string, CrmChatMessage[]>;
}

export function formatTimeAgo(iso: string | null): string {
  if (!iso) return "";
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatClock(iso: string | null): string {
  return iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
}

export function toChatMessage(
  row: Pick<MessageRow, "id" | "conversation_id" | "sender_id" | "sender_kind" | "body" | "broadcast_id" | "created_at">,
  senderName: string,
  senderAvatar: string | undefined
): CrmChatMessage {
  const fromFacility = row.sender_kind === "FACILITY";
  return {
    id: row.id,
    threadId: row.conversation_id,
    senderId: fromFacility ? "business" : row.sender_id,
    senderName,
    senderAvatar,
    text: row.body,
    createdAt: row.created_at ?? new Date().toISOString(),
    time: formatClock(row.created_at),
    isCrmBroadcast: row.broadcast_id !== null,
  };
}

export async function loadInbox(supabase: GetPhysicalClient, userId: string): Promise<LoadedInbox> {
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`${EXPLICIT_COLUMNS.CONVERSATIONS}, facilities(name, logo_url), conversation_participants(user_id, last_read_at)`)
    .order("last_message_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  if (conversations.length === 0) return { threads: [], messages: {} };

  const ids = conversations.map((c) => c.id);
  const otherUserIds = conversations
    .flatMap((c) => c.conversation_participants.map((p) => p.user_id))
    .filter((id) => id !== userId);

  const [{ data: rows, error: messagesError }, { data: people }] = await Promise.all([
    supabase.from("messages").select(EXPLICIT_COLUMNS.MESSAGES).in("conversation_id", ids).order("created_at", { ascending: true }).limit(2000),
    otherUserIds.length > 0
      ? supabase.from("profiles").select("id, name, username, avatar_url").in("id", otherUserIds)
      : Promise.resolve({ data: [] as { id: string; name: string; username: string | null; avatar_url: string | null }[] }),
  ]);
  if (messagesError) throw new Error(messagesError.message);

  const threads: DMThread[] = [];
  const messages: Record<string, CrmChatMessage[]> = {};

  for (const conversation of conversations) {
    const mine = conversation.conversation_participants.find((p) => p.user_id === userId);
    const other = people?.find((p) => conversation.conversation_participants.some((cp) => cp.user_id === p.id));
    const isFacility = conversation.kind === "FACILITY";
    const name = isFacility
      ? conversation.facilities?.name ?? "Facility"
      : conversation.title ?? other?.name ?? other?.username ?? "Conversation";
    const avatar = (isFacility ? conversation.facilities?.logo_url : other?.avatar_url) ?? "";

    const threadRows = (rows ?? []).filter((r) => r.conversation_id === conversation.id);
    messages[conversation.id] = threadRows.map((r) =>
      toChatMessage(r, r.sender_kind === "FACILITY" ? name : r.sender_id === userId ? "You" : name, avatar || undefined)
    );
    const last = threadRows[threadRows.length - 1];
    const unreadCount = threadRows.filter(
      (r) => r.sender_id !== userId && (!mine?.last_read_at || (r.created_at ?? "") > mine.last_read_at)
    ).length;

    threads.push({
      id: conversation.id,
      name,
      avatar,
      lastMessage: last ? (last.broadcast_id ? `📢 ${last.body.split("\n")[0]}` : last.body) : "",
      timeAgo: formatTimeAgo(conversation.last_message_at),
      unreadCount,
      type: isFacility ? "handshake" : conversation.kind === "GROUP" ? "group" : "direct",
      badgeText: isFacility ? "FACILITY" : undefined,
    });
  }
  return { threads, messages };
}
