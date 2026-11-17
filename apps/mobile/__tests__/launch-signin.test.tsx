/**
 * Launch smoke test (Supabase configured, nobody signed in): splash → sign-in screen.
 * Env must be set before the app modules load, hence require() inside the test.
 */
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// What app/_layout.tsx provides on a real device (iPhone-sized metrics).
const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

jest.setTimeout(30000);

it("launches through the splash into the sign-in screen without crashing", async () => {
  process.env.EXPO_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "sb_publishable_test";
  const Page: React.ComponentType = require("../app/index").default;
  render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <Page />
    </SafeAreaProvider>
  );
  expect(await screen.findByText("Welcome back", {}, { timeout: 10000 })).toBeTruthy();
  expect(screen.getByText("Sign in with Google")).toBeTruthy();
  expect(screen.getByText("Sign In with Email")).toBeTruthy();
  expect(screen.getByText("Explore as Guest")).toBeTruthy();
});
