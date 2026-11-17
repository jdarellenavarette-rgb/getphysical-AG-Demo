import "server-only";
import { facilityProductSchema, type FacilityProduct } from "sodia-core";
import { z } from "zod";
import { createServerSupabase } from "../supabase/server";

export interface SellingSettings {
  sellsPasses: boolean;
  sellsMemberships: boolean;
  graceDays: number;
}

const PRODUCT_COLUMNS =
  "id, facility_id, name, description, kind, price_php, duration_days, is_active, sort_order, legacy_sku";

/** Every product the venue has defined, including ones switched off (staff only see those). */
export async function loadProducts(facilityId: string): Promise<FacilityProduct[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("facility_products")
    .select(PRODUCT_COLUMNS)
    .eq("facility_id", facilityId)
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error("Could not load your plans.", { cause: error });
  return z.array(facilityProductSchema).parse(data);
}

export async function loadSellingSettings(facilityId: string): Promise<SellingSettings> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("facilities")
    .select("sells_passes, sells_memberships, membership_grace_days")
    .eq("id", facilityId)
    .single();
  if (error) throw new Error("Could not load your selling settings.", { cause: error });
  return {
    sellsPasses: data.sells_passes,
    sellsMemberships: data.sells_memberships,
    graceDays: data.membership_grace_days,
  };
}
