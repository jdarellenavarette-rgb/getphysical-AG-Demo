import type { FacilityRow } from "sodia-core";

export interface FacilityPassOption {
  id: string;
  title: string;
  subtitle: string;
  pricePhp: number;
  billingKind: "one_time_pass" | "recurring_subscription";
  splitNote?: string;
}

/** Registry A (commercial gym) passes vs Registry B (court club) bookings. */
export function passOptionsFor(facility: FacilityRow): FacilityPassOption[] {
  if (facility.registry === "A") {
    return [
      { id: "pass_day", title: "All-Access Day Pass", subtitle: "Single-day turnstile entry • Free lockers & sauna", pricePhp: facility.day_pass_price_php ?? 250, billingKind: "one_time_pass" },
      { id: "pass_pack10", title: "10-Session Punch Pack", subtitle: "Valid for 60 days • Save ₱300 vs daily drop-ins", pricePhp: 2200, billingKind: "one_time_pass" },
      { id: "pass_vip_monthly", title: "VIP Monthly All-Access", subtitle: "Unlimited 24/7 entry • 2 guest passes/month", pricePhp: facility.monthly_sub_price_php ?? 1500, billingKind: "recurring_subscription" },
    ];
  }
  return [
    { id: "court_1hr", title: "1-Hour Court Reservation", subtitle: "Pickleball / Multi-court • Free loaner paddles", pricePhp: facility.court_hourly_price_php ?? 200, billingKind: "one_time_pass", splitNote: "Includes court maintenance fee" },
    { id: "court_ladder", title: "Open Play Ladder Entry", subtitle: "2 hours rotating King-of-the-court • DUPR rated", pricePhp: 150, billingKind: "one_time_pass" },
    { id: "court_tournament", title: "Sunset Open Tournament Pass", subtitle: "Official bracket roster entry • Prize pool eligible", pricePhp: 500, billingKind: "one_time_pass", splitNote: "Direct bracket prize pool escrow" },
  ];
}

export function amenitiesFor(facility: FacilityRow): readonly string[] {
  return facility.registry === "A"
    ? ["Olympic Barbells", "Turf Sprint Track", "Recovery Sauna", "Showers & Lockers", "Specialty Cafe"]
    : ["4 Regulation Courts", "Pro Lighting", "Equipment Rental", "Player Lounge", "Covered Facility"];
}
