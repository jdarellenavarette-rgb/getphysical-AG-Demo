/**
 * Member ↔ venue flows against a stand-in backend (docs/COORDINATION.md):
 * the wallet reads real passes, the venue sheet sells the venue's own plans,
 * "My venues" lists standing with mute and leave, Discover lists real venues,
 * and Settings shows the username the front desk needs.
 */
import React from "react";
import { Linking } from "react-native";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { generatePassTotp, parseQrScan } from "sodia-core";
import type * as FakeSupabase from "./helpers/fakeSupabase";
import type * as LocationService from "../src/services/locationService";
import { CardsHub } from "../src/components/cards/CardsHub";
import { SettingsMemberCard } from "../src/components/common/SettingsMemberCard";
import { DiscoverView, toCheckoutRequest } from "../src/components/discover/DiscoverView";
import { FacilityDetailSheet, type FacilityPassOption } from "../src/components/discover/FacilityDetailSheet";
import { MyVenuesModal } from "../src/components/profile/MyVenuesModal";
import { useCheckout } from "../src/hooks/useCheckout";
import { useMemberSync } from "../src/hooks/useMemberSync";
import { loadVenueCatalogue, loadVenues } from "../src/services/venueService";
import { GUEST_PROFILE, useEcosystemStore } from "../src/store/ecosystemStore";
import { useMemberStore } from "../src/store/memberStore";

jest.mock("../src/lib/supabase", () => {
  const fake = require("./helpers/fakeSupabase") as typeof FakeSupabase;
  const backend = fake.createFakeBackend();
  const client = fake.createFakeClient(backend);
  return { __backend: backend, getSupabase: () => client, getSessionUserId: async () => backend.userId };
});
jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 1,
    getItemAsync: async (key: string) => store.get(key) ?? null,
    setItemAsync: async (key: string, value: string) => void store.set(key, value),
    deleteItemAsync: async (key: string) => void store.delete(key),
  };
});
jest.mock("../src/services/locationService", () => {
  const actual = jest.requireActual<typeof LocationService>("../src/services/locationService");
  return { ...actual, requestAndFetchUserLocation: async () => actual.DEFAULT_BGC_COORDS };
});

const backend = (jest.requireMock("../src/lib/supabase") as { __backend: FakeSupabase.FakeBackend }).__backend;

const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
const USER = "user-1";
const VENUE = "fac_iron_temple";
const DAY_PASS = "11111111-1111-4111-8111-111111111111";
const MONTHLY = "22222222-2222-4222-8222-222222222222";
const RETIRED = "33333333-3333-4333-8333-333333333333";
const COMP_PASS = "44444444-4444-4444-8444-444444444444";
const PAID_PASS = "55555555-5555-4555-8555-555555555555";
const SECRET = "a1".repeat(32);
const TOMORROW = new Date(Date.now() + 86_400_000).toISOString();

function venueRow(overrides: Record<string, unknown> = {}) {
  return {
    id: VENUE,
    slug: "iron-temple",
    name: "Iron Temple",
    registry: "A",
    registry_type: "COMMERCIAL",
    plan: "FREE",
    category: "Gym",
    address: "12 Rizal Ave",
    lat: 14.55,
    lng: 121.05,
    hours: "6am to 10pm",
    amenities: ["Showers"],
    inside_now_count: 12,
    max_capacity: 80,
    is_open: true,
    day_pass_price_php: 300,
    monthly_sub_price_php: 2500,
    court_hourly_price_php: null,
    rating: 4.6,
    review_count: 31,
    sells_passes: true,
    sells_memberships: true,
    membership_grace_days: 0,
    ...overrides,
  };
}

function product(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    facility_id: VENUE,
    name: "Day Pass",
    description: "",
    kind: "PASS",
    price_php: 300,
    duration_days: 1,
    is_active: true,
    sort_order: 1,
    legacy_sku: null,
    ...overrides,
  };
}

