import React, { useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { Navigation, Plus, Minus } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

interface StravaRouteMapProps {
  routeCoords: [number, number][];
  currentPos: [number, number];
  isTracking: boolean;
}

export function StravaRouteMap({ routeCoords, currentPos, isTracking }: StravaRouteMapProps) {
  const { themeMode } = useThemeStore();
  const webViewRef = useRef<any>(null);
  const isLight = themeMode === "light";
  const effectiveKey = process.env.EXPO_PUBLIC_MAPS_API_KEY || "d797ff206eda4d1a804ab31d002f0f41";

  const tileUrl = isLight
    ? `https://maps.geoapify.com/v1/tile/osm-bright-smooth/{z}/{x}/{y}.png?apiKey=${effectiveKey}`
    : `https://maps.geoapify.com/v1/tile/dark-matter-purple-roads/{z}/{x}/{y}.png?apiKey=${effectiveKey}`;

  const coordsJson = JSON.stringify(routeCoords);
  const currentPosJson = JSON.stringify(currentPos);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; background:${isLight ? "#F3F4F6" : "#0D0D11"}; }
    .strava-beacon {
      width: 18px; height: 18px; border-radius: 9px; background: #FC4C02;
      border: 3px solid #FFFFFF; box-shadow: 0 0 12px rgba(252,76,2,0.8);
      animation: pulse 1.8s infinite;
    }
    .start-beacon {
      width: 14px; height: 14px; border-radius: 7px; background: #10B981;
      border: 2px solid #FFFFFF;
    }
    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.7; }
      100% { transform: scale(0.9); opacity: 1; }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var coords = ${coordsJson};
    var currentPos = ${currentPosJson};
    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView(currentPos, 15);
    L.tileLayer('${tileUrl}', { maxZoom: 19 }).addTo(map);

    if (coords && coords.length > 0) {
      L.marker(coords[0], {
        icon: L.divIcon({ className: 'start-beacon', iconSize: [14, 14], iconAnchor: [7, 7] })
      }).addTo(map);

      var polyline = L.polyline(coords, {
        color: '#FC4C02',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
        smoothFactor: 1.0
      }).addTo(map);

      if (coords.length > 1) {
        map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
      }
    }

    var liveMarker = L.marker(currentPos, {
      icon: L.divIcon({ className: 'strava-beacon', iconSize: [18, 18], iconAnchor: [9, 9] })
    }).addTo(map);

    window.updateCurrentPos = function(pos) {
      liveMarker.setLatLng(pos);
      map.panTo(pos);
    };

    window.recenter = function() {
      map.setView(currentPos, 16);
    };
  </script>
</body>
</html>`;

  return (
    <View style={styles.mapContainer}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webView}
        scrollEnabled={false}
      />
      <View style={styles.mapFloatingBar}>
        <TouchableOpacity
          onPress={() => webViewRef.current?.injectJavaScript("window.recenter(); true;")}
          style={styles.mapBtn}
        >
          <Navigation size={16} color="#FC4C02" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { height: 180, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(252,76,2,0.3)", position: "relative" },
  webView: { flex: 1, backgroundColor: "transparent" },
  mapFloatingBar: { position: "absolute", bottom: 10, right: 10, gap: 6 },
  mapBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
});
