import React from "react";
import { Image, Text, View, type ImageStyle, type StyleProp } from "react-native";
import { useThemeStore } from "../../theme/theme";

interface AvatarProps {
  uri?: string | null;
  /** Used for the initials shown when there is no photo. */
  name?: string | null;
  size: number;
  style?: StyleProp<ImageStyle>;
}

function initialsOf(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0]![0]}${parts[parts.length - 1]![0]}` : (parts[0]?.slice(0, 2) ?? "");
  return letters.toUpperCase();
}

/** A person's photo, or their initials when they have not added one. */
export function Avatar({ uri, name, size, style }: AvatarProps) {
  const { colors } = useThemeStore();
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={[shape, style]} accessibilityIgnoresInvertColors />;
  return (
    <View
      style={[shape, { backgroundColor: colors.bgInput, alignItems: "center", justifyContent: "center" }, style]}
      accessibilityLabel={name ?? "Profile photo"}
    >
      <Text style={{ color: colors.textSecondary, fontSize: Math.round(size * 0.38), fontWeight: "800" }}>
        {initialsOf(name) || "?"}
      </Text>
    </View>
  );
}
