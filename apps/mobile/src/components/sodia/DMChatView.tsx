import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Send, Paperclip, Flame, Award, Briefcase, CheckCircle2, Radio, Tag } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { useCrmMessagingStore } from "../../store/crmMessagingStore";
import type { DMThread } from "./InboxView";
import { chatStyles as styles } from "./DMChatView.styles";

interface DMChatViewProps {
  thread: DMThread;
  onBack: () => void;
}

export function DMChatView({ thread, onBack }: DMChatViewProps) {
  const insets = useSafeAreaInsets();
  const { colors, themeMode } = useThemeStore();
  const { threadMessages, sendMessage } = useCrmMessagingStore();

  const [inputText, setInputText] = useState("");
  const [hasCongratulated, setHasCongratulated] = useState(false);
  const [hasAcceptedHandshake, setHasAcceptedHandshake] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  const messages = threadMessages[thread.id] || [];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    sendMessage(thread.id, inputText.trim());
    setInputText("");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
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
      <ScrollView style={styles.chatViewport} showsVerticalScrollIndicator={false}>
        {/* DEFAULT GREETING */}
        <View style={[styles.incomingBubble, { backgroundColor: colors.bgCard, borderColor: colors.borderColor, borderWidth: 1 }]}>
          <Text style={[styles.bubbleText, { color: colors.textPrimary }]}>Hey Darelle! Great training session this morning.</Text>
          <Text style={[styles.bubbleTime, { color: colors.textMuted }]}>08:30 AM</Text>
        </View>

        {/* INTERACTIVE TRACKER STAMP BUBBLE (Fitness Native) */}
        <View style={[styles.outgoingBubble, { backgroundColor: themeMode === "light" ? "#E11D48" : "#27272A" }]}>
          <View style={[styles.stampCard, { backgroundColor: themeMode === "light" ? "rgba(0,0,0,0.15)" : "#121215" }]}>
            <View style={styles.stampHeader}>
              <Award size={14} color="#10B981" />
              <Text style={styles.stampType}>LIFT STAMP • PR VERIFIED</Text>
            </View>
            <Text style={styles.stampMetric}>225 KG</Text>
            <Text style={[styles.stampDesc, themeMode === "light" && { color: "#FAFAFA" }]}>Conventional Deadlift • 1 Rep @ RPE 9.5</Text>
            <TouchableOpacity
              onPress={() => setHasCongratulated((prev) => !prev)}
              style={[styles.congratulateBtn, hasCongratulated && styles.congratulatedActive]}
            >
              <Flame size={14} color={hasCongratulated ? "#FFFFFF" : "#F97316"} />
              <Text style={[styles.congratulateText, hasCongratulated && styles.congratulateTextActive]}>
                {hasCongratulated ? "Fired Up! (1)" : "Congratulate"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.bubbleTime, themeMode === "light" && { color: "rgba(255,255,255,0.7)" }]}>08:32 AM</Text>
        </View>

        {/* COACH RAW DATA DEEP LINK BUBBLE */}
        {thread.type === "coach" && (
          <View style={[styles.incomingBubble, { backgroundColor: colors.bgCard, borderColor: colors.borderColor, borderWidth: 1 }]}>
            <Text style={[styles.bubbleText, { color: colors.textPrimary }]}>I reviewed your last set bar-speed curve.</Text>
            <TouchableOpacity onPress={() => setShowRawData(!showRawData)} style={[styles.rawDeepLinkBtn, { backgroundColor: colors.bgCardSecondary }]}>
              <Text style={styles.rawDeepLinkText}>
                {showRawData ? "📊 Hide Telemetry" : "📊 View Raw Data (Sets & RPE Breakdown)"}
              </Text>
            </TouchableOpacity>
            {showRawData && (
              <View style={{ marginTop: 8, padding: 8, backgroundColor: colors.bgCardSecondary, borderRadius: 8 }}>
                <Text style={{ color: "#10B981", fontSize: 11, fontWeight: "700" }}>Set 1: 140kg @ 0.62 m/s (RPE 7.0)</Text>
                <Text style={{ color: "#F59E0B", fontSize: 11, fontWeight: "700" }}>Set 2: 180kg @ 0.44 m/s (RPE 8.5)</Text>
                <Text style={{ color: "#E11D48", fontSize: 11, fontWeight: "700" }}>Set 3: 225kg @ 0.19 m/s (RPE 9.5 PR)</Text>
              </View>
            )}
            <Text style={[styles.bubbleTime, { color: colors.textMuted }]}>08:35 AM</Text>
          </View>
        )}

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
        {thread.type === "handshake" && (
          <View style={[styles.handshakeCard, { backgroundColor: colors.bgCard }]}>
            <View style={styles.handshakeHeader}>
              <Briefcase size={16} color="#E11D48" />
              <Text style={styles.handshakeTitle}>OFFICIAL B2B STAFF INVITATION</Text>
            </View>
            <Text style={[styles.handshakeBody, { color: colors.textSecondary }]}>
              Metro Core Arena has invited you to join their frontline team as Front-Desk Staff & POS Operator.
            </Text>
            <TouchableOpacity
              onPress={() => setHasAcceptedHandshake(true)}
              disabled={hasAcceptedHandshake}
              style={[styles.handshakeBtn, hasAcceptedHandshake && styles.handshakeBtnSuccess]}
            >
              {hasAcceptedHandshake ? (
                <>
                  <CheckCircle2 size={16} color="#10B981" />
                  <Text style={styles.handshakeSuccessText}>Handshake Accepted • Role Added</Text>
                </>
              ) : (
                <Text style={styles.handshakeBtnText}>Review & Accept Role</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* INPUT BAR */}
      <View style={[styles.inputContainer, { backgroundColor: colors.bgHeader, borderTopColor: colors.borderColor }]}>
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
    </View>
  );
}
