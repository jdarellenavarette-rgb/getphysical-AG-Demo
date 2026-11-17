import React, { useState, useEffect } from "react";
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
import { InstagramStoryCameraModal } from "./components/sodia/InstagramStoryCameraModal";
import { MenuDrawerModal } from "./components/common/MenuDrawerModal";
import { SettingsModal } from "./components/common/SettingsModal";
import { StaffQuickdashModal } from "./components/business/StaffQuickdashModal";
import { CoachQuickdashModal } from "./components/business/CoachQuickdashModal";
import { OrganizerMeetModal } from "./components/profile/OrganizerMeetModal";
import { AthleteProfileModal, type AthleteProfileData } from "./components/profile/AthleteProfileModal";
import { athleteProfileFromPost } from "./lib/athleteProfile";
import { useEcosystemStore } from "./store/ecosystemStore";
import { useCrmMessagingStore } from "./store/crmMessagingStore";
import { CrmToastBanner } from "./components/common/CrmToastBanner";
import { useThemeStore } from "./theme/theme";
import type { FacilityRow } from "sodia-core";
import { useCheckout } from "./hooks/useCheckout";
import { useRequireAccount } from "./hooks/useRequireAccount";

export default function App() {
  const insets = useSafeAreaInsets();
  const [currentTab, setCurrentTab] = useState<MobileTab>("sodia");
  const [activeCheckoutItem, setActiveCheckoutItem] = useState<CheckoutRequest | null>(null);
  const [selectedFacilityForModal, setSelectedFacilityForModal] = useState<FacilityRow | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteProfileData | null>(null);
  const [storyOpenId, setStoryOpenId] = useState<string | null>(null);
  const [isStoryCameraOpen, setIsStoryCameraOpen] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [activeChatThread, setActiveChatThread] = useState<DMThread | null>(null);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStaffDashOpen, setIsStaffDashOpen] = useState(false);
  const [isCoachDashOpen, setIsCoachDashOpen] = useState(false);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);

  const { facilities } = useEcosystemStore();
  const { colors } = useThemeStore();
  const requireAccount = useRequireAccount();
  const { initRealtimeSubscription, threads, ensureThread } = useCrmMessagingStore();

  // Subscribes to the user's inbox; the returned teardown removes the Realtime channel.
  useEffect(() => initRealtimeSubscription(), [initRealtimeSubscription]);

  const { confirm: confirmCheckout } = useCheckout(() => {
    requireAccount("buy a pass");
  });
  const openComposer = () => {
    if (requireAccount("share a post")) setIsCreatePostOpen(true);
  };
  const openStoryCamera = () => {
    if (requireAccount("share a story")) setIsStoryCameraOpen(true);
  };
  const openInbox = () => {
    if (requireAccount("send and read messages")) setIsInboxOpen(true);
  };

  const handleCheckoutConfirm = async (item: CheckoutRequest) => {
    if (await confirmCheckout(item)) {
      setActiveCheckoutItem(null);
      setCurrentTab("cards");
    }
  };

  return (
    <View style={[styles.screenContainer, { backgroundColor: colors.bgScreen }]}>
      {/* The status-bar area takes the header colour, so the header reads as one surface. */}
      <View style={{ height: insets.top, backgroundColor: colors.bgHeader }} />
      <StatusBar barStyle={colors.statusBarStyle} />

      <CrmToastBanner
        onPressToast={(threadId) => {
          const thread = threads.find((t) => t.id === threadId) || threads[0];
          if (thread) setActiveChatThread(thread);
          setIsInboxOpen(true);
        }}
      />

      <HeaderBar
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenActivity={() => setIsActivityOpen(true)}
        onOpenInbox={openInbox}
        onPressLogo={() => setCurrentTab("sodia")}
      />

      <View style={styles.contentArea}>
        {currentTab === "sodia" && (
          <SodiaFeed
            onPressFacilityCTA={(id) => {
              const fac = facilities.find((f) => f.id === id);
              if (fac) setSelectedFacilityForModal(fac);
            }}
            onOpenCreatePost={openComposer}
            onOpenStoryCamera={openStoryCamera}
            onOpenStory={setStoryOpenId}
            onOpenComments={setCommentsPostId}
            onPressAuthor={(userId, name, avatar) => setSelectedAthlete(athleteProfileFromPost(userId, name, avatar))}
          />
        )}
        {currentTab === "discover" && <DiscoverView onCheckoutItem={(item) => setActiveCheckoutItem(item)} />}
        {currentTab === "cards" && <CardsHub onBrowseVenues={() => setCurrentTab("discover")} />}
        {currentTab === "track" && <TrackHub />}
        {currentTab === "profile" && <ProfileHub onBack={() => setCurrentTab("sodia")} onOpenMessages={openInbox} />}
      </View>

      <BottomBar currentTab={currentTab} onSelectTab={setCurrentTab} onPressCreate={openComposer} />

      <StoryViewerModal
        visible={storyOpenId !== null}
        initialStoryId={storyOpenId}
        onClose={() => setStoryOpenId(null)}
        onTapLocationTag={(facId) => {
          setStoryOpenId(null);
          const fac = facilities.find((f) => f.id === facId);
          if (fac) setSelectedFacilityForModal(fac);
        }}
      />

      <CommentsBottomSheet
        visible={commentsPostId !== null}
        postId={commentsPostId}
        onClose={() => setCommentsPostId(null)}
      />
      <CreatePostModal
        visible={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onOpenStoryCamera={openStoryCamera}
      />
      <InstagramStoryCameraModal visible={isStoryCameraOpen} onClose={() => setIsStoryCameraOpen(false)} />

      <Modal
        visible={isInboxOpen}
        animationType="slide"
        onRequestClose={() => {
          // Back inside a chat returns to the list; back on the list closes the inbox.
          if (activeChatThread) setActiveChatThread(null);
          else setIsInboxOpen(false);
        }}
      >
        {activeChatThread ? (
          <DMChatView thread={activeChatThread} onBack={() => setActiveChatThread(null)} />
        ) : (
          <InboxView onBack={() => setIsInboxOpen(false)} onSelectThread={(t) => setActiveChatThread(t)} />
        )}
      </Modal>

      <Modal visible={isActivityOpen} animationType="slide" onRequestClose={() => setIsActivityOpen(false)}>
        <ActivityView onBack={() => setIsActivityOpen(false)} />
      </Modal>

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

      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenStaffDash={() => setIsStaffDashOpen(true)}
        onOpenCoachDash={() => setIsCoachDashOpen(true)}
        onOpenOrganizer={() => setIsOrganizerOpen(true)}
      />

      <StaffQuickdashModal visible={isStaffDashOpen} onClose={() => setIsStaffDashOpen(false)} />
      <CoachQuickdashModal visible={isCoachDashOpen} onClose={() => setIsCoachDashOpen(false)} />
      <OrganizerMeetModal visible={isOrganizerOpen} onClose={() => setIsOrganizerOpen(false)} />

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

      <AthleteProfileModal
        visible={!!selectedAthlete}
        athlete={selectedAthlete}
        onClose={() => setSelectedAthlete(null)}
        onMessageAthlete={(ath) => {
          if (!requireAccount("send a message")) return;
          setActiveChatThread(
            ensureThread({
              id: `thread_${ath.userId}`,
              name: ath.name,
              avatar: ath.avatar,
              lastMessage: "",
              timeAgo: "",
              unreadCount: 0,
              type: "direct",
            }),
          );
          setIsInboxOpen(true);
        }}
      />

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
