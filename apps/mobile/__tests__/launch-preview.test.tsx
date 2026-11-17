/**
 * Launch smoke test (no Supabase config): splash → sign-in → "Continue as guest" → empty app.
 * Renders the app exactly as Expo Go starts it: app/index.tsx → AuthGate → App.
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Page from "../app/index";

// What app/_layout.tsx provides on a real device (iPhone-sized metrics).
const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

jest.setTimeout(30000);

it("launches through the splash and sign-in into an empty guest app without crashing", async () => {
  render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <Page />
    </SafeAreaProvider>,
  );
  // Splash runs ~2.5 s, then the sign-in screen offers guest mode.
  fireEvent.press(await screen.findByText("Continue as guest", {}, { timeout: 10000 }));
  // A guest starts with nothing: the feed shows its empty state and no sample persona.
  expect(await screen.findByText("Your feed is empty", {}, { timeout: 10000 })).toBeTruthy();
  expect(screen.queryByText("Continue as guest")).toBeNull();
  expect(screen.queryByText(/Darelle/)).toBeNull();
});
