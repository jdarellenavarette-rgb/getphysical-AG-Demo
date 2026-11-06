import React from "react";
import { SodiaFeed } from "../../src/components/sodia/SodiaFeed";
import { getAthleteProfile } from "../../src/data/athleteRosterData";
import { overlays } from "../../src/navigation/overlayStore";
import { useEcosystemStore } from "../../src/store/ecosystemStore";

export default function SodiaRoute() {
  const facilities = useEcosystemStore((s) => s.facilities);
  return (
    <SodiaFeed
      onPressFacilityCTA={(id) => {
        const facility = facilities.find((f) => f.id === id);
        if (facility) overlays.open({ kind: "facility", facility });
      }}
      onOpenCreatePost={() => overlays.open({ kind: "createPost" })}
      onOpenStoryCamera={() => overlays.open({ kind: "storyCamera" })}
      onOpenStory={(startIndex) => overlays.open({ kind: "storyViewer", startIndex })}
      onOpenComments={(postId) => overlays.open({ kind: "comments", postId: postId ?? null })}
      onPressAuthor={(_userId, name, avatar) => overlays.open({ kind: "athlete", athlete: getAthleteProfile(name, avatar) })}
    />
  );
}
