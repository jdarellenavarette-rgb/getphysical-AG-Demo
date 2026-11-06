'use client';

import { useCallback, useState, useTransition } from 'react';
import type { CrmAudience, CrmBroadcast } from 'sodia-core';
import { createErrorState, createSuccessState, type TenStateEnvelope } from 'sodia-core/states';
import { broadcastFormSchema, type BroadcastFormInput } from '../../../lib/schemas/broadcast';
import { firstFieldErrors, type FieldErrors } from '../../../lib/schemas/field-errors';
import { sendBroadcastAction } from '../../../app/actions/crm';
import type { SuiteMode } from '../../../lib/suite-routes';
import { LOCAL_BROADCAST_EVENT } from './config';

type Field = keyof BroadcastFormInput;
const EMPTY: BroadcastFormInput = { audience: 'ALL', title: '', body: '', promoCode: '' };

function validateField(field: Field, value: string): string | undefined {
  const result = broadcastFormSchema.shape[field].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

/** Form state + submit lifecycle for the broadcast composer (form_validation → loading → success | error). */
export function useBroadcastForm(suiteMode: SuiteMode, onSent?: (b: CrmBroadcast) => void) {
  const [values, setValues] = useState<BroadcastFormInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [result, setResult] = useState<TenStateEnvelope<CrmBroadcast> | null>(null);
  const [pending, startTransition] = useTransition();

  const setField = useCallback(
    (field: Field, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (touched[field]) setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    },
    [touched]
  );

  const setAudience = useCallback((audience: CrmAudience) => setValues((prev) => ({ ...prev, audience })), []);

  const blurField = useCallback(
    (field: Field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field]) }));
    },
    [values]
  );

  const submit = useCallback(() => {
    const parsed = broadcastFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(firstFieldErrors<Field>(parsed.error));
      setTouched({ title: true, body: true, promoCode: true, audience: true });
      return false;
    }
    startTransition(async () => {
      const res = await sendBroadcastAction(suiteMode, values);
      if (res.ok) {
        window.dispatchEvent(new CustomEvent<CrmBroadcast>(LOCAL_BROADCAST_EVENT, { detail: res.data }));
        onSent?.(res.data);
        setResult(createSuccessState(res.data));
      } else if (res.kind === 'validation') {
        setErrors(res.fieldErrors);
      } else {
        setResult(createErrorState<CrmBroadcast>(res.errorCode, res.message, true));
      }
    });
    return true;
  }, [values, suiteMode, onSent]);

  const reset = useCallback(() => {
    setValues(EMPTY);
    setErrors({});
    setTouched({});
    setResult(null);
  }, []);

  return { values, errors, pending, result, setField, setAudience, blurField, submit, reset, clearResult: () => setResult(null) };
}
