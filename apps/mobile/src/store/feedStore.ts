import { create } from "zustand";
import { SEED_COMMENTS, type FeedComment } from "../data/seedComments";

interface FeedState {
  likedPostIds: Readonly<Record<string, boolean>>;
  joinedChallengeIds: Readonly<Record<string, boolean>>;
  followedUserIds: Readonly<Record<string, boolean>>;
  commentsByPost: Readonly<Record<string, readonly FeedComment[]>>;
  toggleLike: (postId: string) => void;
  toggleChallenge: (challengeId: string) => void;
  toggleFollow: (userId: string) => void;
  addComment: (postId: string, comment: Pick<FeedComment, "author" | "avatar" | "text">) => void;
  toggleCommentLike: (postId: string, commentId: string) => void;
  /** Drops everything attached to a deleted post. */
  forgetPost: (postId: string) => void;
}

/**
 * Likes, follows, challenge sign-ups and comments. Kept outside the feed screen so they
 * survive switching tabs. Session-only until the feed is backed by the server.
 */
export const useFeedStore = create<FeedState>((set) => ({
  likedPostIds: {},
  joinedChallengeIds: {},
  followedUserIds: {},
  commentsByPost: SEED_COMMENTS,

  toggleLike: (postId) =>
    set((state) => ({ likedPostIds: { ...state.likedPostIds, [postId]: !state.likedPostIds[postId] } })),

  toggleChallenge: (challengeId) =>
    set((state) => ({
      joinedChallengeIds: { ...state.joinedChallengeIds, [challengeId]: !state.joinedChallengeIds[challengeId] },
    })),

  toggleFollow: (userId) =>
    set((state) => ({ followedUserIds: { ...state.followedUserIds, [userId]: !state.followedUserIds[userId] } })),

  addComment: (postId, comment) =>
    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: [
          ...(state.commentsByPost[postId] ?? []),
          { ...comment, id: `c_${Date.now()}`, createdAt: new Date().toISOString(), likes: 0, isLiked: false },
        ],
      },
    })),

  toggleCommentLike: (postId, commentId) =>
    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: (state.commentsByPost[postId] ?? []).map((c) =>
          c.id === commentId ? { ...c, isLiked: !c.isLiked, likes: c.likes + (c.isLiked ? -1 : 1) } : c,
        ),
      },
    })),

  forgetPost: (postId) =>
    set((state) => {
      const { [postId]: _removed, ...commentsByPost } = state.commentsByPost;
      const { [postId]: _liked, ...likedPostIds } = state.likedPostIds;
      return { commentsByPost, likedPostIds };
    }),
}));
