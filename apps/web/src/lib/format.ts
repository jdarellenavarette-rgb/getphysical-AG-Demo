/** Venues operate in the Philippines; days and times are shown in Manila time for every operator. */
export const SUITE_TIME_ZONE = "Asia/Manila";

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });
const dateTime = new Intl.DateTimeFormat("en-PH", {
  timeZone: SUITE_TIME_ZONE,
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat("en-PH", {
  timeZone: SUITE_TIME_ZONE,
  year: "numeric",
  month: "short",
  day: "numeric",
});
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: SUITE_TIME_ZONE });

export function formatPeso(amount: number): string {
  return peso.format(amount);
}

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTime.format(new Date(iso)) : "—";
}

export function formatDate(iso: string | null | undefined): string {
  return iso ? dateOnly.format(new Date(iso)) : "—";
}

/** Start of the Manila calendar day `daysAgo` days back, as a UTC instant. */
export function startOfSuiteDay(daysAgo = 0, now: Date = new Date()): Date {
  const key = dayKey.format(new Date(now.getTime() - daysAgo * 86_400_000));
  return new Date(`${key}T00:00:00+08:00`);
}

export function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "GP";
}
