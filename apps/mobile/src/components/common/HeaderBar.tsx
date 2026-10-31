import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Heart, Send, ShieldCheck, Flame } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";

interface HeaderBarProps {
  onOpenSettings?: () => void;
  onOpenActivity?: () => void;
  onOpenInbox?: () => void;
}

export function HeaderBar({ onOpenSettings, onOpenActivity, onOpenInbox }: HeaderBarProps) {
  const { profile, currentRole, isOffline, toggleOffline } = useEcosystemStore();

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <TouchableOpacity onPress={onOpenSettings} style={styles.roleChip}>
          <Text style={styles.appName}>GETPHYSICAL</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{currentRole.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.centerRow}>
        <View style={styles.streakBadge}>
          <Flame size={14} color="#F97316" />
          <Text style={styles.streakText}>{profile.streak_weeks ?? 5}-wk streak</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        <TouchableOpacity
          onPress={toggleOffline}
          style={[styles.iconButton, isOffline && styles.offlineActive]}
        >
          <ShieldCheck size={18} color={isOffline ? "#F59E0B" : "#71717A"} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenActivity} style={styles.iconButton}>
          <Heart size={20} color="#FAFAFA" />
          <View style={styles.badgeDot} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenInbox} style={styles.iconButton}>
          <Send size={20} color="#FAFAFA" />
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#09090B",
    borderBottomWidth: 1,
    borderBottomColor: "#18181B",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  appName: {
    color: "#FAFAFA",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleBadge: {
    backgroundColor: "#27272A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  roleText: {
    color: "#A1A1AA",
    fontSize: 9,
    fontWeight: "700",
  },
  centerRow: {
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(249, 115, 22, 0.12)",
    borderColor: "rgba(249, 115, 22, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  streakText: {
    color: "#F97316",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 6,
    position: "relative",
  },
  offlineActive: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderRadius: 8,
  },
  badgeDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E11D48",
  },
});
