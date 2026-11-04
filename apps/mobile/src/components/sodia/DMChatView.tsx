import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Send, Paperclip, Radio, Tag } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { useCrmMessagingStore } from "../../store/crmMessagingStore";
import type { DMThread } from "./InboxView";
import { chatStyles as styles } from "./DMChatView.styles";
import { PRStampBubble, CoachTelemetryBubble, B2BHandshakeCard } from "./DMChatBubbleDecorators";

interface DMChatViewProps {
  thread: DMThread;
  onBack: () => void;
}

export function DMChatView({ thread, onBack }: DMChatViewProps) {
  const insets = useSafeAreaInsets();
  const { colors, themeMode } = useThemeStore();
  const { threadMessages, sendMessage } = useCrmMessagingStore();

  const scrollViewRef = useRef<any>(null);
  const [inputText, setInputText] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const messages = threadMessages[thread.id] || [];

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
            paddingTop: Math.max(insets.top, 50) + 6,
            height: Math.max(insets.top, 50) + 56,
            backgroundColor: colors.bgHeader,
            borderBottomColor: colors.borderColor,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Image source={{ uri: thread.avatar }} style={styles.headerAvatar} />
        <View style={styles.headerMeta}>
          <Text style={[styles.headerName, { color: colors.textPrimary }]}>{thread.name}</Text>
          <Text style={styles.headerStatus}>{thread.isOnline ? "Active now" : "Offline"}</Text>
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
        {/* DEFAULT GREETING */}
        <View style={[styles.incomingBubble, { backgroundColor: colors.bgCard, borderColor: colors.borderColor, borderWidth: 1 }]}>
          <Text style={[styles.bubbleText, { color: colors.textPrimary }]}>Hey Darelle! Great training session this morning.</Text>
          <Text style={[styles.bubbleTime, { color: colors.textMuted }]}>08:30 AM</Text>
        </View>

        {/* INTERACTIVE TRACKER STAMP BUBBLE */}
        <PRStampBubble themeMode={themeMode} />

        {/* COACH RAW DATA DEEP LINK BUBBLE */}
        {thread.type === "coach" && <CoachTelemetryBubble colors={colors} />}

        {/* DYNAMIC MESSAGES FROM CRM STORE */}
        {messages.map((msg) => {
          if (msg.isCrmBroadcast && msg.broadcastData) {
            return (
              <View key={msg.id} style={[styles.broadcastCard, { backgroundColor: colors.bgCard, borderColor: "#E11D48" }]}>
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

          const isOutgoing = msg.senderId === "usr_athlete_01";
          return (
            <View
              key={msg.id}
              style={[
                isOutgoing ? styles.outgoingBubble : styles.incomingBubble,
                { backgroundColor: isOutgoing ? (themeMode === "light" ? "#E11D48" : "#27272A") : colors.bgCard },
                !isOutgoing && { borderColor: colors.borderColor, borderWidth: 1 },
              ]}
            >
              <Text style={[styles.bubbleText, { color: isOutgoing ? "#FFFFFF" : colors.textPrimary }]}>{msg.text}</Text>
              <Text style={[styles.bubbleTime, { color: isOutgoing ? "rgba(255,255,255,0.7)" : colors.textMuted }]}>
                {msg.time}
              </Text>
            </View>
          );
        })}

        {/* B2B STAFF HANDSHAKE CARD */}
        {thread.type === "handshake" && <B2BHandshakeCard colors={colors} />}
      </ScrollView>

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
        <TouchableOpacity
          onPress={() => setInputText((p) => (p ? `${p} ` : "") + "📎 [225kg PR Verified]")}
          style={styles.attachBtn}
        >
          <Paperclip size={18} color={colors.textMuted} />
        </TouchableOpacity>
        <TextInput
          style={[styles.chatInput, { backgroundColor: colors.bgInput, color: colors.textPrimary }]}
          placeholder="Type message to Business Suite..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendBtn}>
          <Send size={18} color="#FAFAFA" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
