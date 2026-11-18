import { FlaskConical } from "lucide-react";

/** Shown on every screen not yet connected to the facility's own data, so sample figures are never mistaken for real ones. */
export function SampleDataNotice({ area, facilityName }: { area: string; facilityName: string }) {
  return (
    <div role="note" className="mb-4 flex items-start gap-3 rounded-xl bg-warning-muted px-4 py-3 text-sm text-warning">
      <FlaskConical size={16} className="mt-0.5 shrink-0" aria-hidden />
      <span>
        <strong>Sample data.</strong> {area} is not connected to {facilityName} yet. The figures and names below are
        examples, and nothing you do here is saved, charged or sent.
      </span>
    </div>
  );
}
