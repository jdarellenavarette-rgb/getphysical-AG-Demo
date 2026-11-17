/**
 * Launch smoke test (no Supabase config): splash → sign-in → "Explore as Guest" → demo app.
 * Renders the app exactly as Expo Go starts it: app/index.tsx → AuthGate → App.
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Page from "../app/index";

// What app/_layout.tsx provides on a real device (iPhone-sized metrics).
const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

jest.setTimeout(30000);

it("launches through the splash and sign-in into the guest demo without crashing", async () => {
  render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <Page />
    </SafeAreaProvider>
  );
  // Splash runs ~2.5 s, then the sign-in screen offers the guest demo.
  fireEvent.press(await screen.findByText("Explore as Guest", {}, { timeout: 10000 }));
  expect(await screen.findAllByText(/Discover|Feed|Sodia|Cards/i, {}, { timeout: 10000 })).not.toHaveLength(0);
  expect(screen.queryByText("Explore as Guest")).toBeNull();
});
