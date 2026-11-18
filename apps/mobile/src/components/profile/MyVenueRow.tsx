import React from "react";
import { ActivityIndicator, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useRecyclingState } from "@shopify/flash-list";
import { describeStanding, type MyMembershipRow, type StandingLabel } from "sodia-core";
import { useMemberStore } from "../../store/memberStore";
import { useThemeStore } from "../../theme/theme";
import { Avatar } from "../common/Avatar";
import { haptics } from "../../lib/haptics";

const TONE_COLOR: Record<StandingLabel["tone"], string> = {
  success: "#10B981",
  warning: "#F59E0B",
  neutral: "#A1A1AA",
  danger: "#F87171",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** One venue the member belongs to: standing, pass end date, mute switch and leave. */
export function MyVenueRow({ membership }: { membership: MyMembershipRow }) {
  const { colors } = useThemeStore();
  const setMuted = useMemberStore((state) => state.setMuted);
  const leave = useMemberStore((state) => state.leave);
  // The list reuses row views, so what a row remembers is reset when it is handed a different venue.
  const venueId = membership.facility_id;
  const [confirmingLeave, setConfirmingLeave] = useRecyclingState(false, [venueId]);
  const [leaving, setLeaving] = useRecyclingState(false, [venueId]);
  const [error, setError] = useRecyclingState<string | null>(null, [venueId]);

  const standing = describeStanding(membership.standing);
  const tone = TONE_COLOR[standing.tone];

  const handleMute = async (muted: boolean) => {
    haptics.tap();
    setError(null);
    const failure = await setMuted(membership.facility_id, muted);
    if (failure) setError(`Couldn't change broadcasts. ${failure}`);
  };

  const handleLeave = async () => {
    setLeaving(true);
    setError(null);
    const failure = await leave(membership.facility_id);
    // On success the row is removed from the list, so there is nothing left to update here.
    if (!failure) return;
    setLeaving(false);
    setConfirmingLeave(false);
    setError(`Couldn't leave this venue. ${failure}`);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
      <View style={styles.headRow}>
        <Avatar uri={membership.logo_url} name={membership.facility_name} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {membership.facility_name}
          </Text>
          <Text style={[styles.sentence, { color: colors.textSecondary }]}>{standing.forMember}</Text>
        </View>
        <View style={[styles.badge, { borderColor: tone }]}>
          <Text style={[styles.badgeText, { color: tone }]}>{standing.label}</Text>
        </View>
      </View>

      {membership.pass_valid_until ? (
        <Text style={[styles.passLine, { color: colors.textMuted }]}>
          {membership.standing === "LAPSED" ? "Pass ended" : "Pass valid until"}{" "}
          {formatDate(membership.pass_valid_until)}
        </Text>
      ) : null}

      <View style={[styles.controlRow, { borderTopColor: colors.borderLight }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.controlTitle, { color: colors.textPrimary }]}>Mute broadcasts</Text>
          <Text style={[styles.controlHint, { color: colors.textMuted }]}>Direct replies still reach you.</Text>
        </View>
        <Switch
          value={membership.broadcasts_muted}
          onValueChange={(value) => void handleMute(value)}
          trackColor={{ true: colors.accent, false: colors.borderColor }}
          accessibilityLabel={`Mute broadcasts from ${membership.facility_name}`}
        />
      </View>

      {confirmingLeave ? (
        <View style={[styles.confirmBox, { backgroundColor: colors.bgCardSecondary }]}>
          <Text style={[styles.confirmText, { color: colors.textPrimary }]}>
            Leave {membership.facility_name}? A pass you paid for stays valid until it ends.
          </Text>
          <View style={styles.confirmActions}>
            <TouchableOpacity
              onPress={() => setConfirmingLeave(false)}
              disabled={leaving}
              style={[styles.confirmBtn, { borderColor: colors.borderColor }]}
              accessibilityRole="button"
            >
              <Text style={[styles.confirmBtnText, { color: colors.textPrimary }]}>Stay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => void handleLeave()}
              disabled={leaving}
              style={[styles.confirmBtn, styles.confirmBtnDanger, leaving && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityState={{ disabled: leaving, busy: leaving }}
            >
              {leaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.confirmBtnText, { color: "#FFFFFF" }]}>Leave venue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setConfirmingLeave(true)}
          style={styles.leaveBtn}
          accessibilityRole="button"
          accessibilityLabel={`Leave ${membership.facility_name}`}
        >
          <Text style={styles.leaveText}>Leave</Text>
        </TouchableOpacity>
      )}

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  headRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontSize: 15, fontWeight: "800" },
  sentence: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "800" },
  passLine: { fontSize: 12, marginTop: 10 },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 52,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  controlTitle: { fontSize: 13, fontWeight: "700" },
  controlHint: { fontSize: 11, marginTop: 2 },
  leaveBtn: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", paddingRight: 16 },
  leaveText: { color: "#F87171", fontSize: 13, fontWeight: "800" },
  confirmBox: { borderRadius: 12, padding: 12, marginTop: 8 },
  confirmText: { fontSize: 13, lineHeight: 18 },
  confirmActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  confirmBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnDanger: { backgroundColor: "#DC2626", borderColor: "#DC2626" },
  confirmBtnText: { fontSize: 13, fontWeight: "800" },
  error: { color: "#F87171", fontSize: 12, lineHeight: 17, marginTop: 8 },
});
