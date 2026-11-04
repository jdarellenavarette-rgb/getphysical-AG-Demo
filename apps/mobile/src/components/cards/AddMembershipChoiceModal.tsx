import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Compass, QrCode, X, ChevronRight, ShieldCheck } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

interface AddMembershipChoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBrowse: () => void;
  onSelectScan: () => void;
}

export function AddMembershipChoiceModal({
  visible,
  onClose,
  onSelectBrowse,
  onSelectScan,
}: AddMembershipChoiceModalProps) {
  const { colors } = useThemeStore();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Add Membership</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Choose how you want to join a club</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.bgCardSecondary }]}>
              <X size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsList}>
            <TouchableOpacity
              onPress={() => {
                onClose();
                onSelectBrowse();
              }}
              style={[styles.optionItem, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
            >
              <View style={[styles.iconWrap, { backgroundColor: "rgba(225,29,72,0.12)" }]}>
                <Compass size={22} color="#E11D48" />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Browse in Venues</Text>
                <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                  Explore gyms, pilates studios, sports clubs & coaches nearby on the live map.
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                onSelectScan();
              }}
              style={[styles.optionItem, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
            >
              <View style={[styles.iconWrap, { backgroundColor: "rgba(16,185,129,0.12)" }]}>
                <QrCode size={22} color="#10B981" />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Scan QR Code</Text>
                <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                  Scan a club reception QR or member invite code to join & activate your digital pass instantly.
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.securityRow}>
            <ShieldCheck size={14} color="#10B981" />
            <Text style={styles.securityText}>Dynamic TOTP 60s Encryption • Sodia Turnstile Gate</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsList: {
    gap: 12,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  optionTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
  },
  securityText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "700",
  },
});
