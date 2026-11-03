import React, { useState } from "react";
import { View, StyleSheet, StatusBar, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderBar } from "./components/common/HeaderBar";
import { BottomBar, type MobileTab } from "./components/common/BottomBar";
import { SodiaFeed } from "./components/sodia/SodiaFeed";
import { CardsHub } from "./components/cards/CardsHub";
import { DiscoverView, type CheckoutRequest } from "./components/discover/DiscoverView";
import { FacilityDetailSheet } from "./components/discover/FacilityDetailSheet";
import { UniversalCheckoutModal } from "./components/common/UniversalCheckoutModal";
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
import { useThemeStore } from "./theme/theme";
import type { FacilityRow } from "sodia-core";
import { OpeningLoadingScreen } from "./components/common/OpeningLoadingScreen";

export default function App() {
  const insets = useSafeAreaInsets();
  const [currentTab, setCurrentTab] = useState<MobileTab>("sodia");
  const [activeCheckoutItem, setActiveCheckoutItem] = useState<CheckoutRequest | null>(null);
  const [selectedFacilityForModal, setSelectedFacilityForModal] = useState<FacilityRow | null>(null);
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

  const { provisionPass, facilities } = useEcosystemStore();
  const { colors } = useThemeStore();

  const handleCheckoutConfirm = (item: CheckoutRequest) => {
    provisionPass(item.facilityName, item.billingKind, item.baseAmountPhp, item.title, item.facilityId);
    setActiveCheckoutItem(null);
    setCurrentTab("cards");
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: Math.max(insets.top, 48), backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBarStyle} />

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
            onPressFacilityCTA={(id) => {
              const fac = facilities.find((f) => f.id === id);
              if (fac) setSelectedFacilityForModal(fac);
            }}
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
            onOpenStory={() => setIsStoryViewerOpen(true)}
            onOpenComments={() => setIsCommentsOpen(true)}
          />
        )}
        {currentTab === "discover" && (
          <DiscoverView onCheckoutItem={(item) => setActiveCheckoutItem(item)} />
        )}
        {currentTab === "cards" && (
          <CardsHub onBrowseVenues={() => setCurrentTab("discover")} />
        )}
        {currentTab === "track" && <TrackHub />}
        {currentTab === "profile" && (
          <ProfileHub
            onBack={() => setCurrentTab("sodia")}
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
          const fac = facilities.find((f) => f.id === facId);
          if (fac) setSelectedFacilityForModal(fac);
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

      {/* FACILITY DETAIL SHEET */}
      <FacilityDetailSheet
        facility={selectedFacilityForModal}
        visible={!!selectedFacilityForModal}
        onClose={() => setSelectedFacilityForModal(null)}
        onSelectPass={(passOpt, fac) => {
          setSelectedFacilityForModal(null);
          setActiveCheckoutItem({
            id: passOpt.id,
            title: `${passOpt.title} • ${fac.name}`,
            subtitle: passOpt.subtitle,
            facilityId: fac.id,
            facilityName: fac.name,
            baseAmountPhp: passOpt.pricePhp,
            billingKind: passOpt.billingKind,
            splitNote: passOpt.splitNote,
          });
        }}
      />

      {/* UNIVERSAL CHECKOUT MODAL */}
      <UniversalCheckoutModal
        item={activeCheckoutItem}
        visible={!!activeCheckoutItem}
        onClose={() => setActiveCheckoutItem(null)}
        onConfirm={handleCheckoutConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1 },
  contentArea: { flex: 1 },
});
