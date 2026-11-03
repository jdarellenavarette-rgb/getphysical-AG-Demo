import type { FacilityRow } from "sodia-core";
import type { UserCoordinates } from "../../services/locationService";

interface BuildMapHtmlOptions {
  facilities: readonly FacilityRow[];
  selectedId: string | null;
  userCoords: UserCoordinates;
  isLight: boolean;
  apiKey?: string;
}

export function buildLeafletMapHtml({
  facilities,
  selectedId,
  userCoords,
  isLight,
  apiKey,
}: BuildMapHtmlOptions): string {
  const effectiveKey = apiKey || process.env.EXPO_PUBLIC_MAPS_API_KEY || "d797ff206eda4d1a804ab31d002f0f41";

  // Free-source Geoapify OpenStreetMap tiles with API key
  const primaryTileUrl = isLight
    ? `https://maps.geoapify.com/v1/tile/osm-bright-smooth/{z}/{x}/{y}.png?apiKey=${effectiveKey}`
    : `https://maps.geoapify.com/v1/tile/dark-matter-purple-roads/{z}/{x}/{y}.png?apiKey=${effectiveKey}`;

  // Resilient fallback tile layer (CARTO / OpenStreetMap)
  const fallbackTileUrl = isLight
    ? "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
    : "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";

  const markersJson = JSON.stringify(
    facilities.map((f) => ({
      id: f.id,
      name: f.name,
      lat: f.lat ?? 14.549,
      lng: f.lng ?? 121.05,
      price: f.day_pass_price_php ?? f.court_hourly_price_php ?? 250,
      isSelected: f.id === selectedId,
    }))
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; user-select:none; }
    html, body, #map { width:100%; height:100%; background:${isLight ? "#E5E7EB" : "#0C0C0F"}; font-family:-apple-system,BlinkMacSystemFont,sans-serif; }
    .price-pin {
      display:flex; align-items:center; gap:4px;
      padding:5px 9px; border-radius:999px; font-weight:800; font-size:12px;
      background:${isLight ? "#FFFFFF" : "#141418"};
      color:${isLight ? "#0F172A" : "#FFFFFF"};
      border:1.5px solid ${isLight ? "#CBD5E1" : "rgba(255,255,255,0.2)"};
      box-shadow:0 3px 8px rgba(0,0,0,0.3);
      cursor:pointer; transition:transform 0.15s ease;
      white-space:nowrap;
    }
    .price-pin.active {
      background:#E11D48; color:#FFFFFF; border-color:#FFFFFF;
      transform:scale(1.12); z-index:999 !important;
    }
    .dot { width:6px; height:6px; border-radius:3px; background:#10B981; }
    .price-pin.active .dot { background:#FFFFFF; }
    .coach-pin {
      display:flex; align-items:center; gap:4px; padding:5px 8px; border-radius:999px;
      background:#2563EB; color:#FFF; font-size:11px; font-weight:800; border:1.5px solid #60A5FA;
      box-shadow:0 3px 8px rgba(37,99,235,0.4);
    }
    .meet-pin {
      display:flex; align-items:center; gap:4px; padding:5px 8px; border-radius:999px;
      background:#D97706; color:#FFF; font-size:11px; font-weight:800; border:1.5px solid #FBBF24;
      box-shadow:0 3px 8px rgba(217,119,6,0.4);
    }
    .gps-halo {
      width:24px; height:24px; border-radius:12px; background:rgba(59,130,246,0.3);
      display:flex; align-items:center; justify-content:center;
      animation:pulse 2s infinite;
    }
    .gps-dot { width:12px; height:12px; border-radius:6px; background:#3B82F6; border:2px solid #FFF; }
    @keyframes pulse { 0%{ transform:scale(0.9); opacity:0.9; } 70%{ transform:scale(1.5); opacity:0; } 100%{ transform:scale(0.9); opacity:0; } }
    .leaflet-control-attribution { display:none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const userLat = ${userCoords.latitude};
    const userLng = ${userCoords.longitude};
    const map = L.map('map', { zoomControl:false }).setView([userLat, userLng], 14);

    const primaryUrl = '${primaryTileUrl}';
    const fallbackUrl = '${fallbackTileUrl}';
    const tiles = L.tileLayer(primaryUrl, { maxZoom: 19 }).addTo(map);
    tiles.on('tileerror', function() {
      if (!this._fallbackApplied) {
        this._fallbackApplied = true;
        this.setUrl(fallbackUrl);
      }
    });

    // User GPS Marker
    const userIcon = L.divIcon({
      className: '',
      html: '<div class="gps-halo"><div class="gps-dot"></div></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup('<b>You</b><br>${userCoords.addressLabel ?? "Current Location"}');

    // Venue Markers
    const venues = ${markersJson};
    venues.forEach(v => {
      const pinClass = v.isSelected ? 'price-pin active' : 'price-pin';
      const icon = L.divIcon({
        className: '',
        html: '<div class="' + pinClass + '"><span class="dot"></span>₱' + v.price + '</div>',
        iconAnchor: [35, 16]
      });
      const marker = L.marker([v.lat, v.lng], { icon: icon }).addTo(map);
      marker.on('click', () => {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_VENUE', id: v.id }));
        }
      });
    });

    // Verified Coach Miguel PT Marker (14.5515, 121.0475)
    const coachIcon = L.divIcon({
      className: '',
      html: '<div class="coach-pin">★ Coach PT ₱1.3k</div>',
      iconAnchor: [45, 14]
    });
    L.marker([14.5515, 121.0475], { icon: coachIcon }).addTo(map).on('click', () => {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_COACH' }));
      }
    });

    // Tournament Meet Marker (14.5538, 121.0350)
    const meetIcon = L.divIcon({
      className: '',
      html: '<div class="meet-pin">🏆 Open Meet ₱500</div>',
      iconAnchor: [50, 14]
    });
    L.marker([14.5538, 121.0350], { icon: meetIcon }).addTo(map).on('click', () => {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_MEET' }));
      }
    });

    // Listen to messages from React Native
    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'RECENTER') {
          map.flyTo([userLat, userLng], 15, { animate: true, duration: 1.2 });
        } else if (data.type === 'ZOOM_IN') {
          map.zoomIn();
        } else if (data.type === 'ZOOM_OUT') {
          map.zoomOut();
        }
      } catch (e) {}
    });
  </script>
</body>
</html>
  `.trim();
}
