import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Watch, Shield, Smartphone, Briefcase, UserCheck, Calendar, ChevronRight, Moon, Sun } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";

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
  const { profile } = useEcosystemStore();
  const { colors, themeMode, setThemeMode } = useThemeStore();
  const [appleHealthSync, setAppleHealthSync] = useState(true);
  const [garminSync, setGarminSync] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
        {/* TOP BAR */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 50) + 10, borderBottomColor: colors.borderColor, backgroundColor: colors.bgHeader }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.textPrimary} />
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>SETTINGS & PREFERENCES</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* THEME & APPEARANCE */}
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <View style={styles.cardTitleRow}>
              {themeMode === "dark" ? <Moon size={15} color="#6366F1" /> : <Sun size={15} color="#F59E0B" />}
              <Text style={styles.cardHeader}>APPEARANCE & THEME</Text>
            </View>
            <View style={styles.themeToggleRow}>
              <TouchableOpacity
                onPress={() => setThemeMode("dark")}
                style={[styles.themeOptionBtn, themeMode === "dark" && styles.themeOptionBtnActive]}
              >
                <Moon size={14} color={themeMode === "dark" ? "#FFFFFF" : colors.textMuted} />
                <Text style={[styles.themeOptionText, themeMode === "dark" && styles.themeOptionTextActive]}>Dark Mode</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setThemeMode("light")}
                style={[styles.themeOptionBtn, themeMode === "light" && styles.themeOptionBtnActive]}
              >
                <Sun size={14} color={themeMode === "light" ? "#FFFFFF" : colors.textMuted} />
                <Text style={[styles.themeOptionText, themeMode === "light" && styles.themeOptionTextActive]}>Light Mode</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ATHLETE PROFILE */}
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={styles.cardHeader}>ATHLETE PROFILE</Text>
            <View style={[styles.row, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
              <Text style={[styles.value, { color: colors.textPrimary }]}>{profile.name ?? "Adam Arête"}</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Handle</Text>
              <Text style={[styles.value, { color: colors.textPrimary }]}>@{profile.username}</Text>
            </View>
          </View>

          {/* WEARABLE SENSORS */}
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <View style={styles.cardTitleRow}>
              <Watch size={15} color="#EC4899" />
              <Text style={styles.cardHeader}>WEARABLE SENSORS</Text>
            </View>
            <View style={[styles.switchRow, { borderBottomColor: colors.borderLight }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Apple Health / Health Connect</Text>
                <Text style={styles.switchSub}>Sync resting HR, active kcal & GPS runs</Text>
              </View>
              <Switch value={appleHealthSync} onValueChange={setAppleHealthSync} thumbColor={appleHealthSync ? "#EC4899" : "#71717A"} trackColor={{ false: "#27272A", true: "rgba(236,72,153,0.4)" }} />
            </View>
            <View style={[styles.switchRow, { borderBottomColor: colors.borderLight }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Garmin Connect / Whoop 4.0</Text>
                <Text style={styles.switchSub}>BLE strain & recovery telemetry</Text>
              </View>
              <Switch value={garminSync} onValueChange={setGarminSync} thumbColor={garminSync ? "#EC4899" : "#71717A"} trackColor={{ false: "#27272A", true: "rgba(236,72,153,0.4)" }} />
            </View>
          </View>

          {/* SECURITY & ACCESS */}
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <View style={styles.cardTitleRow}>
              <Shield size={15} color="#10B981" />
              <Text style={styles.cardHeader}>SECURITY & ACCESS</Text>
            </View>
            <View style={[styles.switchRow, { borderBottomColor: colors.borderLight }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Biometric Pass Authorization</Text>
                <Text style={styles.switchSub}>Require FaceID to display turnstile TOTP</Text>
              </View>
              <Switch value={biometricsEnabled} onValueChange={setBiometricsEnabled} thumbColor={biometricsEnabled ? "#10B981" : "#71717A"} trackColor={{ false: "#27272A", true: "rgba(16,185,129,0.4)" }} />
            </View>
          </View>

          {/* CONCEALED BUSINESS WORKSPACES */}
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <View style={styles.cardTitleRow}>
              <Briefcase size={15} color="#71717A" />
              <Text style={styles.cardHeader}>BUSINESS WORKSPACES (OPERATOR ACCESS)</Text>
            </View>
            <TouchableOpacity onPress={() => { onClose(); onOpenStaffDash?.(); }} style={[styles.roleSubRow, { borderBottomColor: colors.borderLight }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Briefcase size={14} color="#10B981" />
                <Text style={[styles.roleSubTitle, { color: colors.textPrimary }]}>Staff Turnstile Scanner</Text>
              </View>
              <ChevronRight size={14} color="#71717A" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onClose(); onOpenCoachDash?.(); }} style={[styles.roleSubRow, { borderBottomColor: colors.borderLight }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <UserCheck size={14} color="#3B82F6" />
                <Text style={[styles.roleSubTitle, { color: colors.textPrimary }]}>Coach Floor Roster & Split</Text>
              </View>
              <ChevronRight size={14} color="#71717A" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onClose(); onOpenOrganizer?.(); }} style={[styles.roleSubRow, { borderBottomColor: colors.borderLight }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Calendar size={14} color="#F59E0B" />
                <Text style={[styles.roleSubTitle, { color: colors.textPrimary }]}>Tournament Organizer Portal</Text>
              </View>
              <ChevronRight size={14} color="#71717A" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { flexDirection: "row", alignItems: "center", minWidth: 44, minHeight: 44 },
  backBtnText: { fontSize: 13, fontWeight: "700", marginLeft: 4 },
  headerTitle: { fontSize: 13, fontWeight: "800", letterSpacing: 0.8 },
  scrollContent: { padding: 16, paddingBottom: 60, gap: 14 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  cardHeader: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  themeToggleRow: { flexDirection: "row", backgroundColor: "#27272A", borderRadius: 10, padding: 3, gap: 4, marginTop: 4 },
  themeOptionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 8 },
  themeOptionBtnActive: { backgroundColor: "#E11D48" },
  themeOptionText: { color: "#A1A1AA", fontSize: 12, fontWeight: "700" },
  themeOptionTextActive: { color: "#FFFFFF", fontWeight: "800" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1 },
  label: { fontSize: 13 },
  value: { fontSize: 13, fontWeight: "700" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1 },
  switchTitle: { fontSize: 13, fontWeight: "700" },
  switchSub: { color: "#71717A", fontSize: 11, marginTop: 2 },
  roleSubRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  roleSubTitle: { fontSize: 13, fontWeight: "700" },
});
