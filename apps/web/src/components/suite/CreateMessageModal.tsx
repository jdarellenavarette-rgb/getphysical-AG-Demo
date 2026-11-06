'use client';

import React from 'react';
import { CheckCircle, Send, Sparkles } from 'lucide-react';
import type { CrmBroadcast } from 'sodia-core';
import { Dialog } from '../ui/Dialog';
import { StateView } from '../ui/StateView';
import { BROADCAST_BODY_MAX, BROADCAST_TITLE_MAX } from '../../lib/schemas/broadcast';
import type { SuiteMode } from '../../lib/suite-routes';
import { BROADCAST_CONFIG } from './broadcast/config';
import { useBroadcastForm } from './broadcast/useBroadcastForm';
import { FormField } from '../ui/FormField';

interface CreateMessageModalProps {
  visible: boolean;
  onClose: () => void;
  suiteMode: SuiteMode;
  onBroadcastSent?: (broadcast: CrmBroadcast) => void;
}

export function CreateMessageModal({ visible, onClose, suiteMode, onBroadcastSent }: CreateMessageModalProps) {
  const cfg = BROADCAST_CONFIG[suiteMode];
  const form = useBroadcastForm(suiteMode, onBroadcastSent);
  const close = () => {
    form.reset();
    onClose();
  };

  const icon = (
    <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #FF6B7A, #E11D48)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Send size={16} />
    </span>
  );

  return (
    <Dialog open={visible} onClose={close} title={cfg.title} description={cfg.sub} icon={icon} dismissible={!form.pending}>
      {form.result?.status === 'success' ? (
        <div className="gp-state" role="status" style={{ minHeight: 160 }}>
          <CheckCircle size={44} color="var(--gp-accent-green)" aria-hidden="true" />
          <p className="gp-state-title">Broadcast dispatched</p>
          <p className="gp-state-body">“{form.result.data.title}” was queued for the selected audience. Members will see it in Sodia.</p>
          <button type="button" className="gp-btn gp-btn-primary" onClick={close} data-autofocus>
            Done
          </button>
        </div>
      ) : form.result?.status === 'error' ? (
        <StateView state={form.result} onRetry={() => { form.clearResult(); form.submit(); }} compact />
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            form.submit();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <fieldset style={{ border: 'none' }}>
            <legend className="gp-label">Audience segment</legend>
            <div className="gp-grid-auto-narrow" role="group">
              {cfg.segments.map((seg) => (
                <button
                  key={seg.id}
                  type="button"
                  className="gp-chip"
                  aria-pressed={form.values.audience === seg.id}
                  onClick={() => form.setAudience(seg.id)}
                  style={{ justifyContent: 'center', borderRadius: 10, whiteSpace: 'normal', minHeight: 40 }}
                >
                  {seg.label}
                </button>
              ))}
            </div>
          </fieldset>

          <FormField label="Broadcast headline" error={form.errors.title} counter={`${form.values.title.length}/${BROADCAST_TITLE_MAX}`}>
            {(props) => (
              <input
                {...props}
                className="gp-input"
                type="text"
                value={form.values.title}
                onChange={(e) => form.setField('title', e.target.value)}
                onBlur={() => form.blurField('title')}
                placeholder={cfg.placeholderTitle}
                data-autofocus
              />
            )}
          </FormField>

          <FormField label="Message content" error={form.errors.body} counter={`${form.values.body.length}/${BROADCAST_BODY_MAX}`}>
            {(props) => (
              <textarea
                {...props}
                className="gp-input"
                rows={3}
                value={form.values.body}
                onChange={(e) => form.setField('body', e.target.value)}
                onBlur={() => form.blurField('body')}
                placeholder={cfg.placeholderBody}
                style={{ resize: 'vertical' }}
              />
            )}
          </FormField>

          <FormField label={cfg.promoLabel} error={form.errors.promoCode}>
            {(props) => (
              <div className="gp-row">
                <input
                  {...props}
                  className="gp-input"
                  type="text"
                  value={form.values.promoCode}
                  onChange={(e) => form.setField('promoCode', e.target.value.toUpperCase())}
                  onBlur={() => form.blurField('promoCode')}
                  placeholder="e.g. GPVIP20"
                  style={{ color: 'var(--gp-accent-text)', fontWeight: 800 }}
                />
                <button type="button" className="gp-btn gp-btn-secondary" onClick={() => form.setField('promoCode', 'METROGP2026')}>
                  <Sparkles size={14} aria-hidden="true" /> Generate
                </button>
              </div>
            )}
          </FormField>

          <button type="submit" className="gp-btn gp-btn-primary" disabled={form.pending} aria-busy={form.pending} style={{ minHeight: 46, marginTop: 6 }}>
            <Send size={15} aria-hidden="true" />
            <span>{form.pending ? 'Sending…' : 'Broadcast now'}</span>
          </button>
        </form>
      )}
    </Dialog>
  );
}
