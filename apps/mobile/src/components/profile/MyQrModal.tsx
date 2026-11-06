import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RefreshCw, Share2, X } from "lucide-react-native";
import { buildIdentityQrUrl } from "sodia-core";
import { APP_URL } from "../../lib/appLinks";
import { getMyQrToken } from "../../services/qrService";
import { QrCodeView } from "../common/QrCodeView";

type Kind = "USER" | "COACH" | "ORGANIZER";
const TABS: { kind: Kind; label: string; hint: string }[] = [
  { kind: "USER", label: "Add friend", hint: "Friends scan this to follow you." },
  { kind: "COACH", label: "Coach", hint: "Clients scan this to request coaching." },
  { kind: "ORGANIZER", label: "Organizer", hint: "Athletes scan this to follow your events." },
];

type LoadState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "signed_out" | "unavailable" | "error"; message: string };

export function MyQrModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [kind, setKind] = useState<Kind>("USER");
  const [available, setAvailable] = useState<Kind[]>(["USER"]);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async (k: Kind, rotate = false) => {
    setState({ status: "loading" });
    const result = await getMyQrToken(k, rotate);
    if (result.ok) setState({ status: "ready", url: buildIdentityQrUrl(result.data, APP_URL) });
    else if (result.reason === "signed_out") setState({ status: "signed_out", message: result.message });
    else if (result.reason === "forbidden") setState({ status: "unavailable", message: "You don't have this role." });
    else setState({ status: "error", message: result.message });
  }, []);

  useEffect(() => {
    if (!visible) return;
    void load(kind);
    // Discover which role codes this user can show (server checks the role).
    const roleKinds: Kind[] = ["COACH", "ORGANIZER"];
    void Promise.all(roleKinds.map(async (k): Promise<Kind | null> => ((await getMyQrToken(k)).ok ? k : null))).then((roles) =>
      setAvailable(["USER", ...roles.filter((r): r is Kind => r !== null)])
    );
  }, [visible, kind, load]);

  const rotate = () =>
    Alert.alert("Replace this code?", "Your current QR code will stop working immediately, including any printed copies.", [
      { text: "Cancel", style: "cancel" },
      { text: "Replace", style: "destructive", onPress: () => void load(kind, true) },
    ]);

  const tab = TABS.find((t) => t.kind === kind)!;
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My QR code</Text>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close" style={styles.close}><X size={20} color="#FFFFFF" /></TouchableOpacity>
        </View>
        <View style={styles.tabs}>
          {TABS.filter((t) => available.includes(t.kind)).map((t) => (
            <TouchableOpacity key={t.kind} onPress={() => setKind(t.kind)} style={[styles.tab, kind === t.kind && styles.tabActive]}>
              <Text style={styles.tabText}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.card}>
          {state.status === "loading" && <View style={styles.placeholder}><ActivityIndicator /></View>}
          {state.status === "ready" && <QrCodeView value={state.url} size={240} accessibilityLabel={`${tab.label} QR code`} />}
          {(state.status === "signed_out" || state.status === "unavailable" || state.status === "error") && (
            <View style={styles.placeholder}>
              <Text style={styles.message}>{state.message}</Text>
              {state.status === "error" && (
                <TouchableOpacity onPress={() => void load(kind)} style={styles.button}><Text style={styles.buttonText}>Retry</Text></TouchableOpacity>
              )}
            </View>
          )}
          <Text style={styles.hint}>{tab.hint}</Text>
        </View>
        {state.status === "ready" && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => void Share.share({ message: state.url })} style={styles.button}>
              <Share2 size={16} color="#FFFFFF" /><Text style={styles.buttonText}>Share link</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={rotate} style={[styles.button, styles.secondary]}>
              <RefreshCw size={16} color="#FFFFFF" /><Text style={styles.buttonText}>New code</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B", paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#27272A", alignItems: "center", justifyContent: "center" },
  tabs: { flexDirection: "row", gap: 8, marginTop: 20 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#18181B" },
  tabActive: { backgroundColor: "#E11D48" },
  tabText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  card: { marginTop: 24, alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20 },
  placeholder: { width: 240, height: 240, alignItems: "center", justifyContent: "center" },
  message: { color: "#3F3F46", textAlign: "center", fontSize: 14 },
  hint: { color: "#52525B", marginTop: 12, fontSize: 13, textAlign: "center" },
  actions: { flexDirection: "row", gap: 10, marginTop: 20 },
  button: { flex: 1, flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center", backgroundColor: "#E11D48", paddingVertical: 13, borderRadius: 14, marginTop: 12 },
  secondary: { backgroundColor: "#27272A" },
  buttonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
});
