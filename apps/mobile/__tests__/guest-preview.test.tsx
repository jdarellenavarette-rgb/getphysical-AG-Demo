/**
 * Offline preview (no Supabase config): a guest still gets the sample venues and
 * sample plans, an empty wallet, and a sign-in prompt where an account is needed.
 * Renders the app exactly as Expo Go starts it: app/index.tsx → AuthGate → App.
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Page from "../app/index";

const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

jest.setTimeout(30000);

it("keeps the guest preview working: sample venues, sample plans, empty wallet, sign-in prompts", async () => {
  render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <Page />
    </SafeAreaProvider>,
  );
  fireEvent.press(await screen.findByText("Continue as guest", {}, { timeout: 10000 }));
  await screen.findByText("Your feed is empty", {}, { timeout: 10000 });

  // Venues: the bundled samples, each opening a sheet with sample plans.
  fireEvent.press(screen.getByLabelText("Venues"));
  fireEvent.press(await screen.findByLabelText("Metro Core Arena. See plans"));
  expect(await screen.findByText("CHOOSE A PLAN")).toBeTruthy();
  expect(screen.getByText("All-Access Day Pass")).toBeTruthy();
  expect(screen.getByText("Proceed to Checkout")).toBeTruthy();
  fireEvent.press(screen.getByText("Proceed to Checkout"));
  expect(await screen.findByText("Sign In to Buy")).toBeTruthy();
  fireEvent.press(screen.getByText("Close"));

  // Wallet: nothing invented, one way forward.
  fireEvent.press(screen.getByLabelText("Wallet"));
  expect(await screen.findByText("No passes yet")).toBeTruthy();

  // Settings → My venues asks a guest to sign in.
  fireEvent.press(screen.getByLabelText("Settings"));
  expect(await screen.findByText("MEMBERSHIP")).toBeTruthy();
  expect(screen.queryByText("Give this to the front desk to be added as a member.")).toBeNull();
  fireEvent.press(screen.getByText("My venues"));
  expect(await screen.findByText("Sign in to see your venues")).toBeTruthy();
});
