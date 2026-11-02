import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Switch } from "react-native";
import { ArrowLeft, Watch, Shield, Bell, Smartphone, CheckCircle2, Sliders } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { profile } = useEcosystemStore();
  const [appleHealthSync, setAppleHealthSync] = useState(true);
  const [garminSync, setGarminSync] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* TOP BAR WITH EXPLICIT BACK BUTTON */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <ArrowLeft size={18} color="#FAFAFA" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SETTINGS & HARDWARE</Text>
          <View style={{ width: 40 }} />
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

          {/* FOOTER BACK BUTTON */}
          <TouchableOpacity onPress={onClose} style={styles.fullBackBtn}>
            <CheckCircle2 size={16} color="#FAFAFA" style={{ marginRight: 6 }} />
            <Text style={styles.fullBackBtnText}>Save & Return to App</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  backBtnText: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  headerTitle: { color: "#FAFAFA", fontSize: 13, fontWeight: "900", letterSpacing: 0.8 },
  scrollContent: { padding: 16 },
  card: { backgroundColor: "#121215", borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#18181B" },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  cardHeader: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#1A1A1E" },
  label: { color: "#A1A1AA", fontSize: 12 },
  value: { color: "#FAFAFA", fontSize: 12, fontWeight: "700" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#1A1A1E" },
  switchTitle: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  switchSub: { color: "#71717A", fontSize: 11, marginTop: 2 },
  fullBackBtn: { backgroundColor: "#E11D48", borderRadius: 12, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 8, marginBottom: 30 },
  fullBackBtnText: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
});