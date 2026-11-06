import React, { useEffect, useState } from "react";
import { BackHandler, StatusBar, StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, setQueryOnline } from "../src/lib/queryClient";
import { useEcosystemStore } from "../src/store/ecosystemStore";
import { OverlayHost } from "../src/navigation/OverlayHost";
import { useOverlayStore, overlays } from "../src/navigation/overlayStore";
import { ToastHost } from "../src/feedback/ToastHost";
import { CrmToastBanner } from "../src/components/common/CrmToastBanner";
import { OpeningLoadingScreen } from "../src/components/common/OpeningLoadingScreen";
import { useCrmMessagingStore } from "../src/store/crmMessagingStore";
import { useColors } from "../src/theme/theme";

/** Android back closes the top-most overlay before the router handles it. */
function useOverlayBackHandler(): void {
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => useOverlayStore.getState().closeTop());
    return () => sub.remove();
  }, []);
}

function AppShell() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [isOpening, setIsOpening] = useState(true);
  const initRealtimeSubscription = useCrmMessagingStore((s) => s.initRealtimeSubscription);
  const teardownRealtime = useCrmMessagingStore((s) => s.teardownRealtimeSubscription);
  const isOffline = useEcosystemStore((s) => s.isOffline);
  useOverlayBackHandler();

  // Paused/queued mutations replay when the app comes back online.
  useEffect(() => {
    setQueryOnline(!isOffline);
  }, [isOffline]);

  useEffect(() => {
    initRealtimeSubscription();
    return () => teardownRealtime();
  }, [initRealtimeSubscription, teardownRealtime]);

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 48), backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgScreen } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <OverlayHost />
      <CrmToastBanner
        onPressToast={(threadId) => {
          const { threads } = useCrmMessagingStore.getState();
          const thread = threads.find((t) => t.id === threadId) ?? threads[0] ?? null;
          overlays.open({ kind: "inbox", thread });
        }}
      />
      {isOpening && <OpeningLoadingScreen onFinish={() => setIsOpening(false)} />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <AppShell />
          </BottomSheetModalProvider>
          <ToastHost />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
