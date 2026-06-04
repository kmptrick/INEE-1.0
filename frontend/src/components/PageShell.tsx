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

// ── Segment Filter (search + modal rules) ────────────────────────────────────

export type FilterRuleDef = {
  key: string;
  label: string;
  dataType: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
  getValue?: (row: any) => string;
};

export type FilterRule = {
  id: string;
  column: string;
  operator: string;
  value: string;
};

const _OPERATORS: Record<string, { value: string; label: string }[]> = {
  text:   [{ value: 'contains', label: 'contient' }, { value: 'eq', label: 'est égal à' }, { value: 'starts', label: 'commence par' }, { value: 'neq', label: "n'est pas" }],
  number: [{ value: 'eq', label: 'est égal à' }, { value: 'gt', label: 'est supérieur à' }, { value: 'lt', label: 'est inférieur à' }, { value: 'gte', label: 'est ≥' }, { value: 'lte', label: 'est ≤' }],
  date:   [{ value: 'eq', label: 'est le' }, { value: 'after', label: 'est après le' }, { value: 'before', label: 'est avant le' }],
  select: [{ value: 'eq', label: 'est' }, { value: 'neq', label: "n'est pas" }],
};

function _applyRule(rowVal: string, op: string, v: string): boolean {
  if (!v) return true;
  switch (op) {
    case 'contains': return rowVal.toLowerCase().includes(v.toLowerCase());
    case 'eq':       return rowVal.toLowerCase() === v.toLowerCase();
    case 'starts':   return rowVal.toLowerCase().startsWith(v.toLowerCase());
    case 'neq':      return rowVal.toLowerCase() !== v.toLowerCase();
    case 'gt':       return parseFloat(rowVal) > parseFloat(v);
    case 'lt':       return parseFloat(rowVal) < parseFloat(v);
    case 'gte':      return parseFloat(rowVal) >= parseFloat(v);
    case 'lte':      return parseFloat(rowVal) <= parseFloat(v);
    case 'after':    return rowVal >= v;
    case 'before':   return rowVal <= v;
    default:         return true;
  }
}

export function useSegmentFilter<T>(data: T[], defs: FilterRuleDef[]) {
  const [search, setSearch] = useState('');
  const [rules, setRules] = useState<FilterRule[]>([]);

  const addRule = () => setRules(r => [...r, {
    id: Date.now().toString(),
    column: defs[0]?.key ?? '',
    operator: _OPERATORS[defs[0]?.dataType ?? 'text'][0].value,
    value: '',
  }]);
  const removeRule = (id: string) => setRules(r => r.filter(x => x.id !== id));
  const updateRule = (id: string, patch: Partial<FilterRule>) =>
    setRules(r => r.map(x => x.id === id ? { ...x, ...patch } : x));
  const clearRules = () => setRules([]);
  const clearAll  = () => { setRules([]); setSearch(''); };
  const activeCount = rules.filter(r => r.value).length;

  const filtered = data.filter(row => {
    if (search) {
      const q = search.toLowerCase();
      const hit = defs.some(def => {
        const val = def.getValue ? def.getValue(row) : String((row as any)[def.key] ?? '');
        return val.toLowerCase().includes(q);
      });
      if (!hit) return false;
    }
    return rules.every(rule => {
      if (!rule.value) return true;
      const def = defs.find(d => d.key === rule.column);
      if (!def) return true;
      const rowVal = def.getValue ? def.getValue(row) : String((row as any)[rule.column] ?? '');
      return _applyRule(rowVal, rule.operator, rule.value);
    });
  });

  return { search, setSearch, rules, addRule, removeRule, updateRule, clearRules, clearAll, filtered, activeCount };
}

