"use client";

import { useServerForm } from "../../../lib/use-server-form";
import { useEffect, useRef } from "react";
import type { FacilityProduct } from "sodia-core";
import { Button } from "../../../components/ui/button";
import { FieldError, Input, Label, Select } from "../../../components/ui/input";
import { saveProduct, type ProductFormState } from "../../actions/products";

const initialState: ProductFormState = { status: "idle" };

/** Add a plan, or edit one when `product` is given. */
interface Suggestion {
  name: string;
  description: string;
  durationDays: string;
}

export function ProductForm({ product, suggestion }: { product?: FacilityProduct; suggestion?: Suggestion }) {
  const [state, action, pending] = useServerForm(saveProduct.bind(null, product?.id ?? null), initialState, {
    id: `plan-${product?.id ?? "new"}`,
  });
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status !== "success") return;
    if (!product) formRef.current?.reset();
  }, [state, product]);

  const errors = state.fieldErrors ?? {};
  const failed = state.status !== "success" && state.status !== "idle";
  const key = product?.id ?? "new";
  // The standard day pass is tied to a 1-day length for older app versions.
  const lengthLocked = product?.legacy_sku === "DAY_PASS";

  return (
    <form ref={formRef} action={action} noValidate className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Label className="sm:col-span-2">
        Name
        <Input
          name="name"
          defaultValue={product?.name ?? suggestion?.name}
          maxLength={80}
          required
          placeholder="Weekly pass"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={`${key}-name-error`}
        />
        <FieldError id={`${key}-name-error`}>{errors.name}</FieldError>
      </Label>
      <Label>
        Type
        {product ? (
          <>
            <Input value={product.kind === "MEMBERSHIP" ? "Membership" : "Pass"} readOnly disabled />
            <input type="hidden" name="kind" value={product.kind} />
          </>
        ) : (
          <Select name="kind" defaultValue="PASS" aria-invalid={Boolean(errors.kind)}>
            <option value="PASS">Pass (one-off, ₱15 service fee)</option>
            <option value="MEMBERSHIP">Membership (5% service fee)</option>
          </Select>
        )}
        <FieldError>{errors.kind}</FieldError>
      </Label>
      <Label>
        Price (₱)
        <Input
          name="pricePhp"
          inputMode="decimal"
          defaultValue={product ? String(product.price_php) : ""}
          required
          aria-invalid={Boolean(errors.pricePhp)}
          aria-describedby={`${key}-price-error`}
        />
        <FieldError id={`${key}-price-error`}>{errors.pricePhp}</FieldError>
      </Label>
      <Label>
        Lasts (days)
        <Input
          name="durationDays"
          inputMode="numeric"
          defaultValue={product ? String(product.duration_days) : (suggestion?.durationDays ?? "")}
          readOnly={lengthLocked}
          required
          placeholder="7"
          aria-invalid={Boolean(errors.durationDays)}
          aria-describedby={`${key}-length-error`}
        />
        <FieldError id={`${key}-length-error`}>{errors.durationDays}</FieldError>
      </Label>
      <Label className="sm:col-span-2 lg:col-span-3">
        Description (optional)
        <Input
          name="description"
          defaultValue={product?.description ?? suggestion?.description}
          maxLength={200}
          placeholder="Shown to members under the name"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={`${key}-description-error`}
        />
        <FieldError id={`${key}-description-error`}>{errors.description}</FieldError>
      </Label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : product ? "Save changes" : "Add plan"}
        </Button>
        <span role={failed ? "alert" : "status"} className={`text-sm ${failed ? "text-danger" : "text-success"}`}>
          {state.message}
        </span>
      </div>
    </form>
  );
}
