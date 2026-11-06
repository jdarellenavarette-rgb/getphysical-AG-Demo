import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MapPin, Play, Tag, Trophy } from "lucide-react-native";
import type { SodiaPostRow } from "sodia-core";
import { useColors } from "../../../theme/theme";
import { PlayableVideoView } from "../PlayableVideoView";
import { DoubleTapLike } from "./DoubleTapLike";
import { stampText, type PostView } from "./postModel";

const SAMPLE_REEL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

interface PostMediaProps {
  post: SodiaPostRow;
  view: PostView;
  onDoubleTapLike: () => void;
  onPressFacility?: (facilityId: string) => void;
}

export function PostMedia({ post, view, onDoubleTapLike, onPressFacility }: PostMediaProps) {
  const colors = useColors();
  const pill = { backgroundColor: colors.mediaScrim };
  const { kind, facilityTag } = view;

  if (kind === "status") {
    return (
      <DoubleTapLike onDoubleTap={onDoubleTapLike} style={[styles.status, { backgroundColor: colors.accentHover }]} accessibilityLabel={`Status: ${post.content}`}>
        <Text style={[styles.statusText, { color: colors.textOnAccent }]}>"{post.content}"</Text>
        <Text style={[styles.statusSign, { color: colors.textOnAccent }]}>— {post.author_name}</Text>
      </DoubleTapLike>
    );
  }

  if (kind === "reel") {
    return (
      <View style={[styles.media, styles.reel]}>
        <PlayableVideoView videoUrl={stampText(view, "videoUrl", SAMPLE_REEL)} posterUrl={post.media_url ?? undefined} autoPlay={false} />
        <View style={[styles.reelBadge, pill]}>
          <Play size={12} color={colors.textOnMedia} fill={colors.textOnMedia} />
          <Text style={[styles.badgeText, { color: colors.textOnMedia }]}>REEL • {stampText(view, "duration", "0:38")}</Text>
        </View>
        <View style={[styles.audio, pill]}>
          <Text style={[styles.badgeText, { color: colors.textOnMedia }]} numberOfLines={1}>
            {stampText(view, "audioTrack", "Original Audio")}
          </Text>
          <Text style={[styles.badgeMuted, { color: colors.textOnMediaMuted }]}>• {stampText(view, "viewsCount", "0")} views</Text>
        </View>
      </View>
    );
  }

  return (
    <DoubleTapLike onDoubleTap={onDoubleTapLike} style={styles.media} accessibilityLabel={`Photo by ${post.author_name ?? "athlete"}`}>
      <Image source={{ uri: post.media_url ?? "" }} style={styles.photo} resizeMode="cover" accessibilityIgnoresInvertColors />
      {kind === "challenge" && (
        <View style={[styles.topRight, pill, { borderColor: colors.warning }]}>
          <Trophy size={14} color={colors.warning} />
          <Text style={[styles.badgeText, { color: colors.textOnMedia }]}>{stampText(view, "metric", "VERIFIED BENCHMARK")}</Text>
        </View>
      )}
      {kind === "ad" && (
        <View style={[styles.topRight, pill, { borderColor: colors.accentGreen }]}>
          <Tag size={13} color={colors.accentGreen} />
          <Text style={[styles.badgeText, { color: colors.textOnMedia }]}>Code: {stampText(view, "promoCode", "SODIA2026")}</Text>
        </View>
      )}
      {facilityTag && kind !== "ad" && (
        <TouchableOpacity
          onPress={() => onPressFacility?.(String(facilityTag.id ?? ""))}
          style={[styles.venue, pill]}
          accessibilityRole="button"
          accessibilityLabel={`${facilityTag.name}: ${facilityTag.actionCTA}, ${facilityTag.price} pesos`}
        >
          <MapPin size={14} color={colors.accentGreen} />
          <Text style={[styles.venueName, { color: colors.textOnMedia }]} numberOfLines={1}>@{facilityTag.name}</Text>
          <View style={[styles.venueCta, { backgroundColor: colors.accent }]}>
            <Text style={[styles.badgeText, { color: colors.textOnAccent }]}>{facilityTag.actionCTA} • ₱{facilityTag.price}</Text>
          </View>
        </TouchableOpacity>
      )}
    </DoubleTapLike>
  );
}

const styles = StyleSheet.create({
  media: { position: "relative", width: "100%", height: 310 },
  reel: { height: 380 },
  photo: { width: "100%", height: "100%" },
  status: { padding: 26, minHeight: 180, justifyContent: "center", alignItems: "center" },
  statusText: { fontSize: 17, fontWeight: "800", textAlign: "center", lineHeight: 26 },
  statusSign: { fontSize: 12, fontWeight: "700", marginTop: 10, opacity: 0.85 },
  reelBadge: { position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  audio: { position: "absolute", bottom: 12, left: 12, right: 60, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "800" },
  badgeMuted: { fontSize: 11, marginLeft: 4 },
  topRight: { position: "absolute", top: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  venue: { position: "absolute", bottom: 12, left: 12, right: 12, minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  venueName: { fontSize: 12, fontWeight: "800", flex: 1, marginLeft: 6 },
  venueCta: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
});
