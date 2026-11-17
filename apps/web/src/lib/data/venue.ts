import "server-only";
import { createServerSupabase } from "../supabase/server";

export interface VenueProfile {
  name: string;
  address: string;
  hours: string;
  maxCapacity: number | null;
  dayPassPricePhp: number | null;
  monthlyPricePhp: number | null;
  courtHourlyPricePhp: number | null;
  amenities: string[];
}

export async function loadVenueProfile(facilityId: string): Promise<VenueProfile> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("facilities")
    .select(
      "name, address, hours, max_capacity, day_pass_price_php, monthly_sub_price_php, court_hourly_price_php, amenities",
    )
    .eq("id", facilityId)
    .single();
  if (error) throw new Error("Could not load the venue profile.", { cause: error });
  return {
    name: data.name,
    address: data.address,
    hours: data.hours ?? "",
    maxCapacity: data.max_capacity,
    dayPassPricePhp: data.day_pass_price_php,
    monthlyPricePhp: data.monthly_sub_price_php,
    courtHourlyPricePhp: data.court_hourly_price_php,
    amenities: data.amenities ?? [],
  };
}
