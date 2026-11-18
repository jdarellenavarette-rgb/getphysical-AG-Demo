import { UserPlus } from "lucide-react";
import { ActionButton } from "../../../components/ui/action-button";
import { ActionForm } from "../../../components/ui/action-form";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input, Label, Select } from "../../../components/ui/input";
import type { TeamMember } from "../../../lib/data/team";
import { addTeamMember, removeTeamMember } from "../../actions/team";

const ROLE_LABELS = { OWNER: "Owner", ADMIN: "Admin", STAFF: "Front desk", COACH: "Coach" } as const;

/** Who can sign in to the suite for this venue, and what each role can do. */
export function TeamCard({
  team,
  canManage,
  currentUserId,
}: {
  team: TeamMember[];
  canManage: boolean;
  currentUserId: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <Badge>
          {team.length} {team.length === 1 ? "person" : "people"}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-5">
        <ul className="grid gap-2">
          {team.map((member) => (
            <li
              key={member.userId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">
                  {member.name}
                  {member.userId === currentUserId && <span className="font-normal text-muted-foreground"> (you)</span>}
                </span>
                {member.username && <span className="block text-sm text-muted-foreground">@{member.username}</span>}
              </span>
              <span className="flex items-center gap-3">
                <Badge tone={member.role === "OWNER" ? "success" : "neutral"}>{ROLE_LABELS[member.role]}</Badge>
                {canManage && member.role !== "OWNER" && member.userId !== currentUserId && (
                  <ActionButton
                    action={removeTeamMember.bind(null, member.userId)}
                    pendingLabel="Removing…"
                    variant="ghost"
                    aria-label={`Remove ${member.name} from the team`}
                    confirm={{ question: `Remove ${member.name}?`, yes: "Yes, remove" }}
                  >
                    Remove
                  </ActionButton>
                )}
              </span>
            </li>
          ))}
        </ul>

        {canManage ? (
          <div className="border-t border-border pt-5">
            <ActionForm
              action={addTeamMember}
              submitLabel="Add to team"
              pendingLabel="Adding…"
              icon={<UserPlus size={16} aria-hidden />}
            >
              <Label className="min-w-48 flex-1">
                Sodia username
                <Input name="username" placeholder="@username" autoComplete="off" autoCapitalize="none" required />
              </Label>
              <Label className="min-w-40">
                Role
                <Select name="role" defaultValue="STAFF">
                  <option value="STAFF">Front desk</option>
                  <option value="COACH">Coach</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </Label>
            </ActionForm>
            <p className="text-sm text-muted-foreground">
              Front desk and coaches run check-in, members, schedule and the inbox. Admins also see prices, payouts and
              sales, and can manage the team. The person needs a Sodia account first.
            </p>
          </div>
        ) : (
          <p className="border-t border-border pt-5 text-sm text-muted-foreground">
            Only the owner or an admin can add or remove team members.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
