import { describe, expect, it } from "vitest";
import { bracketProgress, bracketSchema, coachPlanDaysSchema, generateBracket, recordResult } from "../src/bracket";

const people = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ id: `p${i + 1}`, name: `Player ${i + 1}` }));

describe("generateBracket", () => {
  it("pairs the top seed with the bottom seed in a full draw", () => {
    const bracket = generateBracket(people(8));
    expect(bracket.rounds.map((round) => round.name)).toEqual(["Quarter-finals", "Semi-finals", "Final"]);
    expect(bracket.rounds[0]!.matches[0]).toMatchObject({ a: { id: "p1" }, b: { id: "p8" }, winner: null });
    expect(bracketProgress(bracket)).toEqual({ played: 0, total: 7 });
  });

  it("gives the top seeds a bye when the draw is not full, and walks them through", () => {
    const bracket = generateBracket(people(5), "Open");
    expect(bracket.category).toBe("Open");
    const first = bracket.rounds[0]!.matches;
    expect(first.filter((match) => match.bye).map((match) => match.a?.id)).toEqual(["p1", "p2", "p3"]);
    expect(first[3]).toMatchObject({ a: { id: "p4" }, b: { id: "p5" }, bye: false });
    // The byes are already sitting in the semi-finals.
    expect(bracket.rounds[1]!.matches[0]).toMatchObject({ a: { id: "p1" }, b: { id: "p2" } });
    expect(bracket.rounds[1]!.matches[1]).toMatchObject({ a: { id: "p3" }, b: null });
    expect(bracketProgress(bracket)).toEqual({ played: 0, total: 4 });
  });

  it("refuses a draw of one, and ignores a person listed twice", () => {
    expect(() => generateBracket(people(1))).toThrow("NOT_ENOUGH_ENTRANTS");
    expect(generateBracket([...people(2), ...people(2)]).rounds).toHaveLength(1);
  });
});

describe("recordResult", () => {
  it("moves the winner on and crowns a champion at the end", () => {
    let bracket = generateBracket(people(4));
    bracket = recordResult(bracket, "r1m1", 21, 15);
    bracket = recordResult(bracket, "r1m2", 9, 21);
    expect(bracket.rounds[1]!.matches[0]).toMatchObject({ a: { id: "p1" }, b: { id: "p3" } });
    expect(bracket.champion).toBeNull();
    bracket = recordResult(bracket, "r2m1", 18, 21);
    expect(bracket.champion).toEqual({ id: "p3", name: "Player 3" });
    expect(bracketProgress(bracket)).toEqual({ played: 3, total: 3 });
    expect(bracketSchema.safeParse(bracket).success).toBe(true);
  });

  it("lets a result be corrected until the next match is played", () => {
    let bracket = generateBracket(people(4));
    bracket = recordResult(bracket, "r1m1", 21, 15);
    bracket = recordResult(bracket, "r1m1", 15, 21);
    expect(bracket.rounds[1]!.matches[0]!.a).toMatchObject({ id: "p4" });
    bracket = recordResult(bracket, "r1m2", 21, 9);
    bracket = recordResult(bracket, "r2m1", 21, 19);
    expect(() => recordResult(bracket, "r1m1", 21, 15)).toThrow("NEXT_MATCH_PLAYED");
  });

  it("refuses a draw, a match that is not ready, a bye and an unknown match", () => {
    const bracket = generateBracket(people(5));
    expect(() => recordResult(bracket, "r1m4", 11, 11)).toThrow("NO_WINNER");
    expect(() => recordResult(bracket, "r2m2", 11, 5)).toThrow("MATCH_NOT_READY");
    expect(() => recordResult(bracket, "r1m1", 11, 5)).toThrow("MATCH_IS_A_BYE");
    expect(() => recordResult(bracket, "r9m9", 11, 5)).toThrow("MATCH_NOT_FOUND");
    expect(() => recordResult(bracket, "r1m4", -1, 5)).toThrow("INVALID_SCORE");
  });

  it("does not change the bracket it was given", () => {
    const bracket = generateBracket(people(2));
    recordResult(bracket, "r1m1", 3, 1);
    expect(bracket.rounds[0]!.matches[0]!.winner).toBeNull();
  });
});

describe("coachPlanDaysSchema", () => {
  it("accepts a week and refuses the same day twice or an empty plan", () => {
    expect(
      coachPlanDaysSchema.safeParse([
        { weekday: 1, focus: "Lower" },
        { weekday: 4, focus: "" },
      ]).success,
    ).toBe(true);
    expect(
      coachPlanDaysSchema.safeParse([
        { weekday: 1, focus: "a" },
        { weekday: 1, focus: "b" },
      ]).success,
    ).toBe(false);
    expect(coachPlanDaysSchema.safeParse([]).success).toBe(false);
  });
});
