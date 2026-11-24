"use server";

import { bracketSchema, generateBracket, recordResult, type Bracket } from "sodia-core";
import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { loadEventBracket, loadEventRoster } from "../../lib/data/events";
import { describeDbError, type ActionResult, type FormState } from "../../lib/form-state";
import { createServerSupabase } from "../../lib/supabase/server";

const eventId = z.string().uuid();

const BRACKET_ERRORS: Record<string, string> = {
  NOT_ENOUGH_ENTRANTS: "A bracket needs at least two people signed up.",
  TOO_MANY_ENTRANTS: "A bracket holds up to 128 entrants. Draw one per category instead.",
  MATCH_NOT_FOUND: "That match is no longer in the bracket. Reload the page.",
  MATCH_IS_A_BYE: "That match was a bye; there is no score to record.",
  MATCH_NOT_READY: "Both sides of that match are not known yet.",
  INVALID_SCORE: "Scores must be whole numbers, zero or more.",
  NO_WINNER: "A match can't end level. Enter the score after any tie-break.",
  NEXT_MATCH_PLAYED: "The next match has already been played, so this result can't change.",
};

async function saveBracket(facilityId: string, id: string, bracket: Bracket | null): Promise<string | null> {
  const supabase = await createServerSupabase();
  // The draw is checked against the shared contract before it is stored.
  const value = bracket === null ? null : bracketSchema.parse(bracket);
  const { data, error } = await supabase
    .from("events")
    .update({ bracket: value })
    .eq("id", id)
    .eq("facility_id", facilityId)
    .select("id");
  if (error) return describeDbError(error, {}, "We couldn't save the bracket. Please retry.");
  return data.length === 0 ? "That event could not be found." : null;
}

/** Draw the bracket from the people signed up, in sign-up order (first to sign up is the top seed). */
export async function drawBracket(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const parsedId = eventId.safeParse(id);
  if (!parsedId.success) return { status: "error", message: "That event could not be found." };
  const category = z
    .string()
    .trim()
    .max(60)
    .catch("")
    .parse(formData.get("category") ?? "");
  const { active } = await requireSuiteSession();
  const roster = await loadEventRoster(parsedId.data);
  const entrants = roster
    .filter((person) => person.status === "REGISTERED" && (!category || person.category === category))
    .sort((a, b) => (a.registeredAt ?? "").localeCompare(b.registeredAt ?? ""))
    .map((person) => ({ id: person.userId, name: person.name }));
  let bracket: Bracket;
  try {
    bracket = generateBracket(entrants, category || null);
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    return { status: "form_validation", message: BRACKET_ERRORS[code] ?? "We couldn't draw the bracket." };
  }
  const failure = await saveBracket(active.id, parsedId.data, bracket);
  if (failure) return { status: "error", message: failure };
  return { status: "success", message: `Bracket drawn for ${entrants.length} entrants.` };
}

const scoreSchema = z.object({
  scoreA: z.coerce.number({ message: "Enter both scores" }).int("Scores must be whole numbers").min(0).max(999),
  scoreB: z.coerce.number({ message: "Enter both scores" }).int("Scores must be whole numbers").min(0).max(999),
});

/** Record or correct one match. The winner moves on to the next round. */
export async function saveMatchScore(
  id: string,
  matchId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsedId = eventId.safeParse(id);
  if (!parsedId.success) return { status: "error", message: "That event could not be found." };
  const rawA = formData.get("scoreA");
  const rawB = formData.get("scoreB");
  const scores = scoreSchema.safeParse({
    scoreA: rawA === "" ? undefined : rawA,
    scoreB: rawB === "" ? undefined : rawB,
  });
  if (!scores.success) return { status: "form_validation", message: scores.error.issues[0]?.message };
  const { active } = await requireSuiteSession();
  const current = await loadEventBracket(active.id, parsedId.data);
  if (!current) return { status: "error", message: "This event has no bracket yet." };
  let next: Bracket;
  try {
    next = recordResult(current, matchId, scores.data.scoreA, scores.data.scoreB);
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    return { status: "form_validation", message: BRACKET_ERRORS[code] ?? "We couldn't record that result." };
  }
  const failure = await saveBracket(active.id, parsedId.data, next);
  if (failure) return { status: "error", message: failure };
  return { status: "success", message: next.champion ? `${next.champion.name} wins the event.` : "Result saved." };
}

/** Throw the draw away, to draw again after late sign-ups. Results recorded so far go with it. */
export async function clearBracket(id: string): Promise<ActionResult> {
  const parsedId = eventId.safeParse(id);
  if (!parsedId.success) return { ok: false, message: "That event could not be found." };
  const { active } = await requireSuiteSession();
  const failure = await saveBracket(active.id, parsedId.data, null);
  return failure ? { ok: false, message: failure } : { ok: true, message: "Bracket cleared." };
}
