import React, { useMemo, useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Paperclip, Send } from "lucide-react-native";
import type { CrmChatMessage } from "sodia-core";
import { useThemeStore } from "../../theme/theme";
import { useCrmMessagingStore } from "../../store/crmMessagingStore";
import { haptics } from "../../lib/haptics";
import type { DMThread } from "./InboxView";
import { chatStyles as styles } from "./DMChatView.styles";
import { PRStampBubble, CoachTelemetryBubble, B2BHandshakeCard } from "./DMChatBubbleDecorators";
import { MessageBubble } from "./chat/MessageBubble";

interface DMChatViewProps {
  thread: DMThread;
  onBack: () => void;
}

type ChatRow =
  | { readonly kind: "greeting"; readonly id: string }
  | { readonly kind: "prStamp"; readonly id: string }
  | { readonly kind: "coachTelemetry"; readonly id: string }
  | { readonly kind: "handshake"; readonly id: string }
  | { readonly kind: "message"; readonly id: string; readonly msg: CrmChatMessage };

const EMPTY: readonly CrmChatMessage[] = [];

export function DMChatView({ thread, onBack }: DMChatViewProps) {
  const insets = useSafeAreaInsets();
  const { colors, themeMode } = useThemeStore();
  const messages = useCrmMessagingStore((s) => s.threadMessages[thread.id] ?? EMPTY);
  const sendMessage = useCrmMessagingStore((s) => s.sendMessage);
  const listRef = useRef<FlashListRef<ChatRow>>(null);
  const [inputText, setInputText] = useState("");

  const rows = useMemo<ChatRow[]>(
    () => [
      { kind: "greeting", id: "greeting" },
      { kind: "prStamp", id: "pr_stamp" },
      ...(thread.type === "coach" ? [{ kind: "coachTelemetry", id: "coach_telemetry" } as const] : []),
      ...messages.map((msg): ChatRow => ({ kind: "message", id: msg.id, msg })),
      ...(thread.type === "handshake" ? [{ kind: "handshake", id: "handshake" } as const] : []),
    ],
    [messages, thread.type]
  );

  const send = () => {
    const text = inputText.trim();
    if (!text) return;
    haptics.light();
    sendMessage(thread.id, text).catch(() => undefined);
    setInputText("");
  };

  const renderRow = ({ item }: { item: ChatRow }) => {
    switch (item.kind) {
      case "greeting":
        return (
          <View style={[styles.incomingBubble, { backgroundColor: colors.bgCard, borderColor: colors.borderColor, borderWidth: 1 }]}>
            <Text style={[styles.bubbleText, { color: colors.textPrimary }]}>Hey Darelle! Great training session this morning.</Text>
            <Text style={[styles.bubbleTime, { color: colors.textMuted }]}>08:30 AM</Text>
          </View>
        );
      case "prStamp":
        return <PRStampBubble themeMode={themeMode} />;
      case "coachTelemetry":
        return <CoachTelemetryBubble colors={colors} />;
      case "handshake":
        return <B2BHandshakeCard colors={colors} />;
      case "message":
        return <MessageBubble msg={item.msg} />;
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.bgScreen }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20), backgroundColor: colors.bgHeader, borderBottomColor: colors.borderColor }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back to messages">
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Image source={{ uri: thread.avatar }} style={styles.headerAvatar} />
        <View style={styles.headerMeta}>
          <Text style={[styles.headerName, { color: colors.textPrimary }]} accessibilityRole="header" numberOfLines={1}>{thread.name}</Text>
          <Text style={[styles.headerStatus, { color: thread.isOnline ? colors.accentGreen : colors.textMuted }]}>{thread.isOnline ? "Active now" : "Offline"}</Text>
        </View>
      </View>

      <FlashList
        ref={listRef}
        data={rows}
        keyExtractor={(r) => r.id}
        getItemType={(r) => r.kind}
        renderItem={renderRow}
        style={styles.chatViewport}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        maintainVisibleContentPosition={{ startRenderingFromBottom: true, autoscrollToBottomThreshold: 0.2 }}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.inputContainer, { backgroundColor: colors.bgHeader, borderTopColor: colors.borderColor, paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TouchableOpacity
          onPress={() => setInputText((p) => `${p ? `${p} ` : ""}📎 [225kg PR Verified]`)}
          style={styles.attachBtn}
          accessibilityRole="button"
          accessibilityLabel="Attach verified PR stamp"
        >
          <Paperclip size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <TextInput
          style={[styles.chatInput, { backgroundColor: colors.bgInput, color: colors.textPrimary }]}
          placeholder="Message…"
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={send}
          returnKeyType="send"
          accessibilityLabel={`Message ${thread.name}`}
        />
        <TouchableOpacity
          onPress={send}
          disabled={!inputText.trim()}
          style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.accent : colors.bgInput }]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: !inputText.trim() }}
        >
          <Send size={18} color={inputText.trim() ? colors.textOnAccent : colors.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
