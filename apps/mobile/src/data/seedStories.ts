/** One story in the tray and viewer. The tray and the viewer read the same list. */
export interface StoryItem {
  id: string;
  /** Short label under the tray bubble. */
  shortName: string;
  /** Full name; also the inbox thread a reply goes to. */
  name: string;
  avatar: string;
  mediaUrl: string;
  caption: string;
  createdAt: string;
  locationTag?: { id: string; name: string };
}

const hoursAgo = (hours: number): string => new Date(Date.now() - hours * 3_600_000).toISOString();
const unsplash = (id: string, width: number): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export const SEED_STORIES: readonly StoryItem[] = [
  {
    id: "story_metro_core",
    shortName: "Metro Core",
    name: "Metro Core Arena",
    avatar: unsplash("photo-1534438327276-14e5300c3a48", 200),
    mediaUrl: unsplash("photo-1540497077202-7c8a3999166f", 900),
    caption: "New platforms are in. Open until 11 PM tonight.",
    createdAt: hoursAgo(1),
    locationTag: { id: "fac_metro_core", name: "Metro Core Arena" },
  },
  {
    id: "story_nexus_club",
    shortName: "Nexus Club",
    name: "Nexus Racket & Court Club",
    avatar: unsplash("photo-1622279457486-62dcc4a431d6", 200),
    mediaUrl: unsplash("photo-1554068865-24cecd4e34b8", 900),
    caption: "Open play on the pickleball courts from 6 PM.",
    createdAt: hoursAgo(3),
    locationTag: { id: "fac_nexus_club", name: "Nexus Racket & Court Club" },
  },
  {
    id: "story_coach_miguel",
    shortName: "Coach Miguel",
    name: "Coach Miguel Ramos",
    avatar: unsplash("photo-1507003211169-0a1dd7228f2d", 200),
    mediaUrl: unsplash("photo-1517838277536-f5f99be501cd", 900),
    caption: "Heavy deadlift triples today. Peak week prep is underway.",
    createdAt: hoursAgo(5),
    locationTag: { id: "fac_metro_core", name: "Metro Core Arena" },
  },
  {
    id: "story_coach_sofia",
    shortName: "Coach Sofia",
    name: "Coach Sofia Chen",
    avatar: unsplash("photo-1544005313-94ddf0286df2", 200),
    mediaUrl: unsplash("photo-1518611012118-696072aa579a", 900),
    caption: "Morning reformer flow. Two spots left in the 7 AM class.",
    createdAt: hoursAgo(8),
  },
];

export const OWN_STORY_ID = "story_own";
