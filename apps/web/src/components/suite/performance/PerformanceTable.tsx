'use client';

import React, { useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpDown, ArrowUpRight, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { createEmptyState, createNoSearchResultsState, createSuccessState, type TenStateEnvelope } from 'sodia-core/states';
import { StateView } from '../../ui/StateView';
import { useDebouncedValue } from '../../../lib/use-debounced-value';
import { COLUMN_KEYS, isAttentionStatus, type ColumnKey, type TableMeta, type TableRowData } from './data';

type SortState = { key: ColumnKey; dir: 'asc' | 'desc' } | null;

function compare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/** Client leaf: debounced filter, sortable columns, and empty / no-results states. */
export function PerformanceTable({ meta }: { meta: TableMeta }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortState>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebouncedValue(query.trim().toLowerCase(), 200);

  const state: TenStateEnvelope<readonly TableRowData[]> = useMemo(() => {
    if (meta.rows.length === 0) return createEmptyState('No programs have recorded attendance in this period.', 'Add a program');
    const filtered = debounced
      ? meta.rows.filter((r) => COLUMN_KEYS.some((k) => r[k].toLowerCase().includes(debounced)))
      : meta.rows;
    if (filtered.length === 0) return createNoSearchResultsState(debounced);
    const sorted = sort
      ? [...filtered].sort((a, b) => (sort.dir === 'asc' ? 1 : -1) * compare(a[sort.key], b[sort.key]))
      : filtered;
    return createSuccessState<readonly TableRowData[]>(sorted);
  }, [meta.rows, debounced, sort]);

  const toggleSort = (key: ColumnKey) =>
    setSort((prev) => (prev?.key !== key ? { key, dir: 'asc' } : prev.dir === 'asc' ? { key, dir: 'desc' } : null));

  const clear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <>
      <div style={{ position: 'relative', marginBottom: 14, maxWidth: 320 }}>
        <label htmlFor="gp-perf-filter" className="gp-sr-only">
          Filter {meta.title}
        </label>
        <Search size={14} aria-hidden="true" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gp-text-muted)' }} />
        <input
          ref={inputRef}
          id="gp-perf-filter"
          className="gp-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter rows…"
          style={{ paddingLeft: 34, paddingRight: 36 }}
        />
        {query && (
          <button type="button" className="gp-btn gp-btn-ghost gp-btn-sm" onClick={clear} aria-label="Clear filter" style={{ position: 'absolute', right: 2, top: 5, minHeight: 32, width: 32, padding: 0 }}>
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>
      <StateView state={state} onClearSearch={clear} compact>
        {(rows) => (
          <div className="gp-table-scroll" role="region" aria-label={meta.title} tabIndex={0}>
            <table className="gp-table">
              <thead>
                <tr>
                  {meta.headers.map((h, i) => {
                    const key = COLUMN_KEYS[i]!;
                    const active = sort?.key === key;
                    return (
                      <th key={h} scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                        <button type="button" className="gp-th-sort" onClick={() => toggleSort(key)}>
                          {h}
                          {active ? (
                            sort.dir === 'asc' ? <ChevronUp size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />
                          ) : (
                            <ArrowUpDown size={12} aria-hidden="true" style={{ opacity: 0.5 }} />
                          )}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.col1}>
                    <td style={{ fontWeight: 800, color: 'var(--gp-text-primary)' }}>{row.col1}</td>
                    <td style={{ color: 'var(--gp-text-secondary)', fontWeight: 600 }}>{row.col2}</td>
                    <td style={{ color: 'var(--gp-text-primary)', fontWeight: 800 }}>{row.col3}</td>
                    <td>
                      <span className="gp-row" style={{ gap: 3, fontWeight: 800, fontSize: 12, color: row.isPositive ? 'var(--gp-accent-green)' : 'var(--gp-accent-text)' }}>
                        {row.isPositive ? <ArrowUpRight size={14} aria-hidden="true" /> : <ArrowDownRight size={14} aria-hidden="true" />}
                        <span className="gp-sr-only">{row.isPositive ? 'Up' : 'Down'}</span>
                        {row.col4}
                      </span>
                    </td>
                    <td style={{ color: 'var(--gp-text-secondary)', fontWeight: 600 }}>{row.col5}</td>
                    <td>
                      <span className={`gp-badge ${isAttentionStatus(row.col6) ? 'gp-badge-danger' : 'gp-badge-success'}`} style={{ borderRadius: 6 }}>
                        {row.col6}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </StateView>
    </>
  );
}
