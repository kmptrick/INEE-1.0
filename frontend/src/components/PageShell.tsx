'use client';
import { ReactNode, useState, useEffect, useRef } from 'react';
import { T } from './FormField';

// ── Export helpers ────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportCSV(rows: Record<string, unknown>[], filename = 'export.csv') {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\r\n');
  downloadBlob(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

export function exportExcel(rows: Record<string, unknown>[], filename = 'export.xlsx') {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const tr = (cells: string[], tag: 'th' | 'td') =>
    `<tr>${cells.map(c => `<${tag}>${c}</${tag}>`).join('')}</tr>`;
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8"/></head><body><table border="1">
<thead>${tr(headers, 'th')}</thead>
<tbody>${rows.map(r => tr(headers.map(h => String(r[h] ?? '')), 'td')).join('')}</tbody>
</table></body></html>`;
  downloadBlob(new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' }), filename);
}

export async function exportPDF(
  rows: Record<string, unknown>[],
  filename = 'export.pdf',
  title = 'Export'
) {
  if (!rows.length) return;
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  const headers = Object.keys(rows[0]);
  autoTable(doc, {
    startY: 22,
    head: [headers],
    body: rows.map(r => headers.map(h => String(r[h] ?? ''))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [200, 128, 58], textColor: 255, fontStyle: 'bold' },
  });
  doc.save(filename);
}

// ── PageHeader ────────────────────────────────────────────────────────────────

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-bold" style={{ color: T.dark }}>{title}</h1>
      {action}
    </div>
  );
}

// ── AddButton ─────────────────────────────────────────────────────────────────

export function AddButton({ onClick, label = '+ Ajouter' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick}
      className="text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer"
      style={T.addBtn}
      onMouseEnter={e => (e.currentTarget.style.background = T.copperHover)}
      onMouseLeave={e => (e.currentTarget.style.background = T.copper)}>
      {label}
    </button>
  );
}

// ── FilterBar ────────────────────────────────────────────────────────────────

export function FilterBar({ filters, active, onChange }: {
  filters: { value: string; label: string }[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-5 flex gap-2 flex-wrap">
      {filters.map(f => (
        <button key={f.value} onClick={() => onChange(f.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer"
          style={active === f.value
            ? { background: T.copper, color: '#FFF', borderColor: T.copper, boxShadow: '0 1px 4px rgba(200,128,58,0.3)' }
            : { background: '#FFF', color: T.muted, borderColor: T.border }}>
          {f.label}
        </button>
      ))}
    </div>
  );
}

// ── Column Filters ────────────────────────────────────────────────────────────

export type FilterDef = {
  key: string;
  label: string;
  type: 'text' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  getValue?: (row: any) => string;
};

export function useColumnFilters<T>(data: T[], defs: FilterDef[]) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(defs.map(d => [d.key, '']))
  );

  const set = (key: string, val: string) =>
    setValues(v => ({ ...v, [key]: val }));

  const reset = () =>
    setValues(Object.fromEntries(defs.map(d => [d.key, ''])));

  const activeCount = Object.values(values).filter(Boolean).length;

  const filtered = data.filter(row =>
    defs.every(def => {
      const val = values[def.key];
      if (!val) return true;
      const rowVal = def.getValue
        ? def.getValue(row).toLowerCase()
        : String((row as any)[def.key] ?? '').toLowerCase();
      return def.type === 'select'
        ? rowVal === val.toLowerCase()
        : rowVal.includes(val.toLowerCase());
    })
  );

  return { values, set, reset, filtered, activeCount };
}

export function ColumnFilterBar({ defs, values, set, reset, activeCount }: {
  defs: FilterDef[];
  values: Record<string, string>;
  set: (key: string, val: string) => void;
  reset: () => void;
  activeCount: number;
}) {
  if (defs.length === 0) return null;
  return (
    <div className="mb-5 px-4 py-3 rounded-xl flex flex-wrap gap-x-4 gap-y-3 items-end"
      style={{ background: '#FFF', border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(26,16,8,0.04)' }}>
      <span className="text-xs font-bold uppercase tracking-wider self-end pb-1.5" style={{ color: T.muted }}>🔍 Filtres</span>
      {defs.map(def => (
        <div key={def.key} className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-xs font-semibold" style={{ color: T.muted }}>{def.label}</label>
          {def.type === 'select' ? (
            <select
              value={values[def.key]}
              onChange={e => set(def.key, e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
              style={{ background: '#F8F5F2', border: `1.5px solid ${values[def.key] ? T.copper : T.border}`, color: T.dark }}>
              <option value="">— Tous —</option>
              {def.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input
              type="text"
              placeholder={def.placeholder ?? 'Filtrer...'}
              value={values[def.key]}
              onChange={e => set(def.key, e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs outline-none transition-all"
              style={{ background: '#F8F5F2', border: `1.5px solid ${values[def.key] ? T.copper : T.border}`, color: T.dark }}
              onFocus={e => (e.target.style.borderColor = T.copper)}
              onBlur={e => (e.target.style.borderColor = values[def.key] ? T.copper : T.border)}
            />
          )}
        </div>
      ))}
      {activeCount > 0 && (
        <button onClick={reset}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold self-end cursor-pointer transition-all"
          style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
          ✕ Effacer ({activeCount})
        </button>
      )}
    </div>
  );
}

// ── Sort helpers ──────────────────────────────────────────────────────────────

export type SortState = { key: string; dir: 'asc' | 'desc' };

export function useSort<T>(data: T[], initial?: SortState) {
  const [sort, setSort] = useState<SortState | null>(initial ?? null);

  const toggle = (key: string) => {
    setSort(s => s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const sorted = sort
    ? [...data].sort((a: any, b: any) => {
        const av = a[sort.key] ?? '';
        const bv = b[sort.key] ?? '';
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv), 'fr');
        return sort.dir === 'asc' ? cmp : -cmp;
      })
    : data;

  return { sort, toggle, sorted };
}

// ── Pagination ────────────────────────────────────────────────────────────────

export function usePagination<T>(data: T[], defaultPerPage = 25) {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const setPerPageReset = (n: number) => { setPerPage(n); setPage(0); };
  const totalPages = Math.max(1, Math.ceil(data.length / perPage));
  const safePage = Math.min(page, totalPages - 1);
  const paged = data.slice(safePage * perPage, (safePage + 1) * perPage);
  return { page: safePage, setPage, perPage, setPerPage: setPerPageReset, paged, total: data.length, totalPages };
}

// ── ColumnSelector ────────────────────────────────────────────────────────────

export function useColumns(pageKey: string, allCols: { key: string; label: string }[]) {
  const storageKey = `inee_cols_${pageKey}`;
  const [visible, setVisible] = useState<string[]>(() => {
    if (typeof window === 'undefined') return allCols.map(c => c.key);
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : allCols.map(c => c.key);
    } catch { return allCols.map(c => c.key); }
  });

  const toggle = (key: string) => {
    setVisible(v => {
      const next = v.includes(key) ? v.filter(k => k !== key) : [...v, key];
      if (next.length === 0) return v;
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return { visible, toggle };
}

export function ColumnSelector({ allCols, visible, toggle }: {
  allCols: { key: string; label: string }[];
  visible: string[];
  toggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer"
        style={{ background: open ? T.head : '#FFF', color: T.muted, borderColor: T.border }}>
        ⚙ Colonnes
      </button>
      {open && (
        <div className="absolute bottom-9 right-0 z-50 rounded-xl shadow-xl p-3 min-w-[180px] space-y-1"
          style={{ background: '#FFF', border: `1px solid ${T.border}` }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: T.muted }}>Colonnes visibles</p>
          {allCols.map(col => (
            <label key={col.key} className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-amber-50 transition-colors">
              <input type="checkbox" checked={visible.includes(col.key)} onChange={() => toggle(col.key)}
                className="accent-amber-600 cursor-pointer" />
              <span className="text-xs" style={{ color: T.dark }}>{col.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── DataTable ─────────────────────────────────────────────────────────────────

export function DataTable({ headers, children, empty, loading, sort, onSort }: {
  headers: { label: string; align?: 'left' | 'right' | 'center'; key?: string }[];
  children: ReactNode;
  empty: string;
  loading: boolean;
  sort?: SortState | null;
  onSort?: (key: string) => void;
}) {
  if (loading) return (
    <div className="rounded-xl p-10 text-center text-sm" style={{ background: '#FFF', border: `1px solid ${T.border}` }}>
      <span style={{ color: T.muted }}>Chargement...</span>
    </div>
  );
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#FFF', border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(26,16,8,0.04)' }}>
      <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth: 600 }}>
        <thead style={{ background: T.head, borderBottom: `1px solid ${T.border}` }}>
          <tr>
            {headers.map((h, i) => (
              <th key={i}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-${h.align ?? 'left'}${h.key && onSort ? ' cursor-pointer select-none' : ''}`}
                style={{ color: '#4A3020' }}
                onClick={h.key && onSort ? () => onSort(h.key!) : undefined}>
                <span className="inline-flex items-center gap-1">
                  {h.label}
                  {h.key && onSort && (
                    <span style={{ color: sort?.key === h.key ? T.copper : T.border, fontSize: 10 }}>
                      {sort?.key === h.key ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(children as any)?.length === 0 || !children
            ? <tr><td colSpan={headers.length} className="px-4 py-10 text-center text-sm" style={{ color: T.muted }}>{empty}</td></tr>
            : children}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ── Td ────────────────────────────────────────────────────────────────────────

export function Td({ children, align = 'left', bold }: { children: ReactNode; align?: 'left' | 'right' | 'center'; bold?: boolean }) {
  return (
    <td className={`px-4 py-3 text-${align}`} style={{ color: bold ? T.dark : T.muted, fontWeight: bold ? 600 : 400 }}>
      {children}
    </td>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

export function StatusBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: bg, color }}>
      {label}
    </span>
  );
}

// ── FormActions ───────────────────────────────────────────────────────────────

export function FormActions({ onCancel, saving, label }: { onCancel: () => void; saving: boolean; label?: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel}
        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        style={{ border: `1px solid ${T.border}`, color: T.muted, background: 'transparent' }}>
        Annuler
      </button>
      <button type="submit" disabled={saving}
        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer"
        style={{ background: T.copper, opacity: saving ? 0.7 : 1, boxShadow: '0 1px 4px rgba(200,128,58,0.3)' }}>
        {saving ? 'Enregistrement...' : (label ?? 'Créer')}
      </button>
    </div>
  );
}

