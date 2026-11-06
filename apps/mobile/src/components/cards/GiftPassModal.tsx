import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomSheetTextInput, useBottomSheetScrollableCreator } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle2, Send, Ticket, X } from "lucide-react-native";
import { MIN_TOUCH_TARGET, type PassRow } from "sodia-core";
import { useColors } from "../../theme/theme";
import { AppBottomSheet } from "../sheets/AppBottomSheet";

interface GiftPassModalProps {
  visible: boolean;
  passes: readonly PassRow[];
  onClose: () => void;
  onSendPass: (passId: string, recipientName: string, message: string) => void;
}

const FRIEND_SUGGESTIONS = [
  { name: "Sarah Jenkins", handle: "@sarah.fit" },
  { name: "Coach Miguel Ramos", handle: "@coach.miguel" },
  { name: "Dave Santos", handle: "@dave.lift" },
] as const;

export function GiftPassModal({ visible, passes, onClose, onSendPass }: GiftPassModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const renderScrollComponent = useBottomSheetScrollableCreator();
  const [selectedPassId, setSelectedPassId] = useState(passes[0]?.id ?? "");
  const [recipient, setRecipient] = useState<string>(FRIEND_SUGGESTIONS[0].name);
  const [note, setNote] = useState("Join me for a heavy training session at Metro Core!");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!passes.some((p) => p.id === selectedPassId)) setSelectedPassId(passes[0]?.id ?? "");
  }, [passes, selectedPassId]);

  const send = () => {
    if (!selectedPassId) return setError("Add a pass to your wallet before gifting.");
    if (!recipient.trim()) return setError("Enter an athlete name or @handle.");
    setError(null);
    onSendPass(selectedPassId, recipient.trim(), note);
  };

  const input = [styles.input, { backgroundColor: colors.bgCardSecondary, color: colors.textPrimary, borderColor: colors.borderColor }];

  const header = (
    <View>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Send size={16} color={colors.accentText} />
          <Text style={[styles.badgeText, { color: colors.accentText }]} accessibilityRole="header">Gift a pass</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Close gift pass">
          <X size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.section, { color: colors.textPrimary }]}>1. Choose a pass</Text>
      {passes.length === 0 ? <Text style={[styles.empty, { color: colors.textMuted }]}>No active passes in your wallet yet.</Text> : null}
    </View>
  );

  const footer = (
    <View style={{ paddingBottom: insets.bottom + 24 }}>
      <Text style={[styles.section, styles.gap, { color: colors.textPrimary }]}>2. Recipient</Text>
      <View style={styles.pills}>
        {FRIEND_SUGGESTIONS.map((f) => {
          const active = recipient === f.name;
          return (
            <TouchableOpacity
              key={f.handle}
              onPress={() => setRecipient(f.name)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${f.name} ${f.handle}`}
              style={[styles.pill, { backgroundColor: active ? colors.accent : colors.bgCardSecondary, borderColor: active ? colors.accent : colors.borderColor }]}
            >
              <Text style={[styles.pillText, { color: active ? colors.textOnAccent : colors.textPrimary }]}>{f.name.split(" ")[0]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <BottomSheetTextInput style={input} value={recipient} onChangeText={setRecipient} placeholder="Name or @handle" placeholderTextColor={colors.textMuted} accessibilityLabel="Recipient" />
      <Text style={[styles.section, styles.gap, { color: colors.textPrimary }]}>3. Message</Text>
      <BottomSheetTextInput style={[input, styles.textArea]} value={note} onChangeText={setNote} placeholder="Add a note…" placeholderTextColor={colors.textMuted} multiline accessibilityLabel="Message" />
      {error ? (
        <Text style={[styles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      <TouchableOpacity onPress={send} style={[styles.cta, { backgroundColor: colors.accent }]} accessibilityRole="button">
        <Send size={16} color={colors.textOnAccent} />
        <Text style={[styles.ctaText, { color: colors.textOnAccent }]}>Send pass</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <AppBottomSheet visible={visible} onClose={onClose} snapPoints={["85%"]} accessibilityLabel="Gift a pass">
      <FlashList
        data={passes}
        keyExtractor={(p) => p.id}
        extraData={selectedPassId}
        renderScrollComponent={renderScrollComponent}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item: p }) => {
          const active = p.id === selectedPassId;
          return (
            <TouchableOpacity
              onPress={() => setSelectedPassId(p.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              style={[styles.passOption, { backgroundColor: colors.bgCardSecondary, borderColor: active ? colors.accent : colors.borderColor }]}
            >
              <Ticket size={18} color={active ? colors.accentText : colors.textMuted} />
              <View style={styles.flex}>
                <Text style={[styles.passTitle, { color: colors.textPrimary }]}>{p.pass_type}</Text>
                <Text style={[styles.passSub, { color: colors.textMuted }]}>Metro Core Arena • Active</Text>
              </View>
              {active && <CheckCircle2 size={18} color={colors.accentText} />}
            </TouchableOpacity>
          );
        }}
      />
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  flex: { flex: 1, marginLeft: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  badgeText: { fontSize: 18, fontWeight: "900" },
  close: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  section: { fontSize: 14, fontWeight: "800", marginBottom: 8 },
  gap: { marginTop: 18 },
  empty: { fontSize: 13 },
  sep: { height: 8 },
  passOption: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1.5, minHeight: 60 },
  passTitle: { fontSize: 14, fontWeight: "800" },
  passSub: { fontSize: 12, marginTop: 1 },
  pills: { flexDirection: "row", gap: 8, marginBottom: 8 },
  pill: { minHeight: 36, justifyContent: "center", paddingHorizontal: 14, borderRadius: 18, borderWidth: 1 },
  pillText: { fontSize: 13, fontWeight: "700" },
  input: { minHeight: 44, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, fontSize: 14 },
  textArea: { height: 80, textAlignVertical: "top", paddingTop: 10 },
  error: { fontSize: 13, marginTop: 10 },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52, borderRadius: 14, marginTop: 20 },
  ctaText: { fontSize: 15, fontWeight: "800" },
});
