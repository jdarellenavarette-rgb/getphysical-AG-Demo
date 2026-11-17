import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Send, Radio, Tag } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { isOwnMessage, useCrmMessagingStore } from "../../store/crmMessagingStore";
import type { DMThread } from "./InboxView";
import { Avatar } from "../common/Avatar";
import { haptics } from "../../lib/haptics";
import { chatStyles as styles } from "./DMChatView.styles";

interface DMChatViewProps {
  thread: DMThread;
  onBack: () => void;
}

export function DMChatView({ thread, onBack }: DMChatViewProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStore();
  const { threadMessages, sendMessage, setActiveThread, lastError } = useCrmMessagingStore();

  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [inputText, setInputText] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const messages = threadMessages[thread.id] || [];

  // Opening a chat marks it read and keeps it read while it is on screen.
  useEffect(() => {
    setActiveThread(thread.id);
    const timer = setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 50);
    return () => {
      clearTimeout(timer);
      setActiveThread(null);
    };
  }, [thread.id, setActiveThread]);

  useEffect(() => {
    const showEv = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEv = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEv, () => {
      setIsKeyboardOpen(true);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hideSub = Keyboard.addListener(hideEv, () => setIsKeyboardOpen(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    haptics.tap();
    sendMessage(thread.id, inputText.trim());
    setInputText("");
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bgScreen }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* HEADER WITH SAFE NOTCH INSET */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 6,
            height: insets.top + 56,
            backgroundColor: colors.bgHeader,
            borderBottomColor: colors.borderColor,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to messages"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Avatar uri={thread.avatar} name={thread.name} size={36} style={styles.headerAvatar} />
        <View style={styles.headerMeta}>
          <Text style={[styles.headerName, { color: colors.textPrimary }]}>{thread.name}</Text>
          {thread.isOnline ? <Text style={styles.headerStatus}>Active now</Text> : null}
        </View>
      </View>

      {/* CHAT MESSAGES */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatViewport}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {messages.length === 0 && (
          <Text style={[styles.emptyThread, { color: colors.textMuted }]}>
            No messages yet. Say hello to {thread.name}.
          </Text>
        )}

        {/* DYNAMIC MESSAGES FROM CRM STORE */}
        {messages.map((msg) => {
          if (msg.isCrmBroadcast && msg.broadcastData) {
            return (
              <View
                key={msg.id}
                style={[styles.broadcastCard, { backgroundColor: colors.bgCard, borderColor: "#E11D48" }]}
              >
                <View style={styles.broadcastHeader}>
                  <View style={styles.broadcastTag}>
                    <Radio size={10} color="#FFFFFF" />
                    <Text style={styles.broadcastTagText}>OFFICIAL FACILITY BROADCAST</Text>
                  </View>
                  <Text style={[styles.broadcastTime, { color: colors.textMuted }]}>{msg.time}</Text>
                </View>
                <Text style={[styles.broadcastTitle, { color: colors.textPrimary }]}>{msg.broadcastData.title}</Text>
                <Text style={[styles.broadcastBody, { color: colors.textSecondary }]}>{msg.broadcastData.body}</Text>
                {msg.broadcastData.promoCode ? (
                  <View style={styles.promoCodePill}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Tag size={12} color="#E11D48" />
                      <Text style={styles.promoCodeLabel}>VOUCHER CREDIT CODE:</Text>
                    </View>
                    <Text style={styles.promoCodeVal}>{msg.broadcastData.promoCode}</Text>
                  </View>
                ) : null}
              </View>
            );
          }

          const isOutgoing = isOwnMessage(msg.senderId);
          return (
            <View
              key={msg.id}
              style={[
                isOutgoing ? styles.outgoingBubble : styles.incomingBubble,
                { backgroundColor: isOutgoing ? colors.accent : colors.bgCard },
                !isOutgoing && { borderColor: colors.borderColor, borderWidth: 1 },
              ]}
            >
              <Text style={[styles.bubbleText, { color: isOutgoing ? "#FFFFFF" : colors.textPrimary }]}>
                {msg.text}
              </Text>
              <Text style={[styles.bubbleTime, { color: isOutgoing ? "rgba(255,255,255,0.7)" : colors.textMuted }]}>
                {msg.time}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {lastError ? <Text style={styles.sendError}>{lastError}</Text> : null}

      {/* INPUT BAR */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.bgHeader,
            borderTopColor: colors.borderColor,
            paddingBottom: isKeyboardOpen ? 10 : Math.max(insets.bottom, 12),
          },
        ]}
      >
        <TextInput
          style={[styles.chatInput, { backgroundColor: colors.bgInput, color: colors.textPrimary }]}
          placeholder={`Message ${thread.name}`}
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
          accessibilityLabel="Message"
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          style={styles.sendBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Send size={18} color="#FAFAFA" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
