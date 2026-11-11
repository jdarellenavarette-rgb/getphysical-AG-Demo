/**
 * Launch smoke test (no Supabase config → offline product preview).
 * Renders the app exactly as Expo Go starts it: app/index.tsx → AuthGate → App.
 */
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// What app/_layout.tsx provides on a real device (iPhone-sized metrics).
const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
import Page from "../app/index";

jest.setTimeout(30000);

it("launches into the offline preview without crashing", async () => {
  render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <Page />
    </SafeAreaProvider>
  );
  expect(await screen.findAllByText(/Sodia|GetPhysical|Discover|Feed/i, {}, { timeout: 10000 })).not.toHaveLength(0);
});
