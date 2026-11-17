import { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initTheme } from "../src/theme/theme";

export default function RootLayout() {
  // Restore the saved appearance and follow the phone's light/dark setting.
  useEffect(() => initTheme(), []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#000000" } }}>
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaProvider>
  );
}
