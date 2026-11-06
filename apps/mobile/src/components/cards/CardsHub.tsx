import React, { useState } from "react";
import { Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { ChevronRight, Eye, EyeOff, Share2, Ticket } from "lucide-react-native";
import { MIN_TOUCH_TARGET, type PassRow } from "sodia-core";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useColors } from "../../theme/theme";
import { overlays } from "../../navigation/overlayStore";
import { toast } from "../../feedback/toastStore";
import { StateCard } from "../states/StateCard";
import { ReceiptModal } from "./ReceiptModal";
import { StatementOfAccountModal } from "./StatementOfAccountModal";
import { TurnstileQRModal } from "./TurnstileQRModal";
import { GiftPassModal } from "./GiftPassModal";
import { AddMembershipChoiceModal } from "./AddMembershipChoiceModal";
import { ClubQRScannerModal } from "./ClubQRScannerModal";
import { CardsHubHeader } from "./CardsHubHeader";

interface CardsHubProps {
  onBrowseVenues?: () => void;
}

type CardsModal = "soa" | "qr" | "gift" | "add" | "scan" | null;

function maskId(id: string, reveal: boolean): string {
  const digits = id.replace(/\D/g, "").padStart(16, "0").slice(-16);
  const groups = digits.match(/.{4}/g) ?? [];
  return reveal ? groups.join(" • ") : `•••• •••• •••• ${groups[3] ?? ""}`;
}

export function CardsHub({ onBrowseVenues }: CardsHubProps) {
  const passes = useEcosystemStore((s) => s.passes);
  const firstName = useEcosystemStore((s) => s.profile.first_name);
  const colors = useColors();
  const [receiptPass, setReceiptPass] = useState<PassRow | null>(null);
  const [modal, setModal] = useState<CardsModal>(null);
  const [reveal, setReveal] = useState(false);
  const activePass = passes[0] ?? null;
  const close = () => setModal(null);

  const footer = activePass ? (
    <View style={[styles.detail, { backgroundColor: colors.bgCard, borderTopColor: colors.borderColor }]}>
      <View style={styles.detailHead}>
        <Text style={[styles.detailTitle, { color: colors.textPrimary }]}>Pass details</Text>
        <TouchableOpacity
          onPress={() => Share.share({ message: `GetPhysical pass ID: ${activePass.id}` }).catch(() => undefined)}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Share pass ID"
        >
          <Share2 size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <View style={[styles.detailRow, { borderBottomColor: colors.borderColor }]}>
        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Digital pass ID</Text>
        <View style={styles.inline}>
          <Text style={[styles.mono, { color: colors.textPrimary }]}>{maskId(activePass.id, reveal)}</Text>
          <TouchableOpacity onPress={() => setReveal((r) => !r)} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={reveal ? "Hide pass ID" : "Show pass ID"}>
            {reveal ? <EyeOff size={16} color={colors.textMuted} /> : <Eye size={16} color={colors.textMuted} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ) : (
    <View style={{ backgroundColor: colors.bgCard }}>
      <StateCard compact icon={Ticket} title="No transactions yet" message="Purchases, passes and statements are recorded here automatically." />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <FlashList
        data={passes}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={
          <CardsHubHeader
            firstName={firstName ?? "Athlete"}
            activePass={activePass}
            hasTransactions={passes.length > 0}
            onAdd={() => setModal("add")}
            onGift={() => setModal("gift")}
            onPay={() => setModal("qr")}
            onViewAll={() => setModal("soa")}
            onOpenNotifications={() => overlays.open({ kind: "activity" })}
          />
        }
        ListFooterComponent={footer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: p }) => (
          <View style={[styles.rowWrap, { backgroundColor: colors.bgCard }]}>
            <TouchableOpacity onPress={() => setReceiptPass(p)} style={[styles.txRow, { backgroundColor: colors.bgCardSecondary }]} accessibilityRole="button" accessibilityLabel={`${p.pass_type}, active. View receipt`}>
              <View style={styles.flex}>
                <Text style={[styles.txName, { color: colors.textPrimary }]}>{p.pass_type}</Text>
                <Text style={[styles.txMeta, { color: colors.textMuted }]}>Metro Core Arena • Turnstile valid</Text>
              </View>
              <Text style={[styles.txStatus, { color: colors.accentGreen }]}>ACTIVE</Text>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      />

      <ReceiptModal visible={!!receiptPass} pass={receiptPass} onClose={() => setReceiptPass(null)} />
      <StatementOfAccountModal visible={modal === "soa"} passes={passes} onClose={close} onSelectPass={(p) => { close(); setReceiptPass(p); }} />
      <TurnstileQRModal visible={modal === "qr"} onClose={close} facilityName="Metro Core Arena" />
      <GiftPassModal
        visible={modal === "gift"}
        passes={passes}
        onClose={close}
        onSendPass={(_passId, recipient) => {
          close();
          toast.success("Pass gifted", `Sent to ${recipient}.`);
        }}
      />
      <AddMembershipChoiceModal visible={modal === "add"} onClose={close} onSelectBrowse={() => onBrowseVenues?.()} onSelectScan={() => setModal("scan")} />
      <ClubQRScannerModal visible={modal === "scan"} onClose={close} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 110 },
  flex: { flex: 1 },
  rowWrap: { paddingHorizontal: 20, paddingBottom: 8 },
  txRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, minHeight: 60 },
  txName: { fontSize: 14, fontWeight: "800" },
  txMeta: { fontSize: 12, marginTop: 2 },
  txStatus: { fontSize: 11, fontWeight: "800" },
  detail: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, borderTopWidth: 1 },
  detailHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailTitle: { fontSize: 15, fontWeight: "800" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1 },
  detailLabel: { fontSize: 13 },
  inline: { flexDirection: "row", alignItems: "center" },
  mono: { fontSize: 13, fontWeight: "800", letterSpacing: 0.5, fontVariant: ["tabular-nums"] },
  iconBtn: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
});
