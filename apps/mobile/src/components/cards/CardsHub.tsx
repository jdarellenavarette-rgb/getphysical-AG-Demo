import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Plus, Wallet, QrCode, CloudOff, Clock } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useMemberStore } from "../../store/memberStore";
import { ExactVIPCard } from "./ExactVIPCard";
import { ReceiptModal } from "./ReceiptModal";
import { StatementOfAccountModal } from "./StatementOfAccountModal";
import { TurnstileQRModal } from "./TurnstileQRModal";
import { AddMembershipChoiceModal } from "./AddMembershipChoiceModal";
import { QrScannerModal } from "./QrScannerModal";
import { WalletPassList } from "./WalletPassList";
import { useThemeStore } from "../../theme/theme";
import { EmptyState } from "../common/EmptyState";
import { haptics } from "../../lib/haptics";
import type { PassRow } from "sodia-core";
import { isPassUsable, passVenueName } from "../../lib/passDisplay";

interface CardsHubProps {
  onBrowseVenues?: () => void;
}

export function CardsHub({ onBrowseVenues }: CardsHubProps) {
  const { passes, facilities, purchases, venueNames, isGuest, setIsGuest } = useEcosystemStore();
  const { walletSync, walletError, awaitingPass, refreshWallet } = useMemberStore();
  const { colors } = useThemeStore();
  const [selectedPassForReceipt, setSelectedPassForReceipt] = useState<PassRow | null>(null);
  const [chosenPassId, setChosenPassId] = useState<string | null>(null);
  const [isSoaOpen, setIsSoaOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAddMembershipChoiceOpen, setIsAddMembershipChoiceOpen] = useState(false);
  const [isClubScannerOpen, setIsClubScannerOpen] = useState(false);

  // The card on top is the pass the member picked, else the first that can still open a gate.
  const activePass =
    passes.find((p) => p.id === chosenPassId) ?? passes.find((p) => isPassUsable(p)) ?? passes[0] ?? null;
  const activeVenue = activePass ? passVenueName(activePass, facilities, purchases[activePass.id], venueNames) : "";
  // A signed-in member's wallet comes from the backend; a guest's stays local.
  const isLoadingFirst = !isGuest && passes.length === 0 && (walletSync === "loading" || walletSync === "idle");
  const failedFirst = !isGuest && passes.length === 0 && walletSync === "error";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgScreen }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        isGuest ? undefined : (
          <RefreshControl
            refreshing={walletSync === "loading" && passes.length > 0}
            onRefresh={() => void refreshWallet()}
            tintColor={colors.accent}
          />
        )
      }
    >
      <View style={styles.userGreetingRow}>
        <Text style={[styles.userName, { color: colors.textPrimary }]}>Wallet</Text>
        <Text style={[styles.userHandle, { color: colors.textMuted }]}>Your passes and memberships</Text>
      </View>

      {awaitingPass ? (
        <View style={[styles.notice, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
          <Clock size={14} color={colors.accent} />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            Finish paying on the payment page. Your pass appears here once the payment is confirmed.
          </Text>
        </View>
      ) : null}
      {walletSync === "error" && passes.length > 0 ? (
        <View style={[styles.notice, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
          <CloudOff size={14} color="#F59E0B" />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            Couldn't refresh. These are your passes as last loaded. Pull down to retry.
          </Text>
        </View>
      ) : null}

      {isLoadingFirst ? (
        // Same outline as a loaded wallet, so nothing jumps when the passes arrive.
        <View accessibilityLabel="Loading your passes" style={styles.cardWrapper}>
          <View style={[styles.skeletonCard, { backgroundColor: colors.bgCardSecondary }]} />
          <View style={[styles.skeletonRow, { backgroundColor: colors.bgCardSecondary }]} />
          <View style={[styles.skeletonRow, { backgroundColor: colors.bgCardSecondary }]} />
        </View>
      ) : failedFirst ? (
        <EmptyState
          icon={CloudOff}
          title="Couldn't load your passes"
          body={walletError ?? "Something went wrong. Please retry."}
          actionLabel="Retry"
          onAction={() => void refreshWallet()}
        />
      ) : !activePass ? (
        // Nothing to show yet: one clear way forward, plus the scanner for people handed a QR code.
        <>
          <EmptyState
            icon={Wallet}
            title="No passes yet"
            body="Buy a day pass or membership at a venue and your entry QR code will live here."
            actionLabel="Find a venue"
            onAction={onBrowseVenues}
          />
          <TouchableOpacity
            onPress={() => setIsClubScannerOpen(true)}
            style={styles.scanLink}
            accessibilityRole="button"
          >
            <QrCode size={16} color={colors.accent} />
            <Text style={[styles.scanLinkText, { color: colors.accent }]}>Scan a QR code to join</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.cardWrapper}>
            <ExactVIPCard pass={activePass} facilityName={activeVenue} />
          </View>

          <View style={styles.actionPillsRow}>
            <TouchableOpacity
              onPress={() => setIsAddMembershipChoiceOpen(true)}
              style={[styles.actionPill, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
              accessibilityRole="button"
            >
              <Plus size={16} color={colors.accent} />
              <Text style={[styles.actionPillText, { color: colors.textPrimary }]}>Add Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                setIsQrOpen(true);
              }}
              style={[styles.actionPill, styles.actionPillPrimary]}
              accessibilityRole="button"
            >
              <QrCode size={16} color="#FFFFFF" />
              <Text style={[styles.actionPillText, { color: "#FFFFFF" }]}>Show Entry QR</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.historySheet, { backgroundColor: colors.bgCard }]}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>Your Passes</Text>
              <TouchableOpacity onPress={() => setIsSoaOpen(true)} accessibilityRole="button">
                <Text style={styles.viewAllText}>Statement</Text>
              </TouchableOpacity>
            </View>
            <WalletPassList
              passes={passes}
              activePassId={activePass.id}
              onOpenReceipt={setSelectedPassForReceipt}
              onShowQr={(pass) => {
                haptics.tap();
                setChosenPassId(pass.id);
                setIsQrOpen(true);
              }}
            />
          </View>
        </>
      )}

      <ReceiptModal
        visible={!!selectedPassForReceipt}
        pass={selectedPassForReceipt}
        onClose={() => setSelectedPassForReceipt(null)}
      />
      <StatementOfAccountModal
        visible={isSoaOpen}
        passes={passes}
        onClose={() => setIsSoaOpen(false)}
        onSelectPass={(p) => {
          setIsSoaOpen(false);
          setSelectedPassForReceipt(p);
        }}
      />
      <TurnstileQRModal
        visible={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        facilityName={activeVenue}
        passId={activePass && isPassUsable(activePass) ? activePass.id : null}
        onSignIn={() => {
          setIsQrOpen(false);
          setIsGuest(false);
        }}
      />
      <AddMembershipChoiceModal
        visible={isAddMembershipChoiceOpen}
        onClose={() => setIsAddMembershipChoiceOpen(false)}
        onSelectBrowse={() => onBrowseVenues?.()}
        onSelectScan={() => setIsClubScannerOpen(true)}
      />
      <QrScannerModal visible={isClubScannerOpen} onClose={() => setIsClubScannerOpen(false)} title="Scan to join" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scanLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44 },
  scanLinkText: { fontSize: 14, fontWeight: "700" },
  container: { flex: 1 },
  contentContainer: { paddingBottom: 110 },
  userGreetingRow: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 },
  userName: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  userHandle: { fontSize: 12, marginTop: 2, fontWeight: "600" },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 17 },
  cardWrapper: { paddingHorizontal: 16, marginBottom: 12 },
  skeletonCard: { height: 224, borderRadius: 24, marginVertical: 10, opacity: 0.6 },
  skeletonRow: { height: 56, borderRadius: 12, marginTop: 8, opacity: 0.6 },
  actionPillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 18,
    gap: 10,
  },
  actionPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    paddingVertical: 11,
    borderRadius: 12,
  },
  actionPillPrimary: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  actionPillText: { fontSize: 12, fontWeight: "800" },
  historySheet: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 40,
    minHeight: 320,
  },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  historyTitle: { fontSize: 17, fontWeight: "900" },
  viewAllText: { color: "#E11D48", fontSize: 12, fontWeight: "700" },
});
