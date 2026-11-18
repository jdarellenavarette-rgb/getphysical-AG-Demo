/** Parse CSV text (commas, quoted fields, doubled quotes, CRLF or LF). Blank lines are dropped. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  row.push(field);
  rows.push(row);
  return rows.map((cells) => cells.map((cell) => cell.trim())).filter((cells) => cells.some((cell) => cell !== ""));
}

/** Read a date typed as 2026-12-31 or 12/31/2026 (month first). Returns YYYY-MM-DD, or null when unreadable. */
export function parseSheetDate(value: string): string | null {
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  const parts = iso ? [iso[1], iso[2], iso[3]] : us ? [us[3], us[1], us[2]] : null;
  if (!parts) return null;
  const [year, month, day] = parts.map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
