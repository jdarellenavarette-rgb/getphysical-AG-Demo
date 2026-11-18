"use client";

import { useTransition } from "react";
import { selectFacility } from "../../app/actions/facility";
import { Select } from "../ui/input";

export function FacilitySwitcher({
  activeId,
  facilities,
}: {
  activeId: string;
  facilities: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Select
      aria-label="Business"
      value={activeId}
      disabled={pending}
      className="h-10 max-w-80 font-bold"
      onChange={(event) => {
        const facilityId = event.target.value;
        startTransition(async () => {
          await selectFacility(facilityId);
          // Each business has its own workspace, and the page you are on may not exist in the other
          // one, so load that workspace's home afresh.
          window.location.assign("/");
        });
      }}
    >
      {facilities.map((facility) => (
        <option key={facility.id} value={facility.id}>
          {facility.name}
        </option>
      ))}
    </Select>
  );
}
