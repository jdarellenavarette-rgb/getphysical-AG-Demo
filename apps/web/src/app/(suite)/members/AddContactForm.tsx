import { UserRoundPlus } from "lucide-react";
import { ActionForm } from "../../../components/ui/action-form";
import { Input, Label } from "../../../components/ui/input";
import { addDeskContact } from "../../actions/contacts";

/** For someone who is not on the Sodia app: a walk-in, or a regular who books by phone. */
export function AddContactForm() {
  return (
    <ActionForm
      action={addDeskContact}
      submitLabel="Add to list"
      pendingLabel="Adding…"
      icon={<UserRoundPlus size={16} aria-hidden />}
    >
      <Label className="min-w-44 flex-1">
        Not on the app? Add their name
        <Input name="fullName" required maxLength={120} placeholder="Full name" autoComplete="off" />
      </Label>
      <Label className="min-w-36 flex-1">
        Mobile (optional)
        <Input name="phone" type="tel" maxLength={32} autoComplete="off" />
      </Label>
      <Label className="min-w-44 flex-1">
        Email (optional)
        <Input name="email" type="email" maxLength={254} autoComplete="off" />
      </Label>
    </ActionForm>
  );
}
