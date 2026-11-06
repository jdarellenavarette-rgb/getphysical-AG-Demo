'use client';

import React, { useCallback, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { useDialogA11y } from './useDialogA11y';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: number;
  /** Prevents Esc / scrim dismissal while a mutation is in flight. */
  dismissible?: boolean;
  children: React.ReactNode;
}

/**
 * Accessible modal: role="dialog", aria-modal, labelled/described by its
 * heading, Esc to close, Tab focus trap, scroll lock, and focus restored to the
 * element that opened it.
 */
export function Dialog({ open, onClose, title, description, icon, maxWidth = 540, dismissible = true, children }: DialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const requestClose = useCallback(() => {
    if (dismissible) onCloseRef.current();
  }, [dismissible]);
  useDialogA11y(open, panelRef, requestClose);

  if (!open) return null;

  return (
    <div
      className="gp-dialog-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className="gp-dialog"
        style={{ maxWidth }}
      >
        <div className="gp-row-between" style={{ marginBottom: 20, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          <div className="gp-row" style={{ gap: 10, alignItems: 'flex-start' }}>
            {icon}
            <div style={{ minWidth: 0 }}>
              <h2 id={titleId} style={{ fontSize: 17, fontWeight: 900, color: 'var(--gp-text-primary)' }}>
                {title}
              </h2>
              {description && (
                <p id={descId} style={{ fontSize: 13, color: 'var(--gp-text-muted)', marginTop: 2, lineHeight: '18px' }}>
                  {description}
                </p>
              )}
            </div>
          </div>
          {dismissible && (
            <button type="button" className="gp-icon-btn" onClick={requestClose} aria-label="Close dialog">
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
