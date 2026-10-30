import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  Plus,
  Send,
  X,
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
  Grid
} from 'lucide-react';
import { StoryViewerModal } from './StoryViewerModal';
import { CreatePostModal } from './CreatePostModal';
import { StampOverlay } from '../common/StampOverlay';
import { SodiaPost, SodiaStory } from '../../types';

export const SodiaFeed: React.FC = () => {
  const {
    posts,
    stories,
    toggleLikePost,
    openCheckout,
    facilities,
    currentUser,
    showToast
  } = useEcosystem();

  const [feedMode, setFeedMode] = useState<'reels' | 'community'>('reels');
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [activeStory, setActiveStory] = useState<SodiaStory | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const activePost = posts[currentPostIndex] || posts[0];

  const handleNextPost = () => {
    if (currentPostIndex < posts.length - 1) {
      setCurrentPostIndex(prev => prev + 1);
    } else {
      setCurrentPostIndex(0);
    }
  };

  const handlePrevPost = () => {
    if (currentPostIndex > 0) {
      setCurrentPostIndex(prev => prev - 1);
    } else {
      setCurrentPostIndex(posts.length - 1);
    }
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    showToast(!isSaved ? 'Workout saved to your private collection' : 'Removed from collection');
  };

  const handleShareClick = () => {
    showToast(`Link to @${activePost.authorUsername}'s workout copied to clipboard!`);
  };

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    if (activePost.comments) {
      activePost.comments.push({
        id: 'c_' + Date.now(),
        author: currentUser.username,
        avatar: currentUser.avatar,
        text: newCommentText,
        time: 'Just now'
      });
      activePost.commentsCount += 1;
    }
    setNewCommentText('');
    showToast('Comment posted!');
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] bg-black text-white select-none overflow-hidden">
      {/* View Switcher: Immersive Reel (Screenshot match) vs Standard Community Feed */}
      <div className="absolute top-2 left-4 z-20 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 border border-white/15">
        <button
          onClick={() => setFeedMode('reels')}
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-all ${
            feedMode === 'reels' ? 'bg-[#ec4899] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Reel View
        </button>
        <button
          onClick={() => setFeedMode('community')}
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-all ${
            feedMode === 'community' ? 'bg-[#ec4899] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Feed View
        </button>
      </div>

      {feedMode === 'reels' ? (
        /* IMMERSIVE REEL VIEW (Exact Match to Right Phone in Screenshot) */
        <div className="relative h-[calc(100vh-65px)] w-full max-w-md mx-auto overflow-hidden bg-zinc-950 flex flex-col justify-between">
          {/* Background Workout Media (Gym session with athlete on machine) */}
          <div className="absolute inset-0 z-0">
            <img
              src={activePost.mediaUrl}
              alt={activePost.authorName}
              className="h-full w-full object-cover object-center filter brightness-[0.88]"
            />
            {/* Cinematic Gradient Overlays for Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
          </div>

          {/* Top Subtle Swipe Helpers */}
          <div className="relative z-10 pt-12 px-4 flex justify-between items-center pointer-events-none">
            <div />
            <div className="pointer-events-auto flex items-center gap-2">
              {posts.length > 1 && (
                <div className="flex gap-1">
                  {posts.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 rounded-full transition-all ${
                        idx === currentPostIndex ? 'w-5 bg-[#ec4899]' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Vertical Engagement Rail (Heart, Speech Bubble, Send, Bookmark) */}
          <div className="absolute right-3.5 bottom-28 z-20 flex flex-col items-center gap-5">
            {/* 1. Like */}
            <button
              onClick={() => toggleLikePost(activePost.id)}
              className="group flex flex-col items-center gap-1 active:scale-75 transition-transform"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
                activePost.hasLiked ? 'text-[#ec4899]' : 'text-white hover:text-pink-400'
              }`}>
                <Heart className={`h-8 w-8 stroke-[1.8] ${activePost.hasLiked ? 'fill-[#ec4899] text-[#ec4899]' : ''}`} />
              </div>
              <span className="text-[11px] font-bold text-white drop-shadow-md">
                Like
              </span>
            </button>

            {/* 2. Comment */}
            <button
              onClick={() => setActiveCommentsPostId(activePost.id)}
              className="group flex flex-col items-center gap-1 active:scale-75 transition-transform"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm text-white hover:text-zinc-200">
                <MessageCircle className="h-8 w-8 stroke-[1.8]" />
              </div>
              <span className="text-[11px] font-bold text-white drop-shadow-md">
                Comment
              </span>
            </button>

            {/* 3. Share */}
            <button
              onClick={handleShareClick}
              className="group flex flex-col items-center gap-1 active:scale-75 transition-transform"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm text-white hover:text-zinc-200">
                <Share2 className="h-7 w-7 stroke-[1.8]" />
              </div>
              <span className="text-[11px] font-bold text-white drop-shadow-md">
                Share
              </span>
            </button>

            {/* 4. Save */}
            <button
              onClick={handleSaveToggle}
              className="group flex flex-col items-center gap-1 active:scale-75 transition-transform"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
                isSaved ? 'text-amber-400' : 'text-white hover:text-amber-200'
              }`}>
                <Bookmark className={`h-7 w-7 stroke-[1.8] ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
              </div>
              <span className="text-[11px] font-bold text-white drop-shadow-md">
                Save
              </span>
            </button>
          </div>

          {/* Bottom Left Content Overlay (Creator Avatar, Name, Handle, Caption) */}
          <div className="relative z-20 px-4 pb-28 space-y-2 max-w-[80%]">
            {/* Creator Row */}
            <div className="flex items-center gap-3">
              <img
                src={activePost.authorAvatar}
                alt={activePost.authorName}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white/60 shadow-lg"
              />
              <div className="flex items-center gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-extrabold text-white tracking-tight drop-shadow-md">
                      {activePost.authorName}
                    </h3>
                    <button
                      onClick={() => showToast(`Profile options for @${activePost.authorUsername}`)}
                      className="rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-white/70 font-medium">
                    @{activePost.authorUsername}
                  </p>
                </div>
              </div>
            </div>

            {/* Caption (Exact: "Ending the day with some glute sessions.") */}
            <p className="text-sm font-medium text-white/95 leading-snug drop-shadow-md pt-0.5">
              {activePost.content}
            </p>

            {/* If Verified Stamp attached */}
            {activePost.stamp && (
              <div className="pt-1">
                <StampOverlay stamp={activePost.stamp} />
              </div>
            )}

            {/* Next Post Button */}
            <div className="pt-1">
              <button
                onClick={handleNextPost}
                className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white hover:bg-white/25 transition-all"
              >
                <span>Next Workout</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD COMMUNITY FEED VIEW (With Stories Tray, Stamps, and Comments) */
        <div className="max-w-md mx-auto px-4 pt-12 pb-28 space-y-4">
          {/* Stories Tray */}
          <div className="flex items-center gap-3.5 overflow-x-auto py-2 no-scrollbar">
            {/* Your Story */}
            <div
              onClick={() => setIsCreatePostOpen(true)}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
            >
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#ec4899] p-0.5 bg-zinc-900">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-full w-full rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#ec4899] text-white shadow-md">
                  <Plus className="h-3 w-3 stroke-[3]" />
                </span>
              </div>
              <span className="text-[10px] font-bold text-zinc-300">Your Story</span>
            </div>

            {/* Stories */}
            {stories.map(s => (
              <div
                key={s.id}
                onClick={() => setActiveStory(s)}
                className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
              >
                <div className={`h-14 w-14 rounded-full p-0.5 ${
                  s.hasUnseen
                    ? 'bg-gradient-to-tr from-[#f43f5e] via-[#ec4899] to-[#d946ef]'
                    : 'bg-zinc-700'
                }`}>
                  <img
                    src={s.authorAvatar}
                    alt={s.authorName}
                    className="h-full w-full rounded-full object-cover border-2 border-black"
                  />
                </div>
                <span className="text-[10px] font-medium text-zinc-300 truncate max-w-[56px]">
                  {s.authorName.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          {/* Community Posts */}
          <div className="space-y-4">
            {posts.map(post => (
              <div
                key={post.id}
                className="rounded-3xl bg-zinc-900/90 border border-white/10 p-4 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{post.authorName}</h4>
                      <p className="text-[11px] text-zinc-400">@{post.authorUsername} · {post.createdAt}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed">{post.content}</p>

                {post.mediaUrl && (
                  <div className="relative rounded-2xl overflow-hidden max-h-72">
                    <img
                      src={post.mediaUrl}
                      alt="Workout post"
                      className="h-full w-full object-cover"
                    />
                    {post.stamp && (
                      <div className="absolute top-2.5 right-2.5">
                        <StampOverlay stamp={post.stamp} />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs text-zinc-400">
                  <button
                    onClick={() => toggleLikePost(post.id)}
                    className={`flex items-center gap-1.5 font-bold transition-colors ${
                      post.hasLiked ? 'text-[#ec4899]' : 'hover:text-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.hasLiked ? 'fill-[#ec4899]' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentsPostId(post.id)}
                    className="flex items-center gap-1.5 hover:text-white font-bold"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.commentsCount} comments</span>
                  </button>

                  <button
                    onClick={handleShareClick}
                    className="flex items-center gap-1.5 hover:text-white font-bold"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Bottom Sheet Modal */}
      {activeCommentsPostId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-t-[36px] bg-zinc-900 border-t border-white/15 p-5 shadow-2xl max-h-[75vh] flex flex-col animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white">Comments</h3>
              <button
                onClick={() => setActiveCommentsPostId(null)}
                className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {(activePost.comments || []).map((c, i) => (
                <div key={i} className="flex gap-2.5 text-xs">
                  <img
                    src={c.avatar}
                    alt={c.author}
                    className="h-8 w-8 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-white">@{c.author}</span>
                      <span className="text-[10px] text-zinc-500">{c.time}</span>
                    </div>
                    <p className="text-zinc-300 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Box */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                className="flex-1 rounded-full bg-white/10 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-[#ec4899]"
              />
              <button
                onClick={handleAddComment}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ec4899] text-white hover:bg-pink-600 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer Overlay */}
      {activeStory && (
        <StoryViewerModal
          story={activeStory}
          onClose={() => setActiveStory(null)}
        />
      )}

      {/* Create Post Modal */}
      {isCreatePostOpen && (
        <CreatePostModal onClose={() => setIsCreatePostOpen(false)} />
      )}
    </div>
  );
};
