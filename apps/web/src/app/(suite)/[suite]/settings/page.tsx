import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { SUITE_LABELS, SUITE_MODES, suiteHref } from '../../../../lib/suite-routes';
import { resolveSuite, suiteTabTitle, type SuiteParams } from '../../../../lib/suite-params';
import { SUITE_DESCRIPTIONS } from '../../../../lib/suite-copy';
import { SUITE_ICONS } from '../../../../components/shell/SuiteHeader';
import { PageHeader } from '../../../../components/shell/PageHeader';
import { T } from '../../../../lib/theme-vars';

export async function generateMetadata({ params }: { params: SuiteParams }): Promise<Metadata> {
  return { title: await suiteTabTitle(params, 'SETTINGS') };
}

/** Fully server-rendered: role switching is plain navigation to another suite URL. */
export default async function SettingsPage({ params }: { params: SuiteParams }) {
  const suiteMode = await resolveSuite(params);
  const fields = [
    {
      id: 'hours',
      label: suiteMode === 'COACHDASH' ? 'Weekly coaching windows' : suiteMode === 'ORGANIZERDASH' ? 'Tournament season' : 'Facility operating hours',
      value: 'Monday - Sunday: 05:00 AM - 11:00 PM',
      color: T.textPrimary,
    },
    { id: 'merchant', label: 'Maya merchant partner ID', value: 'MAYA_MERCHANT_METRO_CORE_8820', color: T.accentGreen },
    { id: 'totp', label: 'Turnstile TOTP shared epoch', value: '60 Seconds • SHA256 Secure Enclave Synchronized', color: T.textPrimary },
  ];

  return (
    <div className="gp-card" style={{ maxWidth: 720 }}>
      <PageHeader title="Settings & Workspace Role" subtitle="Configure operating parameters, active role persona, and hardware integrations." />

      <section aria-labelledby="gp-role-heading" style={{ marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${T.borderColor}` }}>
        <div className="gp-row-between" style={{ marginBottom: 6 }}>
          <h2 id="gp-role-heading" className="gp-label" style={{ marginBottom: 0 }}>
            Select role (active workspace)
          </h2>
          <span style={{ fontSize: 12, fontWeight: 800, color: T.accentText }}>Active: {SUITE_LABELS[suiteMode]}</span>
        </div>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 14 }}>
          Switching roles changes the URL, so each workspace can be bookmarked and shared.
        </p>
        <ul className="gp-grid-auto-wide" style={{ listStyle: 'none', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
          {SUITE_MODES.map((mode) => {
            const Icon = SUITE_ICONS[mode];
            const selected = mode === suiteMode;
            return (
              <li key={mode}>
                <Link
                  href={suiteHref(mode, 'SETTINGS')}
                  aria-current={selected ? 'page' : undefined}
                  className="gp-role-pill"
                  style={{
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 8,
                    padding: 16,
                    borderRadius: 14,
                    height: '100%',
                    borderWidth: 2,
                    borderColor: selected ? T.accent : T.borderColor,
                    backgroundColor: selected ? T.accentMuted : T.bgCardSecondary,
                  }}
                >
                  <span className="gp-row-between">
                    <span className="gp-row">
                      <Icon size={18} aria-hidden="true" color={selected ? T.accentText : T.textPrimary} />
                      <span style={{ fontSize: 15, fontWeight: 900 }}>{SUITE_LABELS[mode]}</span>
                    </span>
                    {selected && (
                      <span className="gp-badge" style={{ backgroundColor: T.accent, color: T.textOnAccent }}>
                        <CheckCircle2 size={12} aria-hidden="true" /> Selected
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: 12, color: T.textMuted, lineHeight: '17px', fontWeight: 500 }}>{SUITE_DESCRIPTIONS[mode]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Operational parameters" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {fields.map((f) => (
          <div key={f.id}>
            <label htmlFor={`gp-setting-${f.id}`} className="gp-label">
              {f.label}
            </label>
            <input id={`gp-setting-${f.id}`} className="gp-input" type="text" readOnly value={f.value} style={{ color: f.color }} />
          </div>
        ))}
      </section>
    </div>
  );
}
