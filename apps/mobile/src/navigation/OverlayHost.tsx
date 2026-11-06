import React, { useCallback } from "react";
import { AppModal } from "../components/common/AppModal";
import { StoryViewerModal } from "../components/sodia/StoryViewerModal";
import { CommentsBottomSheet } from "../components/sodia/CommentsBottomSheet";
import { ChallengeSheet } from "../components/sodia/ChallengeSheet";
import { InboxView } from "../components/sodia/InboxView";
import { DMChatView } from "../components/sodia/DMChatView";
import { ActivityView } from "../components/sodia/ActivityView";
import { CreatePostModal } from "../components/sodia/CreatePostModal";
import { InstagramStoryCameraModal } from "../components/sodia/InstagramStoryCameraModal";
import { MenuDrawerModal } from "../components/common/MenuDrawerModal";
import { SettingsModal } from "../components/common/SettingsModal";
import { StaffQuickdashModal } from "../components/business/StaffQuickdashModal";
import { CoachQuickdashModal } from "../components/business/CoachQuickdashModal";
import { OrganizerMeetModal } from "../components/profile/OrganizerMeetModal";
import { AthleteProfileModal } from "../components/profile/AthleteProfileModal";
import { FacilityDetailSheet } from "../components/discover/FacilityDetailSheet";
import { UniversalCheckoutModal } from "../components/common/UniversalCheckoutModal";
import type { CheckoutRequest } from "../components/discover/DiscoverView";
import { useEcosystemStore } from "../store/ecosystemStore";
import { overlays, useOverlay, type OverlayKind } from "./overlayStore";
import { goToTab } from "./tabs";
import { toast } from "../feedback/toastStore";

function useCloser(kind: OverlayKind): () => void {
  return useCallback(() => overlays.close(kind), [kind]);
}

/** Feed / story / messaging overlays. */
function SocialOverlays() {
  const facilities = useEcosystemStore((s) => s.facilities);
  const storyViewer = useOverlay("storyViewer");
  const storyCamera = useOverlay("storyCamera");
  const comments = useOverlay("comments");
  const challenge = useOverlay("challenge");
  const inbox = useOverlay("inbox");
  const activity = useOverlay("activity");
  const createPost = useOverlay("createPost");
  const closeStory = useCloser("storyViewer");
  const closeComments = useCloser("comments");
  const closeInbox = useCloser("inbox");
  const closeActivity = useCloser("activity");
  const closeCreate = useCloser("createPost");
  const closeCamera = useCloser("storyCamera");

  return (
    <>
      <StoryViewerModal
        visible={!!storyViewer}
        onClose={closeStory}
        onOpenCreatePost={() => overlays.open({ kind: "createPost" })}
        onOpenComments={() => overlays.open({ kind: "comments", postId: null })}
        onTapLocationTag={(facId) => {
          overlays.close("storyViewer");
          const facility = facilities.find((f) => f.id === facId);
          if (facility) overlays.open({ kind: "facility", facility });
        }}
      />
      <CreatePostModal visible={!!createPost} onClose={closeCreate} onOpenStoryCamera={() => overlays.open({ kind: "storyCamera" })} />
      <InstagramStoryCameraModal visible={!!storyCamera} onClose={closeCamera} />

      <AppModal visible={!!inbox} animationType="slide" onRequestClose={inbox?.thread ? () => overlays.open({ kind: "inbox", thread: null }) : closeInbox}>
        {inbox?.thread ? (
          <DMChatView thread={inbox.thread} onBack={() => overlays.open({ kind: "inbox", thread: null })} />
        ) : (
          <InboxView onBack={closeInbox} onSelectThread={(thread) => overlays.open({ kind: "inbox", thread })} />
        )}
      </AppModal>

      <AppModal visible={!!activity} animationType="slide" onRequestClose={closeActivity}>
        <ActivityView
          onBack={closeActivity}
          onNavigateToLift={() => {
            overlays.close("activity");
            goToTab("track");
          }}
        />
      </AppModal>

      {/* Sheets render last so they stack above full-screen modals. */}
      <CommentsBottomSheet visible={!!comments} postId={comments?.postId ?? undefined} onClose={closeComments} />
      <ChallengeSheet visible={!!challenge} challenge={challenge?.challenge ?? null} onClose={useCloser("challenge")} />
    </>
  );
}