function _FilterModal({ defs, rules, addRule, removeRule, updateRule, clearRules, onClose }: {
  defs: FilterRuleDef[];
  rules: FilterRule[];
  addRule: () => void;
  removeRule: (id: string) => void;
  updateRule: (id: string, patch: Partial<FilterRule>) => void;
  clearRules: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(26,16,8,0.45)' }} onClick={onClose}>
      <div className="rounded-xl shadow-2xl w-full max-w-xl mx-4" style={{ background: '#FFF' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 rounded-t-xl" style={{ background: T.copper }}>
          <h2 className="font-bold text-white">Filtres avancés</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none cursor-pointer">✕</button>
        </div>

        {/* Rules */}
        <div className="px-5 py-4 space-y-2.5 max-h-72 overflow-y-auto">
          {rules.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: T.muted }}>
              Aucune règle — cliquez sur &quot;+ Ajouter une règle&quot;
            </p>
          )}
          {rules.map((rule, idx) => {
            const def = defs.find(d => d.key === rule.column) ?? defs[0];
            const ops = _OPERATORS[def?.dataType ?? 'text'] ?? _OPERATORS.text;
            return (
              <div key={rule.id} className="flex gap-2 items-center">
                <span className="text-xs font-semibold shrink-0 w-12 text-right" style={{ color: T.muted }}>
                  Règle {idx + 1}
                </span>
                {/* Column */}
                <select value={rule.column}
                  onChange={e => {
                    const d = defs.find(x => x.key === e.target.value);
                    updateRule(rule.id, { column: e.target.value, operator: _OPERATORS[d?.dataType ?? 'text'][0].value, value: '' });
                  }}
                  className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
                  style={{ background: '#F8F5F2', border: `1px solid ${T.border}`, color: T.dark }}>
                  {defs.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
                {/* Operator */}
                <select value={rule.operator} onChange={e => updateRule(rule.id, { operator: e.target.value })}
                  className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
                  style={{ background: '#F8F5F2', border: `1px solid ${T.border}`, color: T.dark }}>
                  {ops.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {/* Value */}
                {def?.dataType === 'select' ? (
                  <select value={rule.value} onChange={e => updateRule(rule.id, { value: e.target.value })}
                    className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
                    style={{ background: '#F8F5F2', border: `1px solid ${T.border}`, color: T.dark }}>
                    <option value="">— Choisir —</option>
                    {def.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={def?.dataType === 'number' ? 'number' : def?.dataType === 'date' ? 'date' : 'text'}
                    placeholder="Valeur..."
                    value={rule.value}
                    onChange={e => updateRule(rule.id, { value: e.target.value })}
                    className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none"
                    style={{ background: '#F8F5F2', border: `1px solid ${T.border}`, color: T.dark }}
                  />
                )}
                <button onClick={() => removeRule(rule.id)}
                  className="shrink-0 text-base leading-none cursor-pointer" style={{ color: '#DC2626' }}>🗑</button>
              </div>
            );
          })}
          <button onClick={addRule}
            className="flex items-center gap-1 text-xs font-semibold cursor-pointer pt-1"
            style={{ color: T.copper }}>
            + Ajouter une règle
          </button>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4" style={{ borderTop: `1px solid ${T.border}` }}>
          <button onClick={() => { clearRules(); onClose(); }}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
            style={{ border: `1px solid ${T.border}`, color: T.muted, background: 'transparent' }}>
            Effacer tout
          </button>
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
            style={{ background: T.copper, boxShadow: '0 1px 4px rgba(200,128,58,0.3)' }}>
            Appliquer ✓
          </button>
        </div>
      </div>
    </div>
  );
}

export function SegmentFilterBar({ search, onSearch, placeholder, defs, rules, addRule, removeRule, updateRule, clearRules, clearAll, activeCount }: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  defs: FilterRuleDef[];
  rules: FilterRule[];
  addRule: () => void;
  removeRule: (id: string) => void;
  updateRule: (id: string, patch: Partial<FilterRule>) => void;
  clearRules: () => void;
  clearAll: () => void;
  activeCount: number;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <div className="mb-5 flex gap-3 items-center flex-wrap">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: T.muted }}>🔍</span>
          <input
            type="text"
            placeholder={placeholder ?? 'Rechercher...'}
            value={search}
            onChange={e => onSearch(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-lg text-sm outline-none transition-all w-56"
            style={{ background: '#FFF', border: `1.5px solid ${search ? T.copper : T.border}`, color: T.dark }}
            onFocus={e => { e.target.style.borderColor = T.copper; e.target.style.boxShadow = '0 0 0 3px rgba(200,128,58,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = search ? T.copper : T.border; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        {/* Filtres button */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer"
          style={{
            background: activeCount > 0 ? T.copper : '#FFF',
            color: activeCount > 0 ? '#FFF' : T.muted,
            borderColor: activeCount > 0 ? T.copper : T.border,
            boxShadow: activeCount > 0 ? '0 1px 4px rgba(200,128,58,0.3)' : 'none',
          }}>
          ⊕ Filtres{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
        {/* Clear all */}
        {(activeCount > 0 || search) && (
          <button onClick={clearAll}
            className="text-xs px-3 py-2 rounded-lg cursor-pointer transition-all"
            style={{ color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA' }}>
            ✕ Tout effacer
          </button>
        )}
      </div>
      {modalOpen && (
        <_FilterModal
          defs={defs} rules={rules}
          addRule={addRule} removeRule={removeRule} updateRule={updateRule} clearRules={clearRules}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

// ── Sort helpers ──────────────────────────────────────────────────────────────

export type SortState = { key: string; dir: 'asc' | 'desc' };

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key] ?? '', obj);
}

export function useSort<T>(data: T[], initial?: SortState) {
  const [sort, setSort] = useState<SortState | null>(initial ?? null);

  const toggle = (key: string) => {
    setSort(s => s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const sorted = sort
    ? [...data].sort((a: any, b: any) => {
        const av = getNestedValue(a, sort.key) ?? '';
        const bv = getNestedValue(b, sort.key) ?? '';
        const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'fr');
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
        {saving ? 'Enregistrement...' : (label ?? 'Enregistrer')}
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
    <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-3 fixed bottom-0 right-0 left-0"
      style={{
        background: '#F8F5F2',
        borderTop: `1px solid ${T.border}`,
        zIndex: 20,
        left: 'var(--sidebar-w, 0px)',
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
