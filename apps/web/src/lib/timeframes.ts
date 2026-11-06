export const TIMEFRAMES = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'Q4 2026' },
] as const;

export type TimeframeId = (typeof TIMEFRAMES)[number]['id'];

export function parseTimeframe(value: string | string[] | undefined): TimeframeId {
  const v = Array.isArray(value) ? value[0] : value;
  return TIMEFRAMES.find((t) => t.id === v)?.id ?? 'today';
}

export function timeframeLabel(id: TimeframeId): string {
  return TIMEFRAMES.find((t) => t.id === id)?.label ?? 'Today';
}
