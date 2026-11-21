"use client";

import { useRefreshAfterAction } from "../../../lib/use-server-form";
import { useState, useTransition } from "react";
import { Button } from "../../../components/ui/button";
import { setProductActive } from "../../actions/products";

export function ProductToggle({
  productId,
  productName,
  isActive,
}: {
  productId: string;
  productName: string;
  isActive: boolean;
}) {
  const refresh = useRefreshAfterAction();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant={isActive ? "danger" : "secondary"}
        disabled={pending}
        aria-label={`${isActive ? "Switch off" : "Switch on"} ${productName}`}
        onClick={() =>
          startTransition(async () => {
            const result = await setProductActive(productId, !isActive);
            if (result.status === "success") {
              setError(null);
              refresh();
            } else setError(result.message ?? "We couldn't change that.");
          })
        }
      >
        {pending ? "Working…" : isActive ? "Switch off" : "Switch on"}
      </Button>
      {error && (
        <span role="alert" className="text-sm text-danger">
          {error}
        </span>
      )}
    </span>
  );
}
