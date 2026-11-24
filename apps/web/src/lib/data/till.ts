import "server-only";
import { createServerSupabase } from "../supabase/server";
import { loadTeam } from "./team";

export interface OpenShift {
  id: string;
  openedAt: string;
  float: number;
  /** Payments recorded since the shift opened. Cash is counted, not totalled, until the close. */
  cashPayments: number;
  otherPayments: number;
  otherTotal: number;
}

export interface ClosedShift {
  id: string;
  openedBy: string;
  openedAt: string;
  closedAt: string;
  float: number;
  expected: number;
  counted: number;
  difference: number;
  note: string | null;
}

export interface Till {
  open: OpenShift | null;
  closed: ClosedShift[];
}

/** Differences smaller than this are treated as rounding, not as a discrepancy. */
export const TILL_TOLERANCE_PHP = 20;

/** The signed-in person's open shift, and recent closed shifts (their own; everyone's for owners and admins). */
export async function loadTill(facilityId: string, userId: string): Promise<Till> {
  const supabase = await createServerSupabase();
  const [shifts, team] = await Promise.all([
    supabase
      .from("desk_shifts")
      .select("id, opened_by, opened_at, opening_float, closed_at, counted_cash, expected_cash, note")
      .eq("facility_id", facilityId)
      .order("opened_at", { ascending: false })
      .limit(40),
    loadTeam(facilityId),
  ]);
  if (shifts.error) throw new Error("Could not load the till.", { cause: shifts.error });
  const nameOf = new Map(team.map((member) => [member.userId, member.name]));
  const mine = (shifts.data ?? []).find((shift) => shift.opened_by === userId && shift.closed_at === null);

  let open: OpenShift | null = null;
  if (mine) {
    const { data: payments, error } = await supabase
      .from("desk_payments")
      .select("amount_php, method")
      .eq("shift_id", mine.id)
      .limit(1000);
    if (error) throw new Error("Could not load the shift's payments.", { cause: error });
    const other = (payments ?? []).filter((payment) => payment.method !== "CASH");
    open = {
      id: mine.id,
      openedAt: mine.opened_at,
      float: Number(mine.opening_float),
      cashPayments: (payments ?? []).length - other.length,
      otherPayments: other.length,
      otherTotal: other.reduce((sum, payment) => sum + Number(payment.amount_php), 0),
    };
  }

  return {
    open,
    closed: (shifts.data ?? []).flatMap((shift) =>
      shift.closed_at && shift.counted_cash !== null && shift.expected_cash !== null
        ? [
            {
              id: shift.id,
              openedBy: nameOf.get(shift.opened_by) ?? "Former team member",
              openedAt: shift.opened_at,
              closedAt: shift.closed_at,
              float: Number(shift.opening_float),
              expected: Number(shift.expected_cash),
              counted: Number(shift.counted_cash),
              difference: Number(shift.counted_cash) - Number(shift.expected_cash),
              note: shift.note,
            },
          ]
        : [],
    ),
  };
}
