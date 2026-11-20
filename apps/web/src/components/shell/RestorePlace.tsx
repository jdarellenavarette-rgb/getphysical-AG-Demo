"use client";

import { useEffect } from "react";
import { restoreScroll } from "../../lib/reload";

/** After a save reloads the page, scrolls back to where the person was. Renders nothing. */
export function RestorePlace() {
  useEffect(() => {
    restoreScroll();
  }, []);
  return null;
}
