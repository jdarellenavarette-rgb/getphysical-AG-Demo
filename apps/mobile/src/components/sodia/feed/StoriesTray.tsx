import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Plus } from "lucide-react-native";
import { useColors } from "../../../theme/theme";

export interface StoryBubble {
  readonly id: string;
  readonly name: string;
  readonly image: string | null;
  readonly hasStory: boolean;
  readonly isMe?: boolean;
}

interface StoriesTrayProps {
  stories: readonly StoryBubble[];
  onOpenStory: (index: number) => void;
  onOpenCamera: () => void;
}

export function StoriesTray({ stories, onOpenStory, onOpenCamera }: StoriesTrayProps) {
  const colors = useColors();

  const renderItem = ({ item, index }: { item: StoryBubble; index: number }) => {
    const open = () => (item.isMe && !item.hasStory ? onOpenCamera() : onOpenStory(item.isMe ? 0 : index - 1));
    return (
      <TouchableOpacity
        onPress={open}
        style={styles.item}
        accessibilityRole="button"
        accessibilityLabel={item.isMe ? (item.hasStory ? "Your story" : "Add to your story") : `${item.name}'s story`}
      >
        <View style={[styles.ring, { borderColor: item.hasStory ? colors.accent : colors.borderColor }]}>
          <Image source={{ uri: item.image ?? "" }} style={styles.avatar} />
          {item.isMe && (
            <TouchableOpacity
              onPress={onOpenCamera}
              hitSlop={10}
              style={[styles.addBadge, { borderColor: colors.bgScreen, backgroundColor: colors.accent }]}
              accessibilityRole="button"
              accessibilityLabel="Create a new story"
            >
              <Plus size={12} color={colors.textOnAccent} strokeWidth={3.5} />
            </TouchableOpacity>
          )}
        </View>
        <Text numberOfLines={1} style={[styles.label, { color: colors.textSecondary }]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.tray, { borderBottomColor: colors.borderColor }]}>
      <FlashList
        horizontal
        data={stories}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tray: { height: 104, borderBottomWidth: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  sep: { width: 12 },
  item: { alignItems: "center", width: 70 },
  ring: { width: 66, height: 66, borderRadius: 33, borderWidth: 2, padding: 2 },
  avatar: { width: "100%", height: "100%", borderRadius: 30 },
  addBadge: { position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  label: { fontSize: 11, fontWeight: "600", marginTop: 5, textAlign: "center" },
});