/** Menu, settings and business-role portals. */
function SystemOverlays() {
  const menu = useOverlay("menu");
  const settings = useOverlay("settings");
  const staff = useOverlay("staffDash");
  const coach = useOverlay("coachDash");
  const organizer = useOverlay("organizer");
  const athlete = useOverlay("athlete");

  return (
    <>
      <MenuDrawerModal
        visible={!!menu}
        onClose={useCloser("menu")}
        onSelectFeed={() => goToTab("sodia")}
        onSelectDiscover={() => goToTab("discover")}
        onSelectTrack={() => goToTab("track")}
        onSelectCards={() => goToTab("cards")}
        onSelectProfile={() => goToTab("profile")}
        onOpenSettings={() => overlays.open({ kind: "settings" })}
      />
      <SettingsModal
        visible={!!settings}
        onClose={useCloser("settings")}
        onOpenStaffDash={() => overlays.open({ kind: "staffDash" })}
        onOpenCoachDash={() => overlays.open({ kind: "coachDash" })}
        onOpenOrganizer={() => overlays.open({ kind: "organizer" })}
      />
      <StaffQuickdashModal visible={!!staff} onClose={useCloser("staffDash")} />
      <CoachQuickdashModal visible={!!coach} onClose={useCloser("coachDash")} />
      <OrganizerMeetModal visible={!!organizer} onClose={useCloser("organizer")} />
      <AthleteProfileModal
        visible={!!athlete}
        athlete={athlete?.athlete ?? null}
        onClose={useCloser("athlete")}
        onMessageAthlete={(ath) => {
          overlays.close("athlete");
          overlays.open({
            kind: "inbox",
            thread: {
              id: `thread_${ath.userId}`,
              name: ath.name,
              avatar: ath.avatar,
              lastMessage: "Direct message started",
              timeAgo: "Just now",
              unreadCount: 0,
              type: "direct",
            },
          });
        }}
      />
    </>
  );
}

/** Facility CTA → pass selection → checkout (Phase 3/4). */
function CommerceOverlays() {
  const facility = useOverlay("facility");
  const checkout = useOverlay("checkout");
  const provisionPass = useEcosystemStore((s) => s.provisionPass);
  const closeFacility = useCloser("facility");
  const closeCheckout = useCloser("checkout");

  const handleConfirm = useCallback(
    (item: CheckoutRequest) => {
      provisionPass(item.facilityName, item.billingKind, item.baseAmountPhp, item.title, item.facilityId);
      overlays.close("checkout");
      goToTab("cards");
      toast.success("Pass added to Wallet", item.title);
    },
    [provisionPass]
  );

  return (
    <>
      <FacilityDetailSheet
        facility={facility?.facility ?? null}
        visible={!!facility}
        onClose={closeFacility}
        onSelectPass={(passOpt, fac) => {
          overlays.close("facility");
          overlays.open({
            kind: "checkout",
            item: {
              id: passOpt.id,
              title: `${passOpt.title} • ${fac.name}`,
              subtitle: passOpt.subtitle,
              facilityId: fac.id,
              facilityName: fac.name,
              baseAmountPhp: passOpt.pricePhp,
              billingKind: passOpt.billingKind,
              splitNote: passOpt.splitNote,
            },
          });
        }}
      />
      <UniversalCheckoutModal item={checkout?.item ?? null} visible={!!checkout} onClose={closeCheckout} onConfirm={handleConfirm} />
    </>
  );
}

/** Rendered once at the root so every tab can open any overlay. */
export function OverlayHost() {
  return (
    <>
      <SocialOverlays />
      <SystemOverlays />
      <CommerceOverlays />
    </>
  );
}
