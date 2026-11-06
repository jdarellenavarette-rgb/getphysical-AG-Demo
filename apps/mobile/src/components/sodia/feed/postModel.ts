import type { SodiaPostRow } from "sodia-core";

export type PostKind = "status" | "photo" | "reel" | "challenge" | "ad";

export interface PostView {
  readonly kind: PostKind;
  readonly facilityTag: Record<string, string | number> | null;
  readonly stamp: Record<string, string | number | boolean> | null;
}

function asRecord<T>(value: unknown): T | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : null;
}

/** Narrows the post's JSONB columns (facility_tag, stamp) into a typed view model. */
export function toPostView(post: SodiaPostRow): PostView {
  const facilityTag = asRecord<Record<string, string | number>>(post.facility_tag);
  const stamp = asRecord<Record<string, string | number | boolean>>(post.stamp);
  const declared = typeof stamp?.type === "string" ? stamp.type : null;
  const kind: PostKind =
    !post.media_url ? "status" : declared === "reel" || declared === "challenge" || declared === "ad" || declared === "photo" ? declared : "photo";
  return { kind, facilityTag, stamp };
}

export function stampText(view: PostView, key: string, fallback: string): string {
  const v = view.stamp?.[key];
  return v === undefined || v === null ? fallback : String(v);
}
