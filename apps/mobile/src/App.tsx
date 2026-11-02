import React, { useState } from "react";
import { View, StyleSheet, StatusBar, Modal, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderBar } from "./components/common/HeaderBar";
import { BottomBar, type MobileTab } from "./components/common/BottomBar";
import { SodiaFeed } from "./components/sodia/SodiaFeed";
import { CardsHub } from "./components/cards/CardsHub";
import { DiscoverView } from "./components/discover/DiscoverView";
import { TrackHub } from "./components/track/TrackHub";
import { ProfileHub } from "./components/profile/ProfileHub";
import { StoryViewerModal } from "./components/sodia/StoryViewerModal";
import { CommentsBottomSheet } from "./components/sodia/CommentsBottomSheet";
import { InboxView, type DMThread } from "./components/sodia/InboxView";
import { DMChatView } from "./components/sodia/DMChatView";
import { ActivityView } from "./components/sodia/ActivityView";
import { CreatePostModal } from "./components/sodia/CreatePostModal";
import { MenuDrawerModal } from "./components/common/MenuDrawerModal";
import { SettingsModal } from "./components/common/SettingsModal";
import { StaffQuickdashModal } from "./components/business/StaffQuickdashModal";
import { CoachQuickdashModal } from "./components/business/CoachQuickdashModal";
import { OrganizerMeetModal } from "./components/profile/OrganizerMeetModal";
import { useEcosystemStore } from "./store/ecosystemStore";
import { calculateHybridServiceFee } from "sodia-core";
import { Shield } from "lucide-react-native";
import { OpeningLoadingScreen } from "./components/common/OpeningLoadingScreen";

