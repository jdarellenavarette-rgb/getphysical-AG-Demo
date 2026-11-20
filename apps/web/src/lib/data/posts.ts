import "server-only";
import { createServerSupabase } from "../supabase/server";

export interface BusinessPost {
  id: string;
  body: string;
  status: "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  publishAt: string;
  /** Visible to followers and members right now. */
  isLive: boolean;
  linkLabel: string | null;
}

export interface PostDesk {
  posts: BusinessPost[];
  audience: { followers: number; members: number; reach: number };
  /** Things a post can point people to. */
  links: { events: { id: string; title: string }[]; plans: { id: string; name: string }[] };
}

/** Everything the Posts page needs: the business's posts, who they reach, and what a post can link to. */
export async function loadPostDesk(facilityId: string): Promise<PostDesk> {
  const supabase = await createServerSupabase();
  const now = new Date().toISOString();
  const [posts, audience, events, plans] = await Promise.all([
    supabase
      .from("business_posts")
      .select("id, body, status, publish_at, events(title), facility_products(name)")
      .eq("facility_id", facilityId)
      .order("publish_at", { ascending: false })
      .limit(100),
    supabase.rpc("business_audience", { p_facility_id: facilityId }),
    supabase
      .from("events")
      .select("id, title")
      .eq("facility_id", facilityId)
      .eq("status", "PUBLISHED")
      .gt("starts_at", now)
      .order("starts_at")
      .limit(50),
    supabase
      .from("facility_products")
      .select("id, name")
      .eq("facility_id", facilityId)
      .eq("is_active", true)
      .order("sort_order")
      .limit(50),
  ]);
  const error = posts.error ?? audience.error ?? events.error ?? plans.error;
  if (error) throw new Error("Could not load your posts.", { cause: error });

  const reach = audience.data?.[0];
  return {
    posts: (posts.data ?? []).map((row) => ({
      id: row.id,
      body: row.body,
      status: row.status,
      publishAt: row.publish_at,
      isLive: row.status === "PUBLISHED" || (row.status === "SCHEDULED" && row.publish_at <= now),
      linkLabel: row.events?.title ?? row.facility_products?.name ?? null,
    })),
    audience: { followers: reach?.followers ?? 0, members: reach?.members ?? 0, reach: reach?.reach ?? 0 },
    links: { events: events.data ?? [], plans: plans.data ?? [] },
  };
}
