import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { ArrowLeft, Send, Paperclip, Flame, Award, Briefcase, CheckCircle2 } from "lucide-react-native";
import type { DMThread } from "./InboxView";

interface DMChatViewProps {
  thread: DMThread;
  onBack: () => void;
}

export function DMChatView({ thread, onBack }: DMChatViewProps) {
  const [inputText, setInputText] = useState("");
  const [hasCongratulated, setHasCongratulated] = useState(false);
  const [hasAcceptedHandshake, setHasAcceptedHandshake] = useState(false);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FAFAFA" />
        </TouchableOpacity>
        <Image source={{ uri: thread.avatar }} style={styles.headerAvatar} />
        <View style={styles.headerMeta}>
          <Text style={styles.headerName}>{thread.name}</Text>
          <Text style={styles.headerStatus}>{thread.isOnline ? "Active now" : "Offline"}</Text>
        </View>
      </View>

      {/* CHAT MESSAGES */}
      <ScrollView style={styles.chatViewport} showsVerticalScrollIndicator={false}>
        {/* INCOMING TEXT */}
        <View style={styles.incomingBubble}>
          <Text style={styles.bubbleText}>Hey Adam! Great session this morning.</Text>
          <Text style={styles.bubbleTime}>08:30 AM</Text>
        </View>

        {/* INTERACTIVE TRACKER STAMP BUBBLE (Fitness Native) */}
        <View style={styles.outgoingBubble}>
          <View style={styles.stampCard}>
            <View style={styles.stampHeader}>
              <Award size={14} color="#10B981" />
              <Text style={styles.stampType}>LIFT STAMP • PR VERIFIED</Text>
            </View>
            <Text style={styles.stampMetric}>225 KG</Text>
            <Text style={styles.stampDesc}>Conventional Deadlift • 1 Rep @ RPE 9.5</Text>
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
          <Text style={styles.bubbleTime}>08:32 AM</Text>
        </View>

        {/* COACH RAW DATA DEEP LINK BUBBLE */}
        {thread.type === "coach" && (
          <View style={styles.incomingBubble}>
            <Text style={styles.bubbleText}>I reviewed your last set bar-speed curve.</Text>
            <TouchableOpacity style={styles.rawDeepLinkBtn}>
              <Text style={styles.rawDeepLinkText}>📊 View Raw Data (Sets & RPE Breakdown)</Text>
            </TouchableOpacity>
            <Text style={styles.bubbleTime}>08:35 AM</Text>
          </View>
        )}

        {/* B2B STAFF HANDSHAKE CARD */}
        {thread.type === "handshake" && (
          <View style={styles.handshakeCard}>
            <View style={styles.handshakeHeader}>
              <Briefcase size={16} color="#E11D48" />
              <Text style={styles.handshakeTitle}>OFFICIAL B2B STAFF INVITATION</Text>
            </View>
            <Text style={styles.handshakeBody}>
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
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachBtn}>
          <Paperclip size={18} color="#71717A" />
        </TouchableOpacity>
        <TextInput
          style={styles.chatInput}
          placeholder="Message..."
          placeholderTextColor="#71717A"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendBtn}>
          <Send size={18} color="#FAFAFA" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  backBtn: { padding: 4 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, marginLeft: 8 },
  headerMeta: { marginLeft: 10 },
  headerName: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  headerStatus: { color: "#10B981", fontSize: 10, marginTop: 1 },
  chatViewport: { flex: 1, padding: 16 },
  incomingBubble: { alignSelf: "flex-start", backgroundColor: "#18181B", borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, maxWidth: "80%", marginBottom: 12 },
  outgoingBubble: { alignSelf: "flex-end", backgroundColor: "#27272A", borderRadius: 16, borderBottomRightRadius: 4, padding: 12, maxWidth: "85%", marginBottom: 12 },
  bubbleText: { color: "#FAFAFA", fontSize: 13, lineHeight: 18 },
  bubbleTime: { color: "#71717A", fontSize: 9, alignSelf: "flex-end", marginTop: 4 },
  stampCard: { backgroundColor: "#121215", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)" },
  stampHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  stampType: { color: "#10B981", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  stampMetric: { color: "#FAFAFA", fontSize: 22, fontWeight: "900", marginTop: 4 },
  stampDesc: { color: "#A1A1AA", fontSize: 11, marginTop: 2 },
  congratulateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(249, 115, 22, 0.15)", borderWidth: 1, borderColor: "rgba(249, 115, 22, 0.3)", borderRadius: 8, paddingVertical: 8, marginTop: 10 },
  congratulatedActive: { backgroundColor: "#F97316" },
  congratulateText: { color: "#F97316", fontSize: 11, fontWeight: "700" },
  congratulateTextActive: { color: "#FFFFFF" },
  rawDeepLinkBtn: { backgroundColor: "#27272A", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, marginTop: 8 },
  rawDeepLinkText: { color: "#38BDF8", fontSize: 11, fontWeight: "700" },
  handshakeCard: { backgroundColor: "#121215", borderRadius: 14, borderWidth: 1, borderColor: "#E11D48", padding: 14, marginBottom: 16 },
  handshakeHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  handshakeTitle: { color: "#E11D48", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  handshakeBody: { color: "#D4D4D8", fontSize: 12, marginTop: 6, lineHeight: 17 },
  handshakeBtn: { backgroundColor: "#E11D48", borderRadius: 8, paddingVertical: 10, alignItems: "center", marginTop: 12 },
  handshakeBtnSuccess: { backgroundColor: "rgba(16, 185, 129, 0.15)", borderWidth: 1, borderColor: "#10B981", flexDirection: "row", justifyContent: "center", gap: 6 },
  handshakeBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  handshakeSuccessText: { color: "#10B981", fontSize: 12, fontWeight: "700" },
  inputContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#18181B", gap: 10 },
  attachBtn: { padding: 6 },
  chatInput: { flex: 1, height: 40, backgroundColor: "#18181B", borderRadius: 20, paddingHorizontal: 16, color: "#FAFAFA", fontSize: 13 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center" },
});
