import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomSheetFooter, useBottomSheetScrollableCreator } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageCircle, X } from "lucide-react-native";
import { createEmptyState, createSuccessState, MIN_TOUCH_TARGET, postCaptionSchema } from "sodia-core";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useColors } from "../../theme/theme";
import { AppBottomSheet } from "../sheets/AppBottomSheet";
import { TenStateView } from "../common/TenStateView";
import { haptics } from "../../lib/haptics";
import { CommentRow, type SodiaComment } from "./comments/CommentRow";
import { CommentComposer } from "./comments/CommentComposer";

interface CommentsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  postId?: string;
}

const SEED_COMMENTS: readonly SodiaComment[] = [
  { id: "c1", author: "Coach Miguel Ramos", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", text: "Textbook hip hinge on that final rep. Rest up for the Saturday ladder!", time: "2h", likes: 12, isLiked: false, isPinned: true },
  { id: "c2", author: "Sarah Jenkins", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", text: "Insane pull! Which rack at Metro Core was this on?", time: "45m", likes: 4, isLiked: true, isPinned: false },
];
const SNAP_POINTS = ["60%", "92%"] as const;
const COMPOSER_SPACE = 150;

export function CommentsBottomSheet({ visible, onClose, postId }: CommentsBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const profile = useEcosystemStore((s) => s.profile);
  const renderScrollComponent = useBottomSheetScrollableCreator();
  const key = postId ?? "story";
  const [threads, setThreads] = useState<Readonly<Record<string, readonly SodiaComment[]>>>({});
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const comments = threads[key] ?? SEED_COMMENTS;

  const update = useCallback(
    (fn: (list: readonly SodiaComment[]) => readonly SodiaComment[]) => setThreads((t) => ({ ...t, [key]: fn(t[key] ?? SEED_COMMENTS) })),
    [key]
  );

  const changeDraft = (text: string) => {
    setDraft(text);
    const result = postCaptionSchema.safeParse(text);
    setError(result.success ? null : (result.error.issues[0]?.message ?? "Comment is too long"));
  };

  const submit = () => {
    const text = draft.trim();
    if (!text || !postCaptionSchema.safeParse(text).success) return;
    haptics.light();
    update((list) => [
      ...list,
      { id: `c_${Date.now()}`, author: `${profile.first_name} ${profile.last_name}`, avatar: profile.avatar_url ?? "", text, time: "now", likes: 0, isLiked: false, isPinned: false },
    ]);
    setDraft("");
    setError(null);
  };

  const toggleLike = useCallback(
    (id: string) => {
      haptics.selection();
      update((list) => list.map((c) => (c.id === id ? { ...c, isLiked: !c.isLiked, likes: c.likes + (c.isLiked ? -1 : 1) } : c)));
    },
    [update]
  );
  const reply = useCallback((author: string) => changeDraft(`@${author} `), []);

  const state = comments.length === 0 ? createEmptyState("Start the conversation.", "Add a comment") : createSuccessState(comments);

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={SNAP_POINTS}
      accessibilityLabel="Comments"
      footer={(props) => (
        <BottomSheetFooter {...props}>
          <CommentComposer value={draft} onChange={changeDraft} onSubmit={submit} avatarUrl={profile.avatar_url} error={error} bottomInset={insets.bottom} />
        </BottomSheetFooter>
      )}
    >
      <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">
          Comments ({comments.length})
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Close comments">
          <X size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <TenStateView state={state} emptyIcon={MessageCircle} emptyTitle="No comments yet" compact>
        {(list) => (
          <FlashList
            data={list}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => <CommentRow comment={item} onToggleLike={toggleLike} onReply={reply} />}
            renderScrollComponent={renderScrollComponent}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: COMPOSER_SPACE + insets.bottom }}
          />
        )}
      </TenStateView>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingLeft: 20, paddingRight: 8, borderBottomWidth: 1 },
  title: { fontSize: 15, fontWeight: "800" },
  close: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
});
