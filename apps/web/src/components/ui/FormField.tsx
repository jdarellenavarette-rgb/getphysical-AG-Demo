'use client';

import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface FieldControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

/** Label + control + inline error/hint wiring (aria-invalid, aria-describedby). */
export function FormField({
  label,
  error,
  hint,
  counter,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  counter?: string;
  children: (props: FieldControlProps) => React.ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <div className="gp-row-between" style={{ marginBottom: 6, flexWrap: 'nowrap' }}>
        <label htmlFor={id} className="gp-label" style={{ marginBottom: 0 }}>
          {label}
        </label>
        {counter && (
          <span aria-hidden="true" style={{ fontSize: 11, color: 'var(--gp-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {counter}
          </span>
        )}
      </div>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': describedBy })}
      {error && (
        <p id={errorId} className="gp-field-error" role="alert">
          <AlertCircle size={13} aria-hidden="true" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="gp-field-hint">
          {hint}
        </p>
      )}
    </div>
  );
}