function pass(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    owner_id: USER,
    facility_id: VENUE,
    sku_id: MONTHLY,
    pass_type: "Monthly Unlimited",
    status: "ACTIVE",
    valid_until: TOMORROW,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function membership(overrides: Record<string, unknown> = {}) {
  return {
    facility_id: VENUE,
    facility_name: "Iron Temple",
    slug: "iron-temple",
    logo_url: null,
    registry_type: "COMMERCIAL",
    standing: "ACTIVE",
    pass_valid_until: TOMORROW,
    broadcasts_muted: false,
    joined_at: TOMORROW,
    ...overrides,
  };
}

function signIn() {
  useEcosystemStore.setState({ isGuest: false, profile: { ...GUEST_PROFILE, id: USER, username: "jdoe" } });
}

function Wallet() {
  useMemberSync(true);
  return <CardsHub />;
}

const wrap = (ui: React.ReactElement) => <SafeAreaProvider initialMetrics={METRICS}>{ui}</SafeAreaProvider>;

jest.setTimeout(30000);

beforeEach(() => {
  backend.tables = {
    facilities: [venueRow()],
    facility_products: [
      product(DAY_PASS, { sort_order: 2 }),
      product(MONTHLY, {
        name: "Monthly Unlimited",
        description: "Any time",
        kind: "MEMBERSHIP",
        price_php: 2500,
        duration_days: 30,
        sort_order: 1,
      }),
      product(RETIRED, { name: "Founders Pass", is_active: false, sort_order: 3 }),
    ],
    passes: [],
    payment_orders: [],
    pass_credentials: [],
  };
  backend.rpc = {};
  backend.failing = {};
  backend.userId = USER;
  backend.queries.length = 0;
  backend.rpcCalls.length = 0;
  useEcosystemStore.getState().resetSession();
  useEcosystemStore.setState({ facilities: [], venuesLive: false, isGuest: false });
  useMemberStore.getState().resetMember();
  useMemberStore.setState({ venuesSync: "idle", venuesError: null });
});

describe("backend reads", () => {
  it("never asks for every column", async () => {
    await loadVenues();
    await loadVenueCatalogue(VENUE);
    await useMemberStore.getState().refreshWallet();
    expect(backend.queries.length).toBeGreaterThan(0);
    for (const query of backend.queries) {
      expect(query.columns).not.toContain("*");
      expect(query.columns.length).toBeGreaterThan(0);
    }
  });

  it("lists a venue's active plans in the venue's order", async () => {
    const result = await loadVenueCatalogue(VENUE);
    expect(result.ok && result.data.products.map((p) => p.name)).toEqual(["Monthly Unlimited", "Day Pass"]);
  });

  it("hides a kind of plan the venue has switched off", async () => {
    backend.tables.facilities = [venueRow({ sells_memberships: false })];
    const noMemberships = await loadVenueCatalogue(VENUE);
    expect(noMemberships.ok && noMemberships.data.products.map((p) => p.name)).toEqual(["Day Pass"]);

    backend.tables.facilities = [venueRow({ sells_passes: false })];
    const noPasses = await loadVenueCatalogue(VENUE);
    expect(noPasses.ok && noPasses.data.products.map((p) => p.name)).toEqual(["Monthly Unlimited"]);
  });
});

describe("wallet", () => {
  it("shows the member's real passes, with a desk-granted pass named after its venue", async () => {
    signIn();
    backend.tables.passes = [
      pass(COMP_PASS, { sku_id: "COMP_PASS", pass_type: "COMP_PASS" }),
      pass(PAID_PASS, { status: "REVOKED" }),
    ];
    backend.tables.payment_orders = [
      { user_id: USER, pass_id: PAID_PASS, base_amount_php: 2500, billing_kind: "recurring_subscription" },
    ];
    render(wrap(<Wallet />));

    expect(await screen.findByText("Pass from Iron Temple")).toBeTruthy();
    expect(screen.getByText("Monthly Unlimited")).toBeTruthy();
    expect(screen.getByText("ACTIVE")).toBeTruthy();
    expect(screen.getByText("REVOKED")).toBeTruthy();
    expect(screen.getAllByText(/Iron Temple • Valid until/).length).toBe(1);
    // Nothing from the sample wallet leaks into a signed-in account.
    expect(screen.queryByText(/Metro Core Arena/)).toBeNull();
    expect(useEcosystemStore.getState().purchases[PAID_PASS]?.baseAmountPhp).toBe(2500);
    expect(useEcosystemStore.getState().purchases[COMP_PASS]).toBeUndefined();
  });

  it("shows an entry code the front desk can scan for the real pass id", async () => {
    signIn();
    backend.tables.passes = [pass(PAID_PASS)];
    backend.tables.pass_credentials = [{ pass_id: PAID_PASS, secret: SECRET, rotated_at: null }];
    render(wrap(<Wallet />));

    fireEvent.press(await screen.findByLabelText("Show entry QR for Iron Temple"));
    expect(await screen.findByLabelText("Membership entry QR code")).toBeTruthy();
    const expected = generatePassTotp(PAID_PASS, SECRET);
    expect(screen.getByText(`${expected.code.slice(0, 3)} ${expected.code.slice(3)}`)).toBeTruthy();
    expect(parseQrScan(expected.qrPayload, [])).toEqual({ type: "pass", passId: PAID_PASS, code: expected.code });
    expect(backend.queries.some((q) => q.table === "pass_credentials" && q.filters[0]?.value === PAID_PASS)).toBe(true);
  });

  it("picks up a pass issued after a checkout", async () => {
    signIn();
    render(wrap(<Wallet />));
    expect(await screen.findByText("No passes yet")).toBeTruthy();

    backend.tables.passes = [pass(PAID_PASS)];
    let arrived = false;
    await act(async () => {
      arrived = await useMemberStore.getState().refreshWallet({ quiet: true });
    });
    expect(arrived).toBe(true);
    expect(await screen.findByText("Monthly Unlimited")).toBeTruthy();
  });

  it("offers a retry when the passes can't be loaded", async () => {
    signIn();
    backend.failing.passes = "Failed to fetch";
    render(wrap(<Wallet />));
    expect(await screen.findByText("Couldn't load your passes")).toBeTruthy();

    backend.failing = {};
    fireEvent.press(screen.getByText("Retry"));
    expect(await screen.findByText("No passes yet")).toBeTruthy();
  });
});

describe("venue sheet and checkout", () => {
  async function openSheet(onSelectPass = jest.fn()) {
    const venues = await loadVenues();
    if (!venues.ok) throw new Error("venues did not load");
    render(
      wrap(<FacilityDetailSheet facility={venues.data[0]!} visible onClose={jest.fn()} onSelectPass={onSelectPass} />),
    );
    return { venue: venues.data[0]!, onSelectPass };
  }

  it("sells the venue's own plans and sends the plan id to checkout", async () => {
    const { venue, onSelectPass } = await openSheet();
    expect(await screen.findByText("Monthly Unlimited")).toBeTruthy();
    expect(screen.getByText("1 month • Any time")).toBeTruthy();
    expect(screen.getByText("+ ₱125.00 service fee")).toBeTruthy();
    expect(screen.getByText("+ ₱15.00 service fee")).toBeTruthy();
    expect(screen.queryByText("Founders Pass")).toBeNull();
    expect(screen.queryByText("10-Session Punch Pack")).toBeNull();

    fireEvent.press(screen.getByText("Day Pass"));
    fireEvent.press(screen.getByText("Proceed to Checkout"));
    const option = onSelectPass.mock.calls[0]![0] as FacilityPassOption;
    expect(option.productId).toBe(DAY_PASS);

    const invoke = jest.fn(async (..._args: unknown[]) => ({
      data: {
        orderId: "o1",
        checkoutUrl: "https://pay.example/o1",
        totalPhp: 315,
        serviceFeePhp: 15,
        provider: "MAYA",
      },
      error: null,
    }));
    Object.assign(jest.requireMock("../src/lib/supabase").getSupabase(), { functions: { invoke } });
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    const { result } = renderHook(() => useCheckout(jest.fn()));
    let started = false;
    await act(async () => {
      started = await result.current.confirm(toCheckoutRequest(option, venue));
    });
    expect(started).toBe(true);
    expect(invoke).toHaveBeenCalledWith(
      "payments-checkout",
      expect.objectContaining({ body: expect.objectContaining({ facilityId: VENUE, sku: DAY_PASS }) }),
    );
    expect(openURL).toHaveBeenCalledWith("https://pay.example/o1");
  });

  it.each([
    ["FACILITY_PAYOUTS_NOT_CONFIGURED", "This venue isn't taking payments yet."],
    ["PRODUCT_NOT_AVAILABLE", "This plan isn't available any more."],
    ["SKU_NOT_FOR_SALE", "This plan isn't available any more."],
  ])("explains %s in plain words", async (code, message) => {
    const invoke = jest.fn(async () => ({
      data: null,
      error: new FunctionsHttpError({ json: async () => ({ error: { code } }) }),
    }));
    Object.assign(jest.requireMock("../src/lib/supabase").getSupabase(), { functions: { invoke } });
    const { result } = renderHook(() => useCheckout(jest.fn()));
    await act(async () => {
      await result.current.confirm({
        id: DAY_PASS,
        productId: DAY_PASS,
        title: "Day Pass",
        subtitle: "1 day",
        facilityId: VENUE,
        facilityName: "Iron Temple",
        baseAmountPhp: 300,
        billingKind: "one_time_pass",
      });
    });
    expect(result.current.error).toBe(message);
  });

  it("says so when the venue has nothing on sale", async () => {
    backend.tables.facility_products = [];
    await openSheet();
    expect(await screen.findByText(/isn't selling passes in the app right now/)).toBeTruthy();
    expect(screen.queryByText("Proceed to Checkout")).toBeNull();
  });
});

describe("my venues", () => {
  const open = (onFindVenue = jest.fn()) =>
    render(wrap(<MyVenuesModal visible onClose={jest.fn()} onFindVenue={onFindVenue} />));

  it("lists standing in the shared wording, and lets the member mute and leave", async () => {
    signIn();
    let rows = [
      membership(),
      membership({ facility_id: "fac_b", facility_name: "Court Club", standing: "LAPSED", pass_valid_until: null }),
    ];
    backend.rpc.my_memberships = () => ({ data: rows, error: null });
    backend.rpc.set_venue_broadcasts_muted = () => ({ data: null, error: null });
    backend.rpc.leave_facility = (args) => {
      rows = rows.filter((row) => row.facility_id !== args.p_facility_id);
      return { data: null, error: null };
    };
    open();

    expect(await screen.findByText("Iron Temple")).toBeTruthy();
    expect(screen.getByText("You're a member here.")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText("Your pass has ended. Renew to get back in.")).toBeTruthy();
    expect(screen.getByText("Lapsed")).toBeTruthy();
    expect(screen.getByText(/Pass valid until/)).toBeTruthy();

    fireEvent(screen.getByLabelText("Mute broadcasts from Iron Temple"), "valueChange", true);
    await waitFor(() =>
      expect(backend.rpcCalls).toContainEqual({
        name: "set_venue_broadcasts_muted",
        args: { p_facility_id: VENUE, p_muted: true },
      }),
    );
    expect(useMemberStore.getState().memberships[0]?.broadcasts_muted).toBe(true);

    // Leaving asks first, and says what happens to a paid pass.
    fireEvent.press(screen.getByLabelText("Leave Court Club"));
    expect(screen.getByText(/A pass you paid for stays valid until it ends/)).toBeTruthy();
    expect(backend.rpcCalls.some((call) => call.name === "leave_facility")).toBe(false);
    fireEvent.press(screen.getByText("Leave venue"));
    await waitFor(() =>
      expect(useMemberStore.getState().memberships.map((m) => m.facility_name)).toEqual(["Iron Temple"]),
    );
    await waitFor(() => expect(screen.queryByText("Court Club")).toBeNull());
    expect(backend.rpcCalls).toContainEqual({ name: "leave_facility", args: { p_facility_id: "fac_b" } });
  });

  it("puts the switch back when muting fails", async () => {
    signIn();
    backend.rpc.my_memberships = () => ({ data: [membership()], error: null });
    backend.rpc.set_venue_broadcasts_muted = () => ({ data: null, error: { message: "boom" } });
    open();
    fireEvent(await screen.findByLabelText("Mute broadcasts from Iron Temple"), "valueChange", true);
    expect(await screen.findByText(/Couldn't change broadcasts/)).toBeTruthy();
    expect(useMemberStore.getState().memberships[0]?.broadcasts_muted).toBe(false);
  });

  it("has one way forward when the member has no venues", async () => {
    signIn();
    backend.rpc.my_memberships = () => ({ data: [], error: null });
    const onFindVenue = jest.fn();
    open(onFindVenue);
    expect(await screen.findByText("No venues yet")).toBeTruthy();
    fireEvent.press(screen.getByText("Find a venue"));
    expect(onFindVenue).toHaveBeenCalled();
  });

  it("offers a retry when the list can't be loaded", async () => {
    signIn();
    backend.rpc.my_memberships = () => ({ data: null, error: { message: "Failed to fetch" } });
    open();
    expect(await screen.findByText("Couldn't load your venues")).toBeTruthy();
    backend.rpc.my_memberships = () => ({ data: [membership()], error: null });
    fireEvent.press(screen.getByText("Retry"));
    expect(await screen.findByText("Iron Temple")).toBeTruthy();
  });

  it("asks a guest to sign in and makes no request", async () => {
    useEcosystemStore.setState({ isGuest: true });
    open();
    expect(await screen.findByText("Sign in to see your venues")).toBeTruthy();
    expect(backend.rpcCalls).toEqual([]);
  });
});

describe("discover and settings", () => {
  it("lists real venues, not the bundled samples", async () => {
    backend.tables.facilities = [venueRow(), venueRow({ id: "fac_b", name: "Court Club", lat: null, lng: null })];
    render(wrap(<DiscoverView />));
    expect(await screen.findByText("Iron Temple")).toBeTruthy();
    expect(screen.getByText("Court Club")).toBeTruthy();
    expect(screen.getAllByText("12/80").length).toBe(2);
    expect(screen.queryByText(/Metro Core/)).toBeNull();
  });

  it("offers a retry when venues can't be loaded, and says when there are none", async () => {
    backend.failing.facilities = "Failed to fetch";
    render(wrap(<DiscoverView />));
    expect(await screen.findByText("Couldn't load venues")).toBeTruthy();

    backend.failing = {};
    backend.tables.facilities = [];
    fireEvent.press(screen.getByText("Retry"));
    expect(await screen.findByText("No venues yet")).toBeTruthy();
  });

  it("shows the username to read out at the front desk", () => {
    signIn();
    render(wrap(<SettingsMemberCard onOpenMyVenues={jest.fn()} />));
    expect(screen.getByText("@jdoe")).toBeTruthy();
    expect(screen.getByText("Give this to the front desk to be added as a member.")).toBeTruthy();
    expect(screen.getByText("My venues")).toBeTruthy();
  });
});
