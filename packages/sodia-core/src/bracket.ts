import { z } from "zod";

/**
 * Single-elimination brackets. The whole draw is one JSON document stored on the event, so it is
 * validated here before it is written and whenever it is read. Everything is pure: the same
 * functions run in the Business Suite today and can run in the app.
 */
const slotSchema = z.object({ id: z.string().min(1).max(64), name: z.string().min(1).max(120) });

const matchSchema = z.object({
  id: z.string().regex(/^r\d+m\d+$/),
  a: slotSchema.nullable(),
  b: slotSchema.nullable(),
  scoreA: z.number().int().min(0).max(999).nullable(),
  scoreB: z.number().int().min(0).max(999).nullable(),
  winner: z.enum(["a", "b"]).nullable(),
  /** One side had no opponent and went through without playing. */
  bye: z.boolean().default(false),
});

export const bracketSchema = z.object({
  format: z.literal("SINGLE_ELIMINATION"),
  category: z.string().max(60).nullable(),
  rounds: z
    .array(z.object({ name: z.string().max(40), matches: z.array(matchSchema).min(1) }))
    .min(1)
    .max(8),
  champion: slotSchema.nullable(),
});

export type BracketSlot = z.infer<typeof slotSchema>;
export type BracketMatch = z.infer<typeof matchSchema>;
export type Bracket = z.infer<typeof bracketSchema>;

export const MAX_BRACKET_ENTRANTS = 128;

function roundName(matchesInRound: number): string {
  if (matchesInRound === 1) return "Final";
  if (matchesInRound === 2) return "Semi-finals";
  if (matchesInRound === 4) return "Quarter-finals";
  return `Round of ${matchesInRound * 2}`;
}

function winnerOf(match: BracketMatch): BracketSlot | null {
  return match.winner === "a" ? match.a : match.winner === "b" ? match.b : null;
}

/** Where the winner of a match goes: the match in the next round, and which side of it. */
function nextPlace(index: number): { match: number; side: "a" | "b" } {
  return { match: Math.floor(index / 2), side: index % 2 === 0 ? "a" : "b" };
}

/**
 * Draw a bracket for the entrants in the order given (first is the top seed). When the number is
 * not a power of two, the top seeds get a bye in the first round and go straight through.
 */
export function generateBracket(entrants: BracketSlot[], category: string | null = null): Bracket {
  const unique = [...new Map(entrants.map((entrant) => [entrant.id, entrant])).values()];
  if (unique.length < 2) throw new Error("NOT_ENOUGH_ENTRANTS");
  if (unique.length > MAX_BRACKET_ENTRANTS) throw new Error("TOO_MANY_ENTRANTS");

  const size = 2 ** Math.ceil(Math.log2(unique.length));
  const firstRound = size / 2;
  // Seed i meets seed size-1-i, so byes (the missing bottom seeds) fall to the top seeds.
  const rounds: Bracket["rounds"] = [];
  let matches = firstRound;
  for (let round = 1; matches >= 1; round += 1, matches /= 2) {
    rounds.push({
      name: roundName(matches),
      matches: Array.from({ length: matches }, (_, index) => ({
        id: `r${round}m${index + 1}`,
        a: round === 1 ? (unique[index] ?? null) : null,
        b: round === 1 ? (unique[size - 1 - index] ?? null) : null,
        scoreA: null,
        scoreB: null,
        winner: null,
        bye: false,
      })),
    });
  }

  // Walk the byes through.
  const first = rounds[0]!;
  first.matches.forEach((match, index) => {
    if (match.a && !match.b) {
      match.winner = "a";
      match.bye = true;
      const next = rounds[1]?.matches[nextPlace(index).match];
      if (next) next[nextPlace(index).side] = match.a;
    }
  });
  return bracketSchema.parse({ format: "SINGLE_ELIMINATION", category, rounds, champion: null });
}

/**
 * Record or correct a result. The winner moves into the next round. A result cannot be changed
 * once the match it feeds has been played, because that would undo a game that already happened.
 */
export function recordResult(bracket: Bracket, matchId: string, scoreA: number, scoreB: number): Bracket {
  const next: Bracket = bracketSchema.parse(JSON.parse(JSON.stringify(bracket)));
  const roundIndex = next.rounds.findIndex((round) => round.matches.some((match) => match.id === matchId));
  if (roundIndex < 0) throw new Error("MATCH_NOT_FOUND");
  const round = next.rounds[roundIndex]!;
  const index = round.matches.findIndex((match) => match.id === matchId);
  const match = round.matches[index]!;

  if (match.bye) throw new Error("MATCH_IS_A_BYE");
  if (!match.a || !match.b) throw new Error("MATCH_NOT_READY");
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0)
    throw new Error("INVALID_SCORE");
  if (scoreA === scoreB) throw new Error("NO_WINNER");

  const following = next.rounds[roundIndex + 1]?.matches[nextPlace(index).match];
  if (following?.winner) throw new Error("NEXT_MATCH_PLAYED");

  match.scoreA = scoreA;
  match.scoreB = scoreB;
  match.winner = scoreA > scoreB ? "a" : "b";
  const winner = winnerOf(match);
  if (following) following[nextPlace(index).side] = winner;
  else next.champion = winner;
  return next;
}

/** How far along the bracket is. */
export function bracketProgress(bracket: Bracket): { played: number; total: number } {
  const playable = bracket.rounds.flatMap((round) => round.matches).filter((match) => !match.bye);
  return { played: playable.filter((match) => match.winner).length, total: playable.length };
}

/** What a coach asked a client to do in a week: 1 to 7 days, each with a focus. */
export const coachPlanDaysSchema = z
  .array(z.object({ weekday: z.number().int().min(0).max(6), focus: z.string().trim().max(80) }))
  .min(1)
  .max(7)
  .refine((days) => new Set(days.map((day) => day.weekday)).size === days.length, "Each day can be listed once");

export type CoachPlanDay = z.infer<typeof coachPlanDaysSchema>[number];
