import { bracketProgress, type Bracket, type BracketMatch } from "sodia-core";
import { Trophy } from "lucide-react";
import { ActionButton } from "../../../../components/ui/action-button";
import { ActionForm } from "../../../../components/ui/action-form";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input, Label, Select } from "../../../../components/ui/input";
import { cn } from "../../../../lib/utils";
import { clearBracket, drawBracket, saveMatchScore } from "../../../actions/brackets";

interface BracketCardProps {
  eventId: string;
  bracket: Bracket | null;
  categories: string[];
  signedUp: number;
  /** The event is cancelled: the bracket can be read but not changed. */
  locked: boolean;
}

function Side({
  name,
  score,
  won,
  decided,
}: {
  name: string | null;
  score: number | null;
  won: boolean;
  decided: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={cn(
          "min-w-0 truncate",
          name === null
            ? "text-muted-foreground"
            : won
              ? "font-bold"
              : decided
                ? "text-muted-foreground"
                : "font-medium",
        )}
      >
        {name ?? "To be decided"}
      </span>
      {score !== null && <span className={cn("tabular-nums", won && "font-bold")}>{score}</span>}
    </div>
  );
}

function Match({
  eventId,
  match,
  number,
  canScore,
}: {
  eventId: string;
  match: BracketMatch;
  number: number;
  canScore: boolean;
}) {
  const decided = match.winner !== null;
  return (
    <li className="rounded-xl border border-border p-3">
      <p className="mb-2 flex items-center justify-between gap-2 text-sm text-muted-foreground">
        Match {number}
        {match.bye ? <Badge>Bye</Badge> : decided ? <Badge tone="success">Played</Badge> : null}
      </p>
      <div className="grid gap-1.5">
        <Side name={match.a?.name ?? null} score={match.scoreA} won={match.winner === "a"} decided={decided} />
        <Side
          name={match.bye ? "No opponent" : (match.b?.name ?? null)}
          score={match.scoreB}
          won={match.winner === "b"}
          decided={decided}
        />
      </div>
      {canScore && !match.bye && match.a && match.b && (
        <div className="mt-3 border-t border-border pt-3">
          <ActionForm
            action={saveMatchScore.bind(null, eventId, match.id)}
            submitLabel={decided ? "Correct" : "Save result"}
            pendingLabel="Saving…"
            keepValues
          >
            <Label className="w-28">
              <span className="truncate">{match.a.name}</span>
              <Input
                name="scoreA"
                type="number"
                min={0}
                max={999}
                inputMode="numeric"
                required
                defaultValue={match.scoreA ?? ""}
              />
            </Label>
            <Label className="w-28">
              <span className="truncate">{match.b.name}</span>
              <Input
                name="scoreB"
                type="number"
                min={0}
                max={999}
                inputMode="numeric"
                required
                defaultValue={match.scoreB ?? ""}
              />
            </Label>
          </ActionForm>
        </div>
      )}
    </li>
  );
}

/** The draw and live scoring. Results entered here are what people following the event see. */
export function BracketCard({ eventId, bracket, categories, signedUp, locked }: BracketCardProps) {
  if (!bracket) {
    if (locked) return null;
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Bracket</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <p className="text-sm text-muted-foreground">
            Draw a single-elimination bracket from the people signed up. The first to sign up is the top seed; when the
            numbers are uneven, the top seeds get a bye in the first round.
          </p>
          {signedUp < 2 ? (
            <p className="text-sm font-medium">At least two people need to sign up before you can draw.</p>
          ) : (
            <ActionForm
              action={drawBracket.bind(null, eventId)}
              submitLabel="Draw bracket"
              pendingLabel="Drawing…"
              icon={<Trophy size={16} aria-hidden />}
            >
              {categories.length > 0 && (
                <Label className="min-w-56">
                  Who is in the draw
                  <Select name="category" defaultValue="">
                    <option value="">Everyone signed up</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category} only
                      </option>
                    ))}
                  </Select>
                </Label>
              )}
            </ActionForm>
          )}
        </CardContent>
      </Card>
    );
  }

  const progress = bracketProgress(bracket);
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Bracket{bracket.category ? `: ${bracket.category}` : ""}</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={bracket.champion ? "success" : "neutral"}>
            {bracket.champion ? "Finished" : `${progress.played} of ${progress.total} matches played`}
          </Badge>
          {!locked && (
            <ActionButton
              action={clearBracket.bind(null, eventId)}
              pendingLabel="Clearing…"
              variant="ghost"
              confirm={{ question: "Clear the bracket and every result in it?", yes: "Yes, clear it" }}
            >
              Clear and redraw
            </ActionButton>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        {bracket.champion && (
          <p className="flex items-center gap-2 rounded-xl bg-muted p-4 text-lg font-bold">
            <Trophy size={20} aria-hidden />
            Winner: {bracket.champion.name}
          </p>
        )}
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4">
            {bracket.rounds.map((round) => (
              <section key={round.name} aria-label={round.name} className="w-64 shrink-0">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">{round.name}</h3>
                <ol className="grid gap-3">
                  {round.matches.map((match, index) => (
                    <Match key={match.id} eventId={eventId} match={match} number={index + 1} canScore={!locked} />
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
