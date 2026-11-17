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

export const OWN_STORY_ID = "story_own";