export default function App() {
  const insets = useSafeAreaInsets();
  const [currentTab, setCurrentTab] = useState<MobileTab>("sodia");
  const [selectedFacilityCheckout, setSelectedFacilityCheckout] = useState<string | null>(null);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [activeChatThread, setActiveChatThread] = useState<DMThread | null>(null);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStaffDashOpen, setIsStaffDashOpen] = useState(false);
  const [isCoachDashOpen, setIsCoachDashOpen] = useState(false);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [isOpeningLoading, setIsOpeningLoading] = useState(true);

  const { provisionPass } = useEcosystemStore();
  const fee = calculateHybridServiceFee(250, "one_time_pass");

  const handleCheckoutConfirm = () => {
    provisionPass("Metro Core Arena", "one_time_pass", 250);
    setSelectedFacilityCheckout(null);
    setCurrentTab("cards");
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: Math.max(insets.top, 48) }]}>
      <StatusBar barStyle="light-content" />

      {/* OPENING LOADING SCREEN */}
      {isOpeningLoading && (
        <OpeningLoadingScreen onFinish={() => setIsOpeningLoading(false)} />
      )}

      {/* HEADER BAR */}
      <HeaderBar
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenActivity={() => setIsActivityOpen(true)}
        onOpenInbox={() => setIsInboxOpen(true)}
        onPressLogo={() => setCurrentTab("sodia")}
      />

      {/* ACTIVE TAB CONTENT */}
      <View style={styles.contentArea}>
        {currentTab === "sodia" && (
          <SodiaFeed
            onPressFacilityCTA={(id) => setSelectedFacilityCheckout(id)}
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
            onOpenStory={() => setIsStoryViewerOpen(true)}
            onOpenComments={() => setIsCommentsOpen(true)}
          />
        )}
        {currentTab === "discover" && (
          <DiscoverView onSelectFacility={(fac) => setSelectedFacilityCheckout(fac.id)} />
        )}
        {currentTab === "cards" && (
          <CardsHub onBrowseVenues={() => setCurrentTab("discover")} />
        )}
        {currentTab === "track" && <TrackHub />}
        {currentTab === "profile" && (
          <ProfileHub
            onSwitchToBusinessMode={() => setIsStaffDashOpen(true)}
            onSwitchToCoachDash={() => setIsCoachDashOpen(true)}
            onOpenMessages={() => setIsInboxOpen(true)}
          />
        )}
      </View>

      {/* BOTTOM NAVIGATION */}
      <BottomBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onPressCreate={() => setIsCreatePostOpen(true)}
      />

      {/* STORY VIEWER */}
      <StoryViewerModal
        visible={isStoryViewerOpen}
        onClose={() => setIsStoryViewerOpen(false)}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        onOpenComments={() => setIsCommentsOpen(true)}
        onTapLocationTag={(facId) => {
          setIsStoryViewerOpen(false);
          setSelectedFacilityCheckout(facId);
        }}
      />

      {/* COMMENTS BOTTOM SHEET */}
      <CommentsBottomSheet visible={isCommentsOpen} onClose={() => setIsCommentsOpen(false)} />

      {/* CREATE POST MODAL */}
      <CreatePostModal visible={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />

      {/* INBOX & DM CHAT MODAL */}
      <Modal visible={isInboxOpen} animationType="slide" onRequestClose={() => setIsInboxOpen(false)}>
        {activeChatThread ? (
          <DMChatView thread={activeChatThread} onBack={() => setActiveChatThread(null)} />
        ) : (
          <InboxView onBack={() => setIsInboxOpen(false)} onSelectThread={(t) => setActiveChatThread(t)} />
        )}
      </Modal>

      {/* NOTIFICATIONS & ACTIVITY MODAL */}
      <Modal visible={isActivityOpen} animationType="slide" onRequestClose={() => setIsActivityOpen(false)}>
        <ActivityView
          onBack={() => setIsActivityOpen(false)}
          onNavigateToLift={() => {
            setIsActivityOpen(false);
            setCurrentTab("track");
          }}
        />
      </Modal>

      {/* NAVIGATION DRAWER & ROLE SWITCHER */}
      <MenuDrawerModal
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectFeed={() => setCurrentTab("sodia")}
        onSelectDiscover={() => setCurrentTab("discover")}
        onSelectTrack={() => setCurrentTab("track")}
        onSelectCards={() => setCurrentTab("cards")}
        onSelectProfile={() => setCurrentTab("profile")}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* SETTINGS MODAL WITH CONCEALED BUSINESS ROLES */}
      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenStaffDash={() => setIsStaffDashOpen(true)}
        onOpenCoachDash={() => setIsCoachDashOpen(true)}
        onOpenOrganizer={() => setIsOrganizerOpen(true)}
      />

      {/* BUSINESS ROLE MODALS */}
      <StaffQuickdashModal visible={isStaffDashOpen} onClose={() => setIsStaffDashOpen(false)} />
      <CoachQuickdashModal visible={isCoachDashOpen} onClose={() => setIsCoachDashOpen(false)} />
      <OrganizerMeetModal visible={isOrganizerOpen} onClose={() => setIsOrganizerOpen(false)} />

      {/* UNIVERSAL CHECKOUT BOTTOM SHEET */}
      <Modal
        visible={!!selectedFacilityCheckout}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedFacilityCheckout(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.checkoutSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>UNIVERSAL CHECKOUT</Text>
              <TouchableOpacity onPress={() => setSelectedFacilityCheckout(null)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inventoryItem}>
              <Text style={styles.invTitle}>Metro Core All-Access Day Pass</Text>
              <Text style={styles.invPrice}>₱{fee.baseAmountPhp.toFixed(2)}</Text>
            </View>

            <View style={styles.feeBreakdown}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Subtotal</Text>
                <Text style={styles.feeVal}>₱{fee.baseAmountPhp.toFixed(2)}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Service Fee (Hybrid Model)</Text>
                <Text style={styles.feeVal}>₱{fee.serviceFeePhp.toFixed(2)}</Text>
              </View>
              <View style={[styles.feeRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Charge</Text>
                <Text style={styles.totalVal}>₱{fee.totalChargePhp.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleCheckoutConfirm} style={styles.payButton}>
              <Shield size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.payButtonText}>Confirm & Pay with Biometrics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#09090B" },
  contentArea: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  checkoutSheet: { backgroundColor: "#18181B", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: "#27272A" },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sheetTitle: { color: "#FAFAFA", fontSize: 13, fontWeight: "800", letterSpacing: 0.8 },
  closeBtn: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  inventoryItem: { backgroundColor: "#27272A", borderRadius: 12, padding: 14, marginBottom: 16 },
  invTitle: { color: "#FAFAFA", fontSize: 15, fontWeight: "700" },
  invPrice: { color: "#10B981", fontSize: 16, fontWeight: "800", marginTop: 4 },
  feeBreakdown: { borderTopWidth: 1, borderTopColor: "#27272A", paddingTop: 12, marginBottom: 16 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  feeLabel: { color: "#A1A1AA", fontSize: 12 },
  feeVal: { color: "#FAFAFA", fontSize: 12, fontWeight: "600" },
  totalRow: { borderTopWidth: 1, borderTopColor: "#27272A", paddingTop: 8, marginTop: 4 },
  totalLabel: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  totalVal: { color: "#FAFAFA", fontSize: 18, fontWeight: "900" },
  payButton: { backgroundColor: "#E11D48", borderRadius: 12, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  payButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});