// ── ExportMenu ────────────────────────────────────────────────────────────────

export function ExportMenu({ getData, filename = 'export', title }: {
  getData: () => Record<string, unknown>[];
  filename?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const run = async (type: 'csv' | 'excel' | 'pdf') => {
    setOpen(false);
    const rows = getData();
    if (type === 'csv')   exportCSV(rows, `${filename}.csv`);
    if (type === 'excel') exportExcel(rows, `${filename}.xlsx`);
    if (type === 'pdf')   await exportPDF(rows, `${filename}.pdf`, title ?? filename);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer"
        style={{ background: open ? T.head : '#FFF', color: T.muted, borderColor: T.border }}>
        ↓ Exporter
      </button>
      {open && (
        <div className="absolute bottom-9 right-0 z-50 rounded-xl shadow-xl py-1 min-w-[140px]"
          style={{ background: '#FFF', border: `1px solid ${T.border}` }}>
          {([
            { key: 'excel', label: '📊 Excel (.xlsx)' },
            { key: 'csv',   label: '📄 CSV (.csv)'   },
            { key: 'pdf',   label: '📑 PDF (.pdf)'   },
          ] as const).map(opt => (
            <button key={opt.key} onClick={() => run(opt.key)}
              className="w-full text-left px-4 py-2 text-xs font-medium transition-colors cursor-pointer hover:bg-amber-50"
              style={{ color: T.dark }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TableFooter (pagination + column selector + export) ───────────────────────

export function TableFooter({ pagination, columnSelector, export: exportProps }: {
  pagination?: ReturnType<typeof usePagination>;
  columnSelector?: { allCols: { key: string; label: string }[]; visible: string[]; toggle: (k: string) => void };
  export?: { getData: () => Record<string, unknown>[]; filename?: string; title?: string };
}) {
  if (!pagination && !columnSelector && !exportProps) return null;

  const perPageBar = pagination ? (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: T.muted }}>
      <span>Lignes :</span>
      {[10, 25, 50].map(n => (
        <button key={n} onClick={() => pagination.setPerPage(n)}
          className="w-8 h-6 rounded font-semibold transition-colors cursor-pointer"
          style={{ background: pagination.perPage === n ? T.copper : T.head, color: pagination.perPage === n ? '#FFF' : T.muted, border: `1px solid ${pagination.perPage === n ? T.copper : T.border}` }}>
          {n}
        </button>
      ))}
    </div>
  ) : null;

  const navBar = pagination ? (
    <div className="flex items-center gap-2 text-xs" style={{ color: T.muted }}>
      <span>
        {pagination.total === 0 ? '0' : `${pagination.page * pagination.perPage + 1}–${Math.min((pagination.page + 1) * pagination.perPage, pagination.total)}`}
        {' '}/ {pagination.total}
      </span>
      <div className="flex gap-0.5">
        {[
          { icon: '«', action: () => pagination.setPage(0),                       disabled: pagination.page === 0 },
          { icon: '‹', action: () => pagination.setPage(pagination.page - 1),     disabled: pagination.page === 0 },
          { icon: '›', action: () => pagination.setPage(pagination.page + 1),     disabled: pagination.page >= pagination.totalPages - 1 },
          { icon: '»', action: () => pagination.setPage(pagination.totalPages - 1), disabled: pagination.page >= pagination.totalPages - 1 },
        ].map(({ icon, action, disabled }) => (
          <button key={icon} onClick={action} disabled={disabled}
            className="w-7 h-6 rounded font-bold transition-colors cursor-pointer"
            style={{ background: T.head, color: disabled ? T.border : T.muted, border: `1px solid ${T.border}`, opacity: disabled ? 0.4 : 1 }}>
            {icon}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-3"
      style={{
        position: 'fixed', bottom: 0, left: '15rem', right: 0,
        background: '#F8F5F2',
        borderTop: `1px solid ${T.border}`,
        zIndex: 20,
      }}>
      <div className="flex items-center gap-4">
        {perPageBar}
        {navBar}
      </div>
      <div className="flex items-center gap-2">
        {exportProps && <ExportMenu getData={exportProps.getData} filename={exportProps.filename} title={exportProps.title} />}
        {columnSelector && <ColumnSelector allCols={columnSelector.allCols} visible={columnSelector.visible} toggle={columnSelector.toggle} />}
      </div>
    </div>
  );
}
