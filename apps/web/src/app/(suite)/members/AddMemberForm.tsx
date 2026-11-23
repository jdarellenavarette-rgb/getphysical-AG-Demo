"use client";

import { submitWith, useServerForm } from "../../../lib/use-server-form";
import { useEffect, useRef } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input, Label } from "../../../components/ui/input";
import { addMember, type MemberFormState } from "../../actions/members";

const initialState: MemberFormState = { status: "idle" };

export function AddMemberForm() {
  const [state, action, pending] = useServerForm(addMember, initialState, { id: "add-member" });
  const formRef = useRef<HTMLFormElement>(null);
  // On success: clear the field. The list below reloads with the save.
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);
  const failed = state.status === "form_validation" || state.status === "error";

  return (
    <form ref={formRef} onSubmit={submitWith(action)} noValidate className="grid gap-2">
      <div className="flex flex-wrap items-end gap-3">
        <Label className="min-w-56 flex-1">
          Add a member by Sodia username
          <Input
            name="username"
            placeholder="@username"
            autoComplete="off"
            autoCapitalize="none"
            required
            aria-invalid={state.status === "form_validation"}
            aria-describedby="add-member-result"
          />
        </Label>
        <Button type="submit" disabled={pending}>
          <UserPlus size={16} aria-hidden />
          {pending ? "Adding…" : "Add member"}
        </Button>
      </div>
      <p
        id="add-member-result"
        role={failed ? "alert" : "status"}
        className={`min-h-5 text-sm ${failed ? "text-danger" : "text-success"}`}
      >
        {state.message}
      </p>
    </form>
  );
}
