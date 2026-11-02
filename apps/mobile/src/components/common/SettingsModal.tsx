import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Watch, Shield, Smartphone, Briefcase, UserCheck, Calendar, ChevronRight } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";

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
  const [appleHealthSync, setAppleHealthSync] = useState(true);
  const [garminSync, setGarminSync] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* TOP BAR WITH SAFE NOTCH PADDING */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 50) + 10 }]}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color="#FAFAFA" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SETTINGS & PREFERENCES</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* USER ACCOUNT CARD */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>ATHLETE PROFILE</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Display Name</Text>
              <Text style={styles.value}>{profile.name ?? "Adam Arête"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Handle</Text>
              <Text style={styles.value}>@{profile.username}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Home Location</Text>
              <Text style={styles.value}>{profile.home_location ?? "Metro Manila"}</Text>
            </View>
          </View>

          {/* HARDWARE & WEARABLE PAIRING */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Watch size={16} color="#EC4899" />
              <Text style={styles.cardHeader}>WEARABLE SENSORS</Text>
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Apple Health / Health Connect</Text>
                <Text style={styles.switchSub}>Sync resting HR, active kcal & GPS runs</Text>
              </View>
              <Switch
                value={appleHealthSync}
                onValueChange={setAppleHealthSync}
                thumbColor={appleHealthSync ? "#EC4899" : "#71717A"}
                trackColor={{ false: "#27272A", true: "rgba(236, 72, 153, 0.4)" }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Garmin Connect / Whoop 4.0</Text>
                <Text style={styles.switchSub}>BLE strain & recovery telemetry</Text>
              </View>
              <Switch
                value={garminSync}
                onValueChange={setGarminSync}
                thumbColor={garminSync ? "#EC4899" : "#71717A"}
                trackColor={{ false: "#27272A", true: "rgba(236, 72, 153, 0.4)" }}
              />
            </View>
          </View>

          {/* SECURITY & TURNSTILE BIOMETRICS */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Shield size={16} color="#10B981" />
              <Text style={styles.cardHeader}>SECURITY & ACCESS</Text>
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Biometric Pass Authorization</Text>
                <Text style={styles.switchSub}>Require FaceID to display dynamic turnstile TOTP</Text>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={setBiometricsEnabled}
                thumbColor={biometricsEnabled ? "#10B981" : "#71717A"}
                trackColor={{ false: "#27272A", true: "rgba(16, 185, 129, 0.4)" }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Drop-in & Waitlist Push Alerts</Text>
                <Text style={styles.switchSub}>Notify within 15s when waitlist slot opens</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                thumbColor={pushNotifications ? "#10B981" : "#71717A"}
                trackColor={{ false: "#27272A", true: "rgba(16, 185, 129, 0.4)" }}
              />
            </View>
          </View>

          {/* CONCEALED BUSINESS & OPERATOR WORKSPACES */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Briefcase size={16} color="#71717A" />
              <Text style={styles.cardHeader}>BUSINESS WORKSPACES (OPERATOR ACCESS)</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                onClose();
                onOpenStaffDash?.();
              }}
              style={styles.roleSubRow}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Briefcase size={15} color="#10B981" />
                <Text style={styles.roleSubTitle}>Staff Turnstile Scanner</Text>
              </View>
              <ChevronRight size={14} color="#71717A" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                onOpenCoachDash?.();
              }}
              style={styles.roleSubRow}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <UserCheck size={15} color="#3B82F6" />
                <Text style={styles.roleSubTitle}>Coach Floor Roster & Split</Text>
              </View>
              <ChevronRight size={14} color="#71717A" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                onOpenOrganizer?.();
              }}
              style={styles.roleSubRow}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Calendar size={15} color="#F59E0B" />
                <Text style={styles.roleSubTitle}>Tournament Organizer Portal</Text>
              </View>
              <ChevronRight size={14} color="#71717A" />
            </TouchableOpacity>
          </View>

          {/* BUILD & RUNTIME INFO */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Smartphone size={16} color="#3B82F6" />
              <Text style={styles.cardHeader}>ARCHITECTURE & RUNTIME</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Runtime Engine</Text>
              <Text style={styles.value}>Expo SDK 58.0.22</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>React / React Native</Text>
              <Text style={styles.value}>React 19.3 / RN 0.88.1</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Sodia Core Protocol</Text>
              <Text style={styles.value}>v2.4.0 (10-State Envelope)</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  backBtn: { flexDirection: "row", alignItems: "center", minWidth: 44, minHeight: 44 },
  backBtnText: { color: "#FAFAFA", fontSize: 13, fontWeight: "700", marginLeft: 4 },
  headerTitle: { color: "#FAFAFA", fontSize: 13, fontWeight: "800", letterSpacing: 0.8 },
  scrollContent: { padding: 16, paddingBottom: 60, gap: 14 },
  card: { backgroundColor: "#141418", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#27272A" },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  cardHeader: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#1E1E24" },
  label: { color: "#A1A1AA", fontSize: 13 },
  value: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1E1E24" },
  switchTitle: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  switchSub: { color: "#71717A", fontSize: 11, marginTop: 2 },
  roleSubRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1E1E24" },
  roleSubTitle: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
});
