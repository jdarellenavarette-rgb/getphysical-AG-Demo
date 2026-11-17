import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import type { JoinCode } from "../../../lib/data/join-code";

/** The venue's own code, for a poster or the front desk screen. Drawn as a grid so it prints cleanly. */
export function JoinCodeCard({ code, isClub, venueName }: { code: JoinCode; isClub: boolean; venueName: string }) {
  const size = code.modules.length;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isClub ? "Join code" : "Venue code"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-5">
        <div
          role="img"
          aria-label={`QR code for ${venueName}`}
          className="grid shrink-0 bg-white p-3"
          style={{ gridTemplateColumns: `repeat(${size}, 5px)`, gridAutoRows: "5px" }}
        >
          {code.modules.flatMap((row, y) =>
            row.map((dark, x) => <span key={`${y}-${x}`} className={dark ? "bg-black" : "bg-white"} />),
          )}
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          {isClub
            ? `People scan this in the Sodia app to join ${venueName}. They appear in the list below straight away.`
            : `People scan this in the Sodia app to open ${venueName} and buy a pass. They appear in the list below once they have one.`}
        </p>
      </CardContent>
    </Card>
  );
}
