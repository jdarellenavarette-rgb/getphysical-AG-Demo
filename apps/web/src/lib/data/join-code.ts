import "server-only";
import { encodeQr } from "sodia-core";
import { z } from "zod";
import { createServerSupabase } from "../supabase/server";

export interface JoinCode {
  /** What the mobile scanner reads. */
  payload: string;
  /** QR modules, true = dark. */
  modules: readonly (readonly boolean[])[];
}

const codeSchema = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{22}$/) });

type QrKind = "FACILITY" | "COACH" | "EVENT";

/** A scannable code for a venue, a coach or an event. Null when the caller may not have one. */
export async function loadQrCode(kind: QrKind, target: string | null): Promise<JoinCode | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc(
    "get_qr_code",
    target ? { p_kind: kind, p_target: target } : { p_kind: kind },
  );
  const parsed = codeSchema.safeParse(data);
  if (error || !parsed.success) return null;
  // The app's own link scheme, so the code works before a public web domain is set up.
  const payload = `sodia://q/${parsed.data.token}`;
  return { payload, modules: encodeQr(payload, { ecc: "M" }).modules };
}

/** The venue's own code. Members scan it in the Sodia app to join a club or open the venue. */
export function loadJoinCode(facilityId: string): Promise<JoinCode | null> {
  return loadQrCode("FACILITY", facilityId);
}
