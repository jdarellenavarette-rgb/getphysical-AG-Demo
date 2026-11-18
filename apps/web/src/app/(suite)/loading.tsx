import { Skeleton } from "../../components/ui/states";

/** Skeleton shaped like a section page: heading, stat row, table. */
export default function SuiteLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="mb-6 h-9 w-56" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}
