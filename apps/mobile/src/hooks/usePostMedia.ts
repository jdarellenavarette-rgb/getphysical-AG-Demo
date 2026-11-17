import { useCallback, useState } from "react";
import { Alert, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";

export interface PostMedia {
  uri: string;
  kind: "photo" | "video";
  /** Video length in seconds, when the picker reports it. */
  durationSeconds: number | null;
}

/** Tells the user why nothing was attached; never substitutes placeholder media. */
function explainFailure(title: string, message: string, offerSettings: boolean) {
  Alert.alert(
    title,
    message,
    offerSettings
      ? [
          { text: "Not now", style: "cancel" },
          { text: "Open Settings", onPress: () => void Linking.openSettings() },
        ]
      : undefined,
  );
}

function toMedia(asset: ImagePicker.ImagePickerAsset): PostMedia {
  return {
    uri: asset.uri,
    kind: asset.type === "video" ? "video" : "photo",
    durationSeconds: asset.duration ? Math.round(asset.duration / 1000) : null,
  };
}

/** Camera / library attachment for the composer, with permission handling. */
export function usePostMedia() {
  const [media, setMedia] = useState<PostMedia | null>(null);

  const capture = useCallback(async (mediaTypes: ImagePicker.MediaType[]) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        explainFailure("Camera access is off", "Allow camera access to take photos and videos.", true);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes, quality: 0.8 });
      const asset = result.canceled ? undefined : result.assets[0];
      if (asset) setMedia(toMedia(asset));
    } catch {
      explainFailure("Camera unavailable", "The camera could not be opened on this device. Try your library.", false);
    }
  }, []);

  const takePhoto = useCallback(() => capture(["images"]), [capture]);
  const recordVideo = useCallback(() => capture(["videos"]), [capture]);

  const pickFromLibrary = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images", "videos"], quality: 0.8 });
      const asset = result.canceled ? undefined : result.assets[0];
      if (asset) setMedia(toMedia(asset));
    } catch {
      explainFailure("Library unavailable", "Your photo library could not be opened. Check photo access.", true);
    }
  }, []);

  const clear = useCallback(() => setMedia(null), []);

  return { media, takePhoto, recordVideo, pickFromLibrary, clear };
}

export function formatClipDuration(seconds: number | null): string {
  if (seconds === null) return "";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
