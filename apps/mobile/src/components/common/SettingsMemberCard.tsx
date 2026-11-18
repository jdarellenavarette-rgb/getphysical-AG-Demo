import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Check, ChevronRight, Copy, MapPin, Share2 } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { canCopyDirectly, copyText } from "../../lib/clipboard";
import { haptics } from "../../lib/haptics";

interface SettingsMemberCardProps {
  onOpenMyVenues: () => void;
}

/**
 * The member's side of venue membership in Settings: the username the front
 * desk needs to add them, and the way in to "My venues".
 */
export function SettingsMemberCard({ onOpenMyVenues }: SettingsMemberCardProps) {
  const { profile, isGuest } = useEcosystemStore();
  const { colors } = useThemeStore();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const username = profile.username;
  const CopyIcon = copied ? Check : canCopyDirectly ? Copy : Share2;

  const handleCopy = async () => {
    if (!username) return;
    haptics.tap();
    if ((await copyText(username)) !== "copied") return;
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
      <Text style={styles.cardHeader}>MEMBERSHIP</Text>

      {isGuest ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Sign in to get a username venues can add you by, and to see the venues you belong to.
        </Text>
      ) : (
        <>
          <View style={styles.usernameRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Your username</Text>
              <Text selectable style={[styles.username, { color: colors.textPrimary }]}>
                {username ? `@${username}` : "Not set yet"}
              </Text>
            </View>
            {username ? (
              <TouchableOpacity
                onPress={() => void handleCopy()}
                style={[styles.copyBtn, { borderColor: colors.borderColor }]}
                accessibilityRole="button"
                accessibilityLabel={canCopyDirectly ? "Copy username" : "Copy or share username"}
              >
                <CopyIcon size={14} color={copied ? "#10B981" : colors.accent} />
                <Text style={[styles.copyText, { color: copied ? "#10B981" : colors.accent }]}>
                  {copied ? "Copied" : canCopyDirectly ? "Copy" : "Copy or share"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Give this to the front desk to be added as a member.
          </Text>
        </>
      )}

      <TouchableOpacity
        onPress={onOpenMyVenues}
        style={[styles.linkRow, { borderTopColor: colors.borderLight }]}
        accessibilityRole="button"
      >
        <View style={styles.linkLeft}>
          <MapPin size={15} color={colors.accent} />
          <Text style={[styles.linkTitle, { color: colors.textPrimary }]}>My venues</Text>
        </View>
        <ChevronRight size={14} color="#71717A" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  cardHeader: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 10 },
  usernameRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: { fontSize: 12 },
  username: { fontSize: 17, fontWeight: "800", marginTop: 2 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
  },
  copyText: { fontSize: 13, fontWeight: "800" },
  hint: { fontSize: 12, lineHeight: 17, marginTop: 8 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    marginTop: 12,
    paddingTop: 4,
    borderTopWidth: 1,
  },
  linkLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  linkTitle: { fontSize: 14, fontWeight: "700" },
});
