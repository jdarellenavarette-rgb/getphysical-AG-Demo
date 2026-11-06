import React, { useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { Navigation, Maximize2 } from "lucide-react-native";
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
  const initialPosRef = useRef(currentPos);
  const isMapReadyRef = useRef(false);

  // Send incremental position updates without reloading the WebView DOM
  useEffect(() => {
    if (!isMapReadyRef.current) return;
    const js = `window.updatePos && window.updatePos(${currentPos[0]}, ${currentPos[1]}); true;`;
    webViewRef.current?.injectJavaScript(js);
  }, [currentPos]);

  const effectiveKey = process.env.EXPO_PUBLIC_MAPS_API_KEY || "";
  const primaryTileUrl = isLight
    ? `https://maps.geoapify.com/v1/tile/osm-bright-smooth/{z}/{x}/{y}.png?apiKey=${effectiveKey}`
    : `https://maps.geoapify.com/v1/tile/dark-matter-purple-roads/{z}/{x}/{y}.png?apiKey=${effectiveKey}`;
  const fallbackTileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  const initialCoordsJson = JSON.stringify(routeCoords);
  const initialPosJson = JSON.stringify(initialPosRef.current);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; background:${isLight ? "#F4F4F5" : "#09090B"}; }
    .live-beacon {
      width: 18px; height: 18px; border-radius: 9px; background: #E11D48;
      border: 3px solid #FFFFFF; box-shadow: 0 0 16px rgba(225,29,72,0.9);
      animation: pulse 1.6s infinite ease-in-out;
    }
    .start-beacon {
      width: 14px; height: 14px; border-radius: 7px; background: #059669;
      border: 2.5px solid #FFFFFF; box-shadow: 0 0 8px rgba(5,150,105,0.7);
    }
    @keyframes pulse {
      0% { transform: scale(0.92); opacity: 1; }
      50% { transform: scale(1.35); opacity: 0.75; }
      100% { transform: scale(0.92); opacity: 1; }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var startPos = ${initialPosJson};
    var initialCoords = ${initialCoordsJson};
    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView(startPos, 16);

    var primaryLayer = L.tileLayer('${primaryTileUrl}', { maxZoom: 19 });
    var fallbackLayer = L.tileLayer('${fallbackTileUrl}', { maxZoom: 19 });

    primaryLayer.on('tileerror', function() {
      if (!map.hasLayer(fallbackLayer)) {
        fallbackLayer.addTo(map);
      }
    });
    primaryLayer.addTo(map);

    var liveIcon = L.divIcon({ className: 'live-beacon', iconSize: [18, 18], iconAnchor: [9, 9] });
    var startIcon = L.divIcon({ className: 'start-beacon', iconSize: [14, 14], iconAnchor: [7, 7] });

    if (initialCoords && initialCoords.length > 0) {
      L.marker(initialCoords[0], { icon: startIcon }).addTo(map);
    }

    var polyline = L.polyline(initialCoords, {
      color: '#E11D48',
      weight: 5.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 1.0
    }).addTo(map);

    var liveMarker = L.marker(startPos, { icon: liveIcon }).addTo(map);

    window.updatePos = function(lat, lng) {
      var latLng = [lat, lng];
      liveMarker.setLatLng(latLng);
      polyline.addLatLng(latLng);
      map.panTo(latLng, { animate: true, duration: 0.45 });
    };

    window.recenter = function() {
      map.setView(liveMarker.getLatLng(), 16, { animate: true });
    };

    window.fitRoute = function() {
      if (polyline.getLatLngs().length > 1) {
        map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
      }
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
        onLoadEnd={() => {
          isMapReadyRef.current = true;
          // Sync current position immediately after bridge is ready
          const js = `window.updatePos && window.updatePos(${currentPos[0]}, ${currentPos[1]}); true;`;
          webViewRef.current?.injectJavaScript(js);
        }}
      />
      <View style={styles.mapFloatingBar}>
        <TouchableOpacity
          onPress={() => webViewRef.current?.injectJavaScript("window.fitRoute && window.fitRoute(); true;")}
          style={styles.mapBtn}
          accessibilityLabel="Fit Route"
        >
          <Maximize2 size={15} color="#E11D48" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => webViewRef.current?.injectJavaScript("window.recenter && window.recenter(); true;")}
          style={styles.mapBtn}
          accessibilityLabel="Recenter GPS"
        >
          <Navigation size={15} color="#E11D48" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { height: 195, borderRadius: 18, overflow: "hidden", borderWidth: 1.5, borderColor: "rgba(225,29,72,0.35)", position: "relative" },
  webView: { flex: 1, backgroundColor: "transparent" },
  mapFloatingBar: { position: "absolute", bottom: 12, right: 12, gap: 8 },
  mapBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(9,9,11,0.85)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
});
