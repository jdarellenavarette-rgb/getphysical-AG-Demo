"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { selectFacility } from "../../app/actions/facility";
import { Select } from "../ui/input";

export function FacilitySwitcher({
  activeId,
  facilities,
}: {
  activeId: string;
  facilities: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Select
      aria-label="Facility"
      value={activeId}
      disabled={pending}
      className="h-10 max-w-64 font-bold"
      onChange={(event) => {
        const facilityId = event.target.value;
        startTransition(async () => {
          await selectFacility(facilityId);
          router.refresh();
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
