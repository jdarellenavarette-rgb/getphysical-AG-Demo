"use client";

import { useRefreshAfterAction } from "../../../../lib/use-server-form";
import { useMemo, useState, useTransition, type ChangeEvent } from "react";
import { FileUp, Upload } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Label, Select } from "../../../../components/ui/input";
import { Notice } from "../../../../components/ui/states";
import { Table, Td, Th } from "../../../../components/ui/table";
import { parseCsv, parseSheetDate } from "../../../../lib/csv";
import { importMembers, type ImportRow } from "../../../actions/imports";

type Field = "full_name" | "email" | "phone" | "plan_name" | "expires_on" | "notes";

const FIELDS: { id: Field; label: string; required?: boolean; guess: RegExp }[] = [
  { id: "full_name", label: "Full name", required: true, guess: /^(full[ _]?name|name|member)/i },
  { id: "email", label: "Email", guess: /e-?mail/i },
  { id: "phone", label: "Mobile number", guess: /phone|mobile|contact|cell/i },
  { id: "plan_name", label: "Plan or membership", guess: /plan|membership|package|type/i },
  { id: "expires_on", label: "Expiry date", guess: /expir|valid|end|until/i },
  { id: "notes", label: "Notes", guess: /note|remark|comment/i },
];

const MAX_ROWS = 2000;
const SAMPLE = "Full name,Email,Mobile,Plan,Expiry\nMaria Santos,maria@example.com,09171234567,Monthly,2027-01-31";

interface Reviewed {
  ready: ImportRow[];
  problems: { line: number; reason: string }[];
}

function review(body: string[][], mapping: Record<Field, number>): Reviewed {
  const ready: ImportRow[] = [];
  const problems: Reviewed["problems"] = [];
  body.forEach((cells, index) => {
    const pick = (field: Field) => (mapping[field] >= 0 ? (cells[mapping[field]] ?? "") : "");
    const line = index + 2;
    const name = pick("full_name");
    if (!name) return void problems.push({ line, reason: "No name" });
    if (name.length > 120) return void problems.push({ line, reason: "Name is too long" });
    const rawDate = pick("expires_on");
    const date = rawDate ? parseSheetDate(rawDate) : null;
    if (rawDate && !date) return void problems.push({ line, reason: `Date "${rawDate}" isn't readable` });
    const email = pick("email");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return void problems.push({ line, reason: `Email "${email}" isn't valid` });
    }
    ready.push({
      full_name: name,
      email: email || null,
      phone: pick("phone").slice(0, 32) || null,
      plan_name: pick("plan_name").slice(0, 80) || null,
      expires_on: date,
      notes: pick("notes").slice(0, 500) || null,
    });
  });
  return { ready, problems };
}

