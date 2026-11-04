import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Send, Ticket, User, MessageSquare, CheckCircle2 } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import type { PassRow } from "sodia-core";

interface GiftPassModalProps {
  visible: boolean;
  passes: readonly PassRow[];
  onClose: () => void;
  onSendPass: (passId: string, recipientName: string, message: string) => void;
}

const FRIEND_SUGGESTIONS = [
  { name: "Sarah Jenkins", handle: "@sarah.fit", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
  { name: "Coach Miguel Ramos", handle: "@coach.miguel", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { name: "Dave Santos", handle: "@dave.lift", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
];

export function GiftPassModal({ visible, passes, onClose, onSendPass }: GiftPassModalProps) {
  const { colors } = useThemeStore();
  const [selectedPassId, setSelectedPassId] = useState<string>(passes[0]?.id ?? "");
  const [recipient, setRecipient] = useState(FRIEND_SUGGESTIONS[0]!.name);
  const [inviteNote, setInviteNote] = useState("Join me for a heavy training session at Metro Core!");

  if (!visible) return null;

  const handleSend = () => {
    if (!recipient.trim()) {
      Alert.alert("Missing Recipient", "Please enter athlete name or handle.");
      return;
    }
    onSendPass(selectedPassId, recipient, inviteNote);
    Alert.alert("Pass Gifted!", `Athletic pass successfully sent to ${recipient}!`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.sheetCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <Send size={15} color="#EC4899" />
              <Text style={styles.badgeText}>GIFT & TRANSFER PASS</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {/* SELECT PASS */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. Select Pass to Gift</Text>
            <View style={styles.passList}>
              {passes.length === 0 ? (
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>No active passes in wallet.</Text>
              ) : (
                passes.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setSelectedPassId(p.id)}
                    style={[styles.passOption, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }, selectedPassId === p.id && styles.passOptionActive]}
                  >
                    <Ticket size={18} color={selectedPassId === p.id ? "#EC4899" : colors.textMuted} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.passTitle, { color: colors.textPrimary }]}>{p.pass_type}</Text>
                      <Text style={[styles.passSub, { color: colors.textMuted }]}>Metro Core Arena • Active</Text>
                    </View>
                    {selectedPassId === p.id && <CheckCircle2 size={16} color="#EC4899" />}
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* CHOOSE RECIPIENT */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 16 }]}>2. Athlete Recipient</Text>
            <View style={styles.friendPillsRow}>
              {FRIEND_SUGGESTIONS.map((f) => (
                <TouchableOpacity
                  key={f.handle}
                  onPress={() => setRecipient(f.name)}
                  style={[styles.friendPill, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }, recipient === f.name && styles.friendPillActive]}
                >
                  <Text style={[styles.friendName, { color: colors.textPrimary }, recipient === f.name && { color: "#FFF" }]}>{f.name.split(" ")[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bgCardSecondary, color: colors.textPrimary, borderColor: colors.borderColor }]}
              value={recipient}
              onChangeText={setRecipient}
              placeholder="Recipient name or @handle"
              placeholderTextColor={colors.textMuted}
            />

            {/* INVITATION NOTE */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 16 }]}>3. Workout Invitation Message</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.bgCardSecondary, color: colors.textPrimary, borderColor: colors.borderColor }]}
              value={inviteNote}
              onChangeText={setInviteNote}
              placeholder="Add personal note..."
              placeholderTextColor={colors.textMuted}
              multiline
            />

            <TouchableOpacity onPress={handleSend} style={styles.sendCtaBtn}>
              <Send size={16} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.sendCtaText}>Transfer Pass to Athlete</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheetCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "85%", borderWidth: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  badgeText: { color: "#EC4899", fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  closeBtn: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  content: { paddingBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: "800", marginBottom: 8 },
  passList: { gap: 8 },
  passOption: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1 },
  passOptionActive: { borderColor: "#EC4899" },
  passTitle: { fontSize: 13, fontWeight: "800" },
  passSub: { fontSize: 11, marginTop: 1 },
  friendPillsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  friendPill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
  friendPillActive: { backgroundColor: "#EC4899", borderColor: "#EC4899" },
  friendName: { fontSize: 12, fontWeight: "700" },
  input: { height: 44, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, fontSize: 13 },
  textArea: { height: 72, textAlignVertical: "top", paddingTop: 10 },
  sendCtaBtn: { backgroundColor: "#EC4899", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 14, marginTop: 20 },
  sendCtaText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
});
