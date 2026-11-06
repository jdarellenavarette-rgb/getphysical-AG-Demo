import React from 'react';
import { TurnstilePanel } from './TurnstilePanel';
import { PosTerminal } from './PosTerminal';

/** Front desk: turnstile monitor + bifurcated POS (each a client leaf). */
export function DailyDash() {
  return (
    <div className="gp-grid-auto-wide">
      <TurnstilePanel />
      <PosTerminal />
    </div>
  );
}
