import { ReactNode } from 'react';
import { T } from './FormField';

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-bold" style={{ color: T.dark }}>{title}</h1>
      {action}
    </div>
  );
}

export function AddButton({ onClick, label = '+ Ajouter' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick}
      className="text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
      style={T.addBtn}
      onMouseEnter={e => (e.currentTarget.style.background = T.copperHover)}
      onMouseLeave={e => (e.currentTarget.style.background = T.copper)}>
      {label}
    </button>
  );
}

export function FilterBar({ filters, active, onChange }: {
  filters: { value: string; label: string }[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-5 flex gap-2 flex-wrap">
      {filters.map(f => (
        <button key={f.value} onClick={() => onChange(f.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
          style={active === f.value
            ? { background: T.copper, color: '#FFF', borderColor: T.copper, boxShadow: '0 1px 4px rgba(200,128,58,0.3)' }
            : { background: '#FFF', color: T.muted, borderColor: T.border }}>
          {f.label}
        </button>
      ))}
    </div>
  );
}

export function DataTable({ headers, children, empty, loading }: {
  headers: { label: string; align?: 'left' | 'right' | 'center' }[];
  children: ReactNode;
  empty: string;
  loading: boolean;
}) {
  if (loading) return (
    <div className="rounded-xl p-10 text-center text-sm" style={{ background: '#FFF', border: `1px solid ${T.border}` }}>
      <span style={{ color: T.muted }}>Chargement...</span>
    </div>
  );
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#FFF', border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(26,16,8,0.04)' }}>
      <table className="w-full text-sm">
        <thead style={{ background: T.head, borderBottom: `1px solid ${T.border}` }}>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-${h.align ?? 'left'}`}
                style={{ color: '#4A3020' }}>{h.label}</th>
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
  );
}

export function Td({ children, align = 'left', bold }: { children: ReactNode; align?: 'left' | 'right' | 'center'; bold?: boolean }) {
  return (
    <td className={`px-4 py-3 text-${align}`} style={{ color: bold ? T.dark : T.muted, fontWeight: bold ? 600 : 400 }}>
      {children}
    </td>
  );
}

export function StatusBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: bg, color }}>
      {label}
    </span>
  );
}

export function FormActions({ onCancel, saving, label }: { onCancel: () => void; saving: boolean; label?: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel}
        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        style={{ border: `1px solid ${T.border}`, color: T.muted, background: 'transparent' }}>
        Annuler
      </button>
      <button type="submit" disabled={saving}
        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
        style={{ background: T.copper, opacity: saving ? 0.7 : 1, boxShadow: '0 1px 4px rgba(200,128,58,0.3)' }}>
        {saving ? 'Enregistrement...' : (label ?? 'Créer')}
      </button>
    </div>
  );
}