/** Three steps: bring in a spreadsheet, say which column is which, check the result, import. */
export function ImportWizard() {
  const refresh = useRefreshAfterAction();
  const [text, setText] = useState("");
  const [table, setTable] = useState<string[][] | null>(null);
  const [mapping, setMapping] = useState<Record<Field, number> | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const header = table?.[0] ?? [];
  const body = useMemo(() => table?.slice(1) ?? [], [table]);
  const reviewed = useMemo(() => (mapping ? review(body, mapping) : null), [body, mapping]);

  const read = (source: string) => {
    const rows = parseCsv(source);
    if (rows.length < 2) {
      setNotice({ ok: false, message: "That needs a header row and at least one member row." });
      return;
    }
    if (rows.length - 1 > MAX_ROWS) {
      setNotice({ ok: false, message: `That has ${rows.length - 1} rows. Import up to ${MAX_ROWS} at a time.` });
      return;
    }
    setNotice(null);
    setTable(rows);
    const first = rows[0] ?? [];
    setMapping(
      Object.fromEntries(FIELDS.map((f) => [f.id, first.findIndex((cell) => f.guess.test(cell))])) as Record<
        Field,
        number
      >,
    );
  };

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      setNotice({ ok: false, message: "That file is larger than 2 MB. Split it and import in parts." });
      return;
    }
    const content = await file.text();
    setText(content);
    read(content);
  };

  const startOver = () => {
    setTable(null);
    setMapping(null);
    setText("");
  };

  const submit = () => {
    if (!reviewed || reviewed.ready.length === 0) return;
    startTransition(async () => {
      const outcome = await importMembers(reviewed.ready);
      setNotice(outcome);
      if (outcome.ok) {
        startOver();
        refresh();
      }
    });
  };

  return (
    <div className="grid gap-5">
      {notice && (
        <Notice tone={notice.ok ? "success" : "danger"} role={notice.ok ? "status" : "alert"}>
          {notice.message}
        </Notice>
      )}

      {!table || !mapping || !reviewed ? (
        <>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Step 1 of 3.</span> Export your member list as CSV from
            Excel or Google Sheets, with a header row. Then choose the file, or paste its contents.
          </p>
          <Label>
            CSV file
            <input
              type="file"
              accept=".csv,text/csv,text/plain"
              onChange={onFile}
              className="block w-full text-sm file:mr-4 file:h-11 file:cursor-pointer file:rounded-xl file:border file:border-border file:bg-card file:px-4 file:text-sm file:font-semibold file:text-foreground"
            />
          </Label>
          <Label>
            Or paste rows here
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={6}
              placeholder={SAMPLE}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground"
            />
          </Label>
          <div>
            <Button onClick={() => read(text)} disabled={!text.trim()}>
              <FileUp size={16} aria-hidden />
              Read rows
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Step 2 of 3.</span> Check which column holds what. Columns
            you leave as &quot;Not in my file&quot; are skipped.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FIELDS.map((field) => (
              <Label key={field.id}>
                {field.label}
                {field.required ? " (needed)" : ""}
                <Select
                  value={mapping[field.id]}
                  onChange={(event) => setMapping({ ...mapping, [field.id]: Number(event.target.value) })}
                >
                  <option value={-1}>Not in my file</option>
                  {header.map((cell, index) => (
                    <option key={index} value={index}>
                      {cell || `Column ${index + 1}`}
                    </option>
                  ))}
                </Select>
              </Label>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Step 3 of 3.</span> Review, then import. Dates are read as
            2027-01-31 or 01/31/2027 (month first).
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge tone="success">{reviewed.ready.length} ready to import</Badge>
            {reviewed.problems.length > 0 && <Badge tone="warning">{reviewed.problems.length} will be skipped</Badge>}
          </div>
          {reviewed.problems.length > 0 && (
            <ul className="grid gap-1 text-sm text-muted-foreground">
              {reviewed.problems.slice(0, 5).map((problem) => (
                <li key={problem.line}>
                  Row {problem.line}: {problem.reason}
                </li>
              ))}
              {reviewed.problems.length > 5 && <li>…and {reviewed.problems.length - 5} more.</li>}
            </ul>
          )}
          {reviewed.ready.length > 0 && (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Mobile</Th>
                  <Th>Plan</Th>
                  <Th>Expires</Th>
                </tr>
              </thead>
              <tbody>
                {reviewed.ready.slice(0, 6).map((row, index) => (
                  <tr key={index}>
                    <Td className="font-semibold">{row.full_name}</Td>
                    <Td>{row.email ?? "—"}</Td>
                    <Td>{row.phone ?? "—"}</Td>
                    <Td>{row.plan_name ?? "—"}</Td>
                    <Td>{row.expires_on ?? "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {reviewed.ready.length > 6 && (
            <p className="text-sm text-muted-foreground">Showing the first 6 of {reviewed.ready.length}.</p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button onClick={submit} disabled={pending || reviewed.ready.length === 0}>
              <Upload size={16} aria-hidden />
              {pending
                ? "Importing…"
                : `Import ${reviewed.ready.length} ${reviewed.ready.length === 1 ? "record" : "records"}`}
            </Button>
            <Button variant="ghost" onClick={startOver} disabled={pending}>
              Start over
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
