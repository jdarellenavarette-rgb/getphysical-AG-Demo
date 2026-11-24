"use server";

import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { describeDbError, type FormState } from "../../lib/form-state";
import { formatPeso } from "../../lib/format";
import { createServerSupabase } from "../../lib/supabase/server";

const amount = (label: string) =>
  z.coerce
    .number({ message: `Enter the ${label}` })
    .min(0, `The ${label} can't be negative`)
    .max(1_000_000, `That ${label} is too large`);

/** Start a shift with the cash already in the drawer. */
export async function openShift(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = formData.get("float");
  const parsed = amount("float").safeParse(raw === "" ? undefined : raw);
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("desk_shifts").insert({ facility_id: active.id, opening_float: parsed.data });
  if (error) {
    return {
      status: "error",
      message: describeDbError(
        error,
        { desk_shifts_one_open: "You already have a shift open here." },
        "We couldn't open the shift. Please retry.",
      ),
    };
  }
  return { status: "success", message: `Shift opened with a float of ${formatPeso(parsed.data)}.` };
}

/**
 * Close a shift with the cash counted in the drawer. The expected figure is only worked out and
 * shown after the count is entered, so the count is not steered by it.
 */
export async function closeShift(shiftId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const id = z.string().uuid().safeParse(shiftId);
  if (!id.success) return { status: "error", message: "That shift could not be found." };
  const raw = formData.get("counted");
  const counted = amount("cash counted").safeParse(raw === "" ? undefined : raw);
  if (!counted.success) return { status: "form_validation", message: counted.error.issues[0]?.message };
  const note = z
    .string()
    .trim()
    .max(300)
    .safeParse(formData.get("note") ?? "");
  await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("close_desk_shift", {
    p_shift_id: id.data,
    p_counted_cash: counted.data,
    p_note: note.success ? note.data : "",
  });
  if (error) {
    return {
      status: "error",
      message: describeDbError(
        error,
        { SHIFT_CLOSED: "That shift is already closed." },
        "We couldn't close the shift. Please retry.",
      ),
    };
  }
  const result = z.object({ expected: z.number(), counted: z.number(), difference: z.number() }).safeParse(data);
  if (!result.success) return { status: "success", message: "Shift closed." };
  const { expected, difference } = result.data;
  const verdict =
    difference === 0
      ? "The drawer balances."
      : difference > 0
        ? `Over by ${formatPeso(difference)}.`
        : `Short by ${formatPeso(-difference)}.`;
  return {
    status: "success",
    message: `Shift closed. Counted ${formatPeso(counted.data)}, expected ${formatPeso(expected)}. ${verdict}`,
  };
}
