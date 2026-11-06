import { useCallback, useEffect, useRef, useState } from "react";
import { haptics } from "../../../lib/haptics";

export const DEFAULT_REST_SECONDS = 90;

/**
 * Wall-clock rest timer (survives JS stalls / backgrounding because it is
 * derived from an end timestamp, not decremented per tick).
 */
export function useRestTimer() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [totalMs, setTotalMs] = useState(DEFAULT_REST_SECONDS * 1000);
  const [now, setNow] = useState(() => Date.now());
  const firedRef = useRef(false);

  useEffect(() => {
    if (endsAt === null) return undefined;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [endsAt]);

  const remainingMs = endsAt === null ? 0 : Math.max(0, endsAt - now);

  useEffect(() => {
    if (endsAt !== null && remainingMs === 0 && !firedRef.current) {
      firedRef.current = true;
      haptics.success();
      setEndsAt(null);
    }
  }, [endsAt, remainingMs]);

  const start = useCallback((seconds = DEFAULT_REST_SECONDS) => {
    firedRef.current = false;
    const ms = seconds * 1000;
    setTotalMs(ms);
    setNow(Date.now());
    setEndsAt(Date.now() + ms);
  }, []);

  const adjust = useCallback((deltaSeconds: number) => {
    haptics.selection();
    setEndsAt((prev) => {
      if (prev === null) return prev;
      const next = Math.max(Date.now() + 1000, prev + deltaSeconds * 1000);
      setTotalMs((t) => Math.max(t + deltaSeconds * 1000, next - Date.now()));
      return next;
    });
  }, []);

  const skip = useCallback(() => {
    haptics.light();
    firedRef.current = true;
    setEndsAt(null);
  }, []);

  return { isResting: endsAt !== null, remainingMs, totalMs, endsAt, start, adjust, skip };
}
