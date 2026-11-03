import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { Navigation, Plus, Minus, Compass } from "lucide-react-native";
import type { FacilityRow } from "sodia-core";
import { useThemeStore } from "../../theme/theme";
import type { UserCoordinates } from "../../services/locationService";
import type { DiscoverCoach, DiscoverCommunityClub } from "../../data/discoverData";
import { buildLeafletMapHtml } from "./mapHtmlBuilder";

interface DiscoverMapCanvasProps {
  facilities: readonly FacilityRow[];
  coaches?: readonly DiscoverCoach[];
  clubs?: readonly DiscoverCommunityClub[];
  selectedId: string | null;
  userCoords: UserCoordinates;
  onSelectPin: (id: string) => void;
  onSelectCoach?: (id: string) => void;
  onSelectClub?: (id: string) => void;
  onRefreshLocation?: () => void;
}

export function DiscoverMapCanvas({
  facilities,
  coaches = [],
  clubs = [],
  selectedId,
  userCoords,
  onSelectPin,
  onSelectCoach,
  onSelectClub,
  onRefreshLocation,
}: DiscoverMapCanvasProps) {
  const { colors, themeMode } = useThemeStore();
  const webViewRef = useRef<any>(null);
  const isLight = themeMode === "light";

  const mapHtml = buildLeafletMapHtml({
    facilities,
    coaches,
    clubs,
    selectedId,
    userCoords,
    isLight,
    apiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY,
  });

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "SELECT_VENUE" && data.id) {
        onSelectPin(data.id);
      } else if (data.type === "SELECT_COACH" && data.id) {
        onSelectCoach?.(data.id);
      } else if (data.type === "SELECT_CLUB" && data.id) {
        onSelectClub?.(data.id);
      }
    } catch (e) {
      console.warn("Map message parse error:", e);
    }
  };

  const recenterMap = () => {
    onRefreshLocation?.();
    webViewRef.current?.postMessage(JSON.stringify({ type: "RECENTER" }));
  };

  const zoomIn = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: "ZOOM_IN" }));
  };

  const zoomOut = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: "ZOOM_OUT" }));
  };

  return (
    <View style={[styles.mapContainer, { backgroundColor: colors.bgScreen }]}>
      {React.createElement(WebView as any, {
        ref: webViewRef,
        originWhitelist: ["*"],
        source: { html: mapHtml },
        style: styles.webView,
        scrollEnabled: false,
        javaScriptEnabled: true,
        domStorageEnabled: true,
        onMessage: handleMessage,
        renderLoading: () => (
          <View style={[styles.loadingBox, { backgroundColor: colors.bgScreen }]}>
            <ActivityIndicator size="small" color="#E11D48" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Mobilizing GPS Radar...</Text>
          </View>
        ),
        startInLoadingState: true,
      })}

      {/* TOP FLOATING GPS STATUS PILL */}
      <View style={[styles.gpsStatusPill, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.pulseDot} />
        <Text style={[styles.gpsStatusText, { color: colors.textPrimary }]}>
          {userCoords.addressLabel ?? "GPS Live"}
        </Text>
      </View>

      {/* FLOATING MAP NAVIGATION HUD CONTROLS */}
      <View style={styles.hudControls}>
        <TouchableOpacity
          onPress={recenterMap}
          style={[styles.hudButton, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
          activeOpacity={0.8}
        >
          <Compass size={18} color="#E11D48" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={zoomIn}
          style={[styles.hudButton, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
          activeOpacity={0.8}
        >
          <Plus size={16} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={zoomOut}
          style={[styles.hudButton, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
          activeOpacity={0.8}
        >
          <Minus size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 340,
    position: "relative",
    overflow: "hidden",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingBox: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 11,
    fontWeight: "700",
  },
  gpsStatusPill: {
    position: "absolute",
    top: 12,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  gpsStatusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  hudControls: {
    position: "absolute",
    right: 14,
    top: 12,
    gap: 8,
  },
  hudButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
});
