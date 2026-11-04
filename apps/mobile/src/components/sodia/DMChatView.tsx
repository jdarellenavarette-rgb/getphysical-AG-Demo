import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Send, Paperclip, Flame, Award, Briefcase, CheckCircle2 } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import type { DMThread } from "./InboxView";

interface DMChatViewProps {
  thread: DMThread;
  onBack: () => void;
}

export function DMChatView({ thread, onBack }: DMChatViewProps) {
  const insets = useSafeAreaInsets();
  const { colors, themeMode } = useThemeStore();
  const [inputText, setInputText] = useState("");
  const [hasCongratulated, setHasCongratulated] = useState(false);
  const [hasAcceptedHandshake, setHasAcceptedHandshake] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [extraMessages, setExtraMessages] = useState<{ id: string; text: string; time: string }[]>([]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setExtraMessages((prev) => [
      ...prev,
      { id: `msg_${Date.now()}`, text: inputText.trim(), time: "Just now" },
    ]);
    setInputText("");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      {/* HEADER WITH SAFE NOTCH INSET */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 50) + 6, height: Math.max(insets.top, 50) + 56, backgroundColor: colors.bgHeader, borderBottomColor: colors.borderColor }]}>
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
        {/* INCOMING TEXT */}
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

        {/* EXTRA USER MESSAGES */}
        {extraMessages.map((msg) => (
          <View key={msg.id} style={[styles.outgoingBubble, { backgroundColor: themeMode === "light" ? "#E11D48" : "#27272A" }]}>
            <Text style={[styles.bubbleText, { color: "#FFFFFF" }]}>{msg.text}</Text>
            <Text style={[styles.bubbleTime, themeMode === "light" && { color: "rgba(255,255,255,0.7)" }]}>{msg.time}</Text>
          </View>
        ))}

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
          placeholder="Message..."
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderBottomWidth: 1 },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, marginLeft: 8 },
  headerMeta: { marginLeft: 10 },
  headerName: { fontSize: 13, fontWeight: "700" },
  headerStatus: { color: "#10B981", fontSize: 10, marginTop: 1 },
  chatViewport: { flex: 1, padding: 16 },
  incomingBubble: { alignSelf: "flex-start", borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, maxWidth: "80%", marginBottom: 12 },
  outgoingBubble: { alignSelf: "flex-end", borderRadius: 16, borderBottomRightRadius: 4, padding: 12, maxWidth: "85%", marginBottom: 12 },
  bubbleText: { fontSize: 13, lineHeight: 18 },
  bubbleTime: { fontSize: 9, alignSelf: "flex-end", marginTop: 4 },
  stampCard: { borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)" },
  stampHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  stampType: { color: "#10B981", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  stampMetric: { color: "#FAFAFA", fontSize: 22, fontWeight: "900", marginTop: 4 },
  stampDesc: { color: "#A1A1AA", fontSize: 11, marginTop: 2 },
  congratulateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(249, 115, 22, 0.15)", borderWidth: 1, borderColor: "rgba(249, 115, 22, 0.3)", borderRadius: 8, paddingVertical: 8, marginTop: 10 },
  congratulatedActive: { backgroundColor: "#F97316" },
  congratulateText: { color: "#F97316", fontSize: 11, fontWeight: "700" },
  congratulateTextActive: { color: "#FFFFFF" },
  rawDeepLinkBtn: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, marginTop: 8 },
  rawDeepLinkText: { color: "#38BDF8", fontSize: 11, fontWeight: "700" },
  handshakeCard: { borderRadius: 14, borderWidth: 1, borderColor: "#E11D48", padding: 14, marginBottom: 16 },
  handshakeHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  handshakeTitle: { color: "#E11D48", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  handshakeBody: { fontSize: 12, marginTop: 6, lineHeight: 17 },
  handshakeBtn: { backgroundColor: "#E11D48", borderRadius: 8, paddingVertical: 10, alignItems: "center", marginTop: 12 },
  handshakeBtnSuccess: { backgroundColor: "rgba(16, 185, 129, 0.15)", borderWidth: 1, borderColor: "#10B981", flexDirection: "row", justifyContent: "center", gap: 6 },
  handshakeBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  handshakeSuccessText: { color: "#10B981", fontSize: 12, fontWeight: "700" },
  inputContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, gap: 10 },
  attachBtn: { padding: 6 },
  chatInput: { flex: 1, height: 40, borderRadius: 20, paddingHorizontal: 16, fontSize: 13 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center" },
});
