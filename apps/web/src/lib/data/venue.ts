import "server-only";
import { createServerSupabase } from "../supabase/server";

export interface VenueProfile {
  name: string;
  address: string;
  hours: string;
  maxCapacity: number | null;
  courtHourlyPricePhp: number | null;
  amenities: string[];
}

export async function loadVenueProfile(facilityId: string): Promise<VenueProfile> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("facilities")
    .select("name, address, hours, max_capacity, court_hourly_price_php, amenities")
    .eq("id", facilityId)
    .single();
  if (error) throw new Error("Could not load the venue profile.", { cause: error });
  return {
    name: data.name,
    address: data.address,
    hours: data.hours ?? "",
    maxCapacity: data.max_capacity,
    courtHourlyPricePhp: data.court_hourly_price_php,
    amenities: data.amenities ?? [],
  };
}
