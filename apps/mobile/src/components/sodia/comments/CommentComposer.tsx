import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { MIN_TOUCH_TARGET, SODIA_FIELD_LIMITS } from "sodia-core";
import { useColors } from "../../../theme/theme";

const QUICK_EMOJI = ["🔥", "💪", "👏", "❤️", "⚡"] as const;

interface CommentComposerProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  avatarUrl: string | null;
  error: string | null;
  bottomInset: number;
}

export function CommentComposer({ value, onChange, onSubmit, avatarUrl, error, bottomInset }: CommentComposerProps) {
  const colors = useColors();
  const max = SODIA_FIELD_LIMITS.POST_CAPTION_MAX_CHARS;
  const remaining = max - value.length;
  const canPost = value.trim().length > 0 && remaining >= 0;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bgCard, borderTopColor: colors.borderColor, paddingBottom: Math.max(bottomInset, 10) }]}>
      <View style={styles.emojiRow}>
        {QUICK_EMOJI.map((emoji) => (
          <TouchableOpacity key={emoji} onPress={() => onChange(value + emoji)} style={styles.emojiBtn} accessibilityRole="button" accessibilityLabel={`Insert ${emoji}`}>
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.inputRow}>
        <Image source={{ uri: avatarUrl ?? "" }} style={styles.avatar} />
        <BottomSheetTextInput
          style={[styles.input, { backgroundColor: colors.bgInput, color: colors.textPrimary, borderColor: error ? colors.danger : "transparent" }]}
          placeholder="Add a comment…"
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChange}
          multiline
          accessibilityLabel="Comment"
          accessibilityHint={`Up to ${max} characters`}
        />
        <TouchableOpacity onPress={onSubmit} disabled={!canPost} style={styles.post} accessibilityRole="button" accessibilityLabel="Post comment" accessibilityState={{ disabled: !canPost }}>
          <Text style={[styles.postText, { color: canPost ? colors.accentText : colors.textMuted }]}>Post</Text>
        </TouchableOpacity>
      </View>
      {(error || remaining <= 40) && (
        <Text style={[styles.counter, { color: error || remaining < 0 ? colors.danger : colors.textMuted }]} accessibilityLiveRegion="polite">
          {error ?? `${remaining} characters left`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: 1, paddingTop: 4 },
  emojiRow: { flexDirection: "row", justifyContent: "space-around" },
  emojiBtn: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 20 },
  inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  input: { flex: 1, minHeight: 40, maxHeight: 100, borderRadius: 20, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, fontSize: 14, borderWidth: 1 },
  post: { minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  postText: { fontSize: 14, fontWeight: "800" },
  counter: { fontSize: 11, textAlign: "right", paddingHorizontal: 16, marginTop: 4 },
});
