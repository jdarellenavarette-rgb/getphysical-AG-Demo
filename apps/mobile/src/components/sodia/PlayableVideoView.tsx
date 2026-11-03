import React, { useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { Play, Pause, Volume2, VolumeX } from "lucide-react-native";

interface PlayableVideoViewProps {
  videoUrl: string;
  posterUrl?: string;
  autoPlay?: boolean;
  style?: any;
}

export function PlayableVideoView({
  videoUrl,
  posterUrl,
  autoPlay = false,
  style,
}: PlayableVideoViewProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<any>(null);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100%; background:#000; overflow:hidden; display:flex; align-items:center; justify-content:center; }
    video { width:100%; height:100%; object-fit:cover; }
  </style>
</head>
<body>
  <video
    id="reelVideo"
    src="${videoUrl}"
    ${posterUrl ? `poster="${posterUrl}"` : ""}
    playsinline
    webkit-playsinline
    loop
    ${autoPlay ? "autoplay" : ""}
    muted
  ></video>
  <script>
    const v = document.getElementById('reelVideo');
    v.oncanplay = () => {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
    };
    window.addEventListener('message', (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.type === 'PLAY') v.play();
        else if (d.type === 'PAUSE') v.pause();
        else if (d.type === 'MUTE') v.muted = d.muted;
      } catch (err) {}
    });
  </script>
</body>
</html>
  `.trim();

  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    webViewRef.current?.postMessage(JSON.stringify({ type: nextState ? "PLAY" : "PAUSE" }));
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    webViewRef.current?.postMessage(JSON.stringify({ type: "MUTE", muted: nextState }));
  };

  return (
    <View style={[styles.container, style]}>
      {React.createElement(WebView as any, {
        ref: webViewRef,
        source: { html: htmlContent },
        style: styles.webView,
        scrollEnabled: false,
        allowsInlineMediaPlayback: true,
        mediaPlaybackRequiresUserAction: false,
        onMessage: (event: any) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "READY") setIsLoading(false);
          } catch (e) {}
        },
      })}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#E11D48" />
        </View>
      )}

      {/* FLOATING PLAY / PAUSE BUTTON */}
      <TouchableOpacity onPress={togglePlay} style={styles.centerPlayBtn} activeOpacity={0.8}>
        {!isPlaying ? (
          <View style={styles.iconCircle}>
            <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        ) : null}
      </TouchableOpacity>

      {/* FLOATING MUTE / UNMUTE BUTTON */}
      <TouchableOpacity onPress={toggleMute} style={styles.muteBtn} activeOpacity={0.8}>
        {isMuted ? <VolumeX size={15} color="#FFFFFF" /> : <Volume2 size={15} color="#FFFFFF" />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: "100%", position: "relative", backgroundColor: "#000" },
  webView: { flex: 1, backgroundColor: "#000" },
  loadingOverlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  centerPlayBtn: { ...StyleSheet.absoluteFill, justifyContent: "center", alignItems: "center" },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.8)" },
  muteBtn: { position: "absolute", bottom: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
});
