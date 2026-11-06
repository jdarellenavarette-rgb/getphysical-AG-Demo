import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Plus } from "lucide-react-native";
import { useColors } from "../../../theme/theme";

export interface AthleteNote {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly note: string;
  readonly isMe?: boolean;
}

/** Instagram "Notes" row above the inbox. */
export function NotesTray({ notes }: { notes: readonly AthleteNote[] }) {
  const colors = useColors();
  return (
    <View style={[styles.tray, { borderBottomColor: colors.borderColor }]}>
      <FlashList
        horizontal
        data={notes}
        keyExtractor={(n) => n.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item: n }) => (
          <View style={styles.item} accessible accessibilityLabel={`${n.name} note: ${n.note}`}>
            <View style={[styles.cloud, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
              <Text numberOfLines={2} style={[styles.cloudText, { color: colors.textPrimary }]}>{n.note}</Text>
            </View>
            <View>
              <Image source={{ uri: n.avatar }} style={styles.avatar} />
              {n.isMe && (
                <View style={[styles.add, { borderColor: colors.bgScreen, backgroundColor: colors.accent }]}>
                  <Plus size={11} color={colors.textOnAccent} strokeWidth={3} />
                </View>
              )}
            </View>
            <Text numberOfLines={1} style={[styles.name, { color: colors.textMuted }]}>{n.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tray: { height: 128, borderBottomWidth: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  sep: { width: 14 },
  item: { alignItems: "center", width: 76 },
  cloud: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 4, maxWidth: 80, borderWidth: 1 },
  cloudText: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  add: { position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  name: { fontSize: 11, fontWeight: "600", marginTop: 4, textAlign: "center" },
});
