/** A comment on a feed post. */
export interface FeedComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

const MIGUEL = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80";
const SARAH = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80";
const SOFIA = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80";
const RAFAEL = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80";

const minutesAgo = (minutes: number): string => new Date(Date.now() - minutes * 60_000).toISOString();

function comment(
  id: string,
  author: string,
  avatar: string,
  text: string,
  minutes: number,
  likes: number,
): FeedComment {
  return { id, author, avatar, text, createdAt: minutesAgo(minutes), likes, isLiked: false };
}

/** Preview comments, keyed by post id, so each post opens its own conversation. */
export const SEED_COMMENTS: Record<string, FeedComment[]> = {
  post_darelle_physique: [
    comment("c_phys_1", "Coach Miguel Ramos", MIGUEL, "Shoulders are coming in. Keep the incline work going.", 95, 12),
    comment("c_phys_2", "Sarah Jenkins", SARAH, "What does the push split look like this block?", 40, 4),
  ],
  post_darelle_tennis: [
    comment(
      "c_ten_1",
      "Coach Rafael Santos",
      RAFAEL,
      "That jump timing is clean. Contact point is right out front.",
      160,
      9,
    ),
    comment("c_ten_2", "Sarah Jenkins", SARAH, "Doubles this weekend?", 120, 2),
  ],
  post_darelle_boxing: [
    comment("c_box_1", "Coach Miguel Ramos", MIGUEL, "Eight rounds after a lift day is no joke.", 600, 7),
  ],
  post_darelle_gear: [comment("c_gear_1", "Coach Rafael Santos", RAFAEL, "What tension did you go with?", 1300, 3)],
  post_mock_reel: [
    comment("c_reel_1", "Sarah Jenkins", SARAH, "Saving this for my next core day.", 200, 15),
    comment("c_reel_2", "Coach Miguel Ramos", MIGUEL, "Great cue on the pelvic tilt.", 150, 6),
  ],
  post_mock_challenge: [
    comment("c_chal_1", "Sarah Jenkins", SARAH, "Not my event, but I'll be there to cheer.", 300, 5),
    comment("c_chal_2", "Coach Sofia Chen", SOFIA, "Warm up properly, everyone.", 240, 8),
  ],
  post_mock_photo: [
    comment("c_photo_1", "Coach Sofia Chen", SOFIA, "What a night. The floodlights look amazing.", 420, 6),
  ],
  post_mock_ad: [],
};
