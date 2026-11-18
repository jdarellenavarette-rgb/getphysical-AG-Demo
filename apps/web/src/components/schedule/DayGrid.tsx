import {
  CLOSE_HOUR,
  minutesIntoDay,
  OPEN_HOUR,
  type Booking,
  type DaySchedule,
  type Space,
} from "../../lib/data/schedule";
import { cn } from "../../lib/utils";

const SLOT_MINUTES = 30;
const SLOTS = ((CLOSE_HOUR - OPEN_HOUR) * 60) / SLOT_MINUTES;
const hourLabel = (hour: number) => `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? "AM" : "PM"}`;

interface Block {
  key: string;
  column: number;
  rowStart: number;
  rowEnd: number;
  title: string;
  detail: string;
  /** A slot that is unavailable because the court is in use in its other layout. */
  held: boolean;
}

function rowsFor(booking: Booking, day: string): { rowStart: number; rowEnd: number } | null {
  const open = OPEN_HOUR * 60;
  const start = Math.max(minutesIntoDay(booking.startsAt, day), open);
  const end = Math.min(minutesIntoDay(booking.endsAt, day), CLOSE_HOUR * 60);
  if (end <= start) return null;
  return {
    rowStart: Math.floor((start - open) / SLOT_MINUTES) + 2,
    rowEnd: Math.ceil((end - open) / SLOT_MINUTES) + 2,
  };
}

function buildBlocks(schedule: DaySchedule, spaces: Space[], timeLabel: (iso: string) => string): Block[] {
  const column = new Map(spaces.map((space, index) => [space.id, index + 2]));
  const byId = new Map(spaces.map((space) => [space.id, space]));
  return schedule.bookings.flatMap((booking) => {
    const rows = rowsFor(booking, schedule.day);
    const space = byId.get(booking.spaceId);
    const own = column.get(booking.spaceId);
    if (!rows || !space || !own) return [];
    const range = `${timeLabel(booking.startsAt)} – ${timeLabel(booking.endsAt)}`;
    // Booking the whole court holds its smaller courts, and the reverse.
    const related = spaces.filter((other) => other.parentId === space.id || other.id === space.parentId);
    return [
      { key: booking.id, column: own, ...rows, title: booking.bookedFor, detail: range, held: false },
      ...related.flatMap((other) => {
        const col = column.get(other.id);
        return col
          ? [
              {
                key: `${booking.id}-${other.id}`,
                column: col,
                ...rows,
                title: `In use as ${space.name}`,
                detail: range,
                held: true,
              },
            ]
          : [];
      }),
    ];
  });
}

/** One day across every court, in half-hour rows. The bookings table below carries the same information as text. */
export function DayGrid({ schedule, timeLabel }: { schedule: DaySchedule; timeLabel: (iso: string) => string }) {
  const spaces = schedule.spaces.filter((space) => space.isActive);
  const blocks = buildBlocks(schedule, spaces, timeLabel);
  const hours = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, index) => OPEN_HOUR + index);

  return (
    <div
      role="region"
      aria-label="Day schedule by court, scrolls sideways on small screens"
      tabIndex={0}
      className="relative overflow-x-auto"
    >
      <div
        className="grid min-w-max"
        style={{
          gridTemplateColumns: `4rem repeat(${spaces.length}, minmax(9.5rem, 1fr))`,
          gridTemplateRows: `auto repeat(${SLOTS}, 1.5rem)`,
        }}
      >
        <div className="border-b border-border" style={{ gridColumn: 1, gridRow: 1 }} />
        {spaces.map((space, index) => (
          <div
            key={space.id}
            className={cn("border-b border-l border-border px-3 py-2", space.parentId && "bg-muted/50")}
            style={{ gridColumn: index + 2, gridRow: 1 }}
          >
            <p className="truncate text-sm font-bold">{space.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {space.parentId ? "Part of a shared court" : (space.sport ?? "Court")}
            </p>
          </div>
        ))}

        {hours.map((hour, index) => (
          <div
            key={hour}
            className="border-t border-border pr-2 text-right text-xs text-muted-foreground"
            style={{ gridColumn: 1, gridRow: `${index * 2 + 2} / span 2` }}
          >
            <span className="relative -top-2 bg-card px-1">{hourLabel(hour)}</span>
          </div>
        ))}
        {spaces.flatMap((space, column) =>
          hours.map((hour, index) => (
            <div
              key={`${space.id}-${hour}`}
              aria-hidden
              className="border-t border-l border-border"
              style={{ gridColumn: column + 2, gridRow: `${index * 2 + 2} / span 2` }}
            />
          )),
        )}

        {blocks.map((block) => (
          <div
            key={block.key}
            className={cn(
              "z-[1] m-0.5 overflow-hidden rounded-lg px-2 py-1 text-xs leading-tight",
              block.held
                ? "border border-dashed border-border bg-muted text-muted-foreground"
                : "bg-primary font-semibold text-primary-foreground",
            )}
            style={{ gridColumn: block.column, gridRow: `${block.rowStart} / ${block.rowEnd}` }}
          >
            <p className="truncate">{block.title}</p>
            {block.rowEnd - block.rowStart > 1 && <p className="truncate font-normal">{block.detail}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
