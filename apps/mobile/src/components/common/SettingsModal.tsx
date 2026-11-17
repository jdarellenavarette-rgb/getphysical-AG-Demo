import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Briefcase,
  UserCheck,
  Calendar,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  LogIn,
  LogOut,
  type LucideIcon,
} from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore, type ThemePreference } from "../../theme/theme";
import { haptics } from "../../lib/haptics";
import { signOut } from "../../services/authService";

const THEME_OPTIONS: { value: ThemePreference; label: string; Icon: LucideIcon }[] = [
  { value: "system", label: "System", Icon: Smartphone },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenStaffDash?: () => void;
  onOpenCoachDash?: () => void;
  onOpenOrganizer?: () => void;
}

export function SettingsModal({
  visible,
  onClose,
  onOpenStaffDash,
  onOpenCoachDash,
  onOpenOrganizer,
}: SettingsModalProps) {
  const insets = useSafeAreaInsets();
  const { profile, isGuest, setIsGuest } = useEcosystemStore();
  const { colors, preference, setPreference } = useThemeStore();
  // Workspaces are offered only for roles this account actually holds.
  const roles: readonly string[] = profile.user_roles ?? [];
  const canStaff = roles.includes("staff");
  const canCoach = roles.includes("coach");
  const canOrganize = roles.includes("organizer");

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
        {/* TOP BAR */}
        <View
          style={[
            styles.topBar,
            {
              paddingTop: insets.top + 10,
              borderBottomColor: colors.borderColor,
              backgroundColor: colors.bgHeader,
            },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.textPrimary} />
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* THEME & APPEARANCE */}
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={[styles.cardHeader, { marginBottom: 12 }]}>APPEARANCE</Text>
            <View
              style={[styles.themeToggleRow, { backgroundColor: colors.bgInput }]}
              accessibilityRole="radiogroup"
              accessibilityLabel="Appearance"
            >
              {THEME_OPTIONS.map(({ value, label, Icon }) => {
                const selected = preference === value;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => {
                      haptics.tap();
                      setPreference(value);
                    }}
                    style={[styles.themeOptionBtn, selected && { backgroundColor: colors.accent }]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <Icon size={14} color={selected ? "#FFFFFF" : colors.textMuted} />
                    <Text style={[styles.themeOptionText, selected && styles.themeOptionTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ATHLETE PROFILE */}
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={styles.cardHeader}>PROFILE</Text>
            <View style={[styles.row, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
              <Text style={[styles.value, { color: colors.textPrimary }]}>
                {profile.name ?? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()}
              </Text>
            </View>
            <View style={[styles.row, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Handle</Text>
              <Text style={[styles.value, { color: colors.textPrimary }]}>@{profile.username}</Text>
            </View>
          </View>

          {/* ACCOUNT & AUTH */}
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={styles.cardHeader}>ACCOUNT</Text>
            <View style={[styles.row, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.value, { color: isGuest ? "#F59E0B" : "#10B981" }]}>
                {isGuest ? "Guest preview" : "Signed in"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                onClose();
                if (isGuest) {
                  setIsGuest(false);
                } else {
                  await signOut();
                  setIsGuest(false);
                }
              }}
              style={[styles.authActionBtn, { backgroundColor: isGuest ? "#E11D48" : "#27272A" }]}
            >
              {isGuest ? <LogIn size={15} color="#FFFFFF" /> : <LogOut size={15} color="#F87171" />}
              <Text style={[styles.authActionBtnText, { color: isGuest ? "#FFFFFF" : "#F87171" }]}>
                {isGuest ? "Sign In or Create Account" : "Sign Out"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* BUSINESS WORKSPACES */}
          {(canStaff || canCoach || canOrganize) && (
            <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
              <View style={styles.cardTitleRow}>
                <Briefcase size={15} color="#71717A" />
                <Text style={styles.cardHeader}>BUSINESS WORKSPACES</Text>
              </View>
              {canStaff && (
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onOpenStaffDash?.();
                  }}
                  style={[styles.roleSubRow, { borderBottomColor: colors.borderLight }]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Briefcase size={14} color="#10B981" />
                    <Text style={[styles.roleSubTitle, { color: colors.textPrimary }]}>Staff Check-in Scanner</Text>
                  </View>
                  <ChevronRight size={14} color="#71717A" />
                </TouchableOpacity>
              )}
              {canCoach && (
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onOpenCoachDash?.();
                  }}
                  style={[styles.roleSubRow, { borderBottomColor: colors.borderLight }]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <UserCheck size={14} color="#3B82F6" />
                    <Text style={[styles.roleSubTitle, { color: colors.textPrimary }]}>Coach Workspace</Text>
                  </View>
                  <ChevronRight size={14} color="#71717A" />
                </TouchableOpacity>
              )}
              {canOrganize && (
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onOpenOrganizer?.();
                  }}
                  style={[styles.roleSubRow, { borderBottomColor: colors.borderLight }]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Calendar size={14} color="#F59E0B" />
                    <Text style={[styles.roleSubTitle, { color: colors.textPrimary }]}>Organizer Workspace</Text>
                  </View>
                  <ChevronRight size={14} color="#71717A" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { flexDirection: "row", alignItems: "center", minWidth: 44, minHeight: 44 },
  backBtnText: { fontSize: 13, fontWeight: "700", marginLeft: 4 },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  scrollContent: { padding: 16, paddingBottom: 60, gap: 14 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  cardHeader: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  themeToggleRow: {
    flexDirection: "row",
    backgroundColor: "#27272A",
    borderRadius: 10,
    padding: 3,
    gap: 4,
    marginTop: 4,
  },
  themeOptionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  themeOptionText: { color: "#A1A1AA", fontSize: 12, fontWeight: "700" },
  themeOptionTextActive: { color: "#FFFFFF", fontWeight: "800" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  label: { fontSize: 13 },
  value: { fontSize: 13, fontWeight: "700" },
  authActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  authActionBtnText: { fontSize: 13, fontWeight: "800" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  switchTitle: { fontSize: 13, fontWeight: "700" },
  switchSub: { color: "#71717A", fontSize: 11, marginTop: 2 },
  roleSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  roleSubTitle: { fontSize: 13, fontWeight: "700" },
});
