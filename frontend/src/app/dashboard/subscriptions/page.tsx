'use client';
import { useEffect, useState } from 'react';
import { subscriptions, companies, Subscription, Company } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, FilterBar, DataTable, Td, FormActions, usePagination, useSort, useColumns, TableFooter, useSegmentFilter, SegmentFilterBar, FilterRuleDef } from '@/components/PageShell';

// ── Fréquences ───────────────────────────────────────────────────────────────
const FREQUENCIES: { value: string; label: string }[] = [
  { value: 'MONTHLY',     label: 'Mensuelle'      },
  { value: 'QUARTERLY',   label: 'Trimestrielle'  },
  { value: 'SEMI_ANNUAL', label: 'Semestrielle'   },
  { value: 'ANNUAL',      label: 'Annuelle'       },
];
const freqLabel = (v: string) => FREQUENCIES.find(f => f.value === v)?.label ?? v;

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt     = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('fr-LU') : '—';
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Lignes ───────────────────────────────────────────────────────────────────
type LineForm = { serviceId: string; description: string; quantity: string; unitPrice: string; unite: string; discountRate: string; lineVatRate: string; };
const emptyLine = (): LineForm => ({ serviceId: '', description: '', quantity: '1', unitPrice: '', unite: '', discountRate: '', lineVatRate: '' });
const lineTotal = (l: LineForm) => { const q = parseFloat(l.quantity)||0; const p = parseFloat(l.unitPrice)||0; const d = parseFloat(l.discountRate)||0; return q * p * (1 - d/100); };

// ── Formulaire ───────────────────────────────────────────────────────────────
const emptyForm = () => ({ companyId: '', frequency: 'MONTHLY', startDate: todayISO(), vatRate: '17', vatMention: '', notes: '', lines: [emptyLine()] });

// ── Filtres segment ───────────────────────────────────────────────────────────
const SEGMENT_DEFS: FilterRuleDef[] = [
  { key: 'number',    label: 'Numéro',           dataType: 'text',   getValue: (s) => s.number },
  { key: 'company',   label: 'Client',            dataType: 'text',   getValue: (s) => s.company?.name ?? '' },
  { key: 'frequency', label: 'Fréquence',         dataType: 'select', options: FREQUENCIES.map(f => ({ value: f.value, label: f.label })), getValue: (s) => s.frequency },
  { key: 'total',     label: 'Montant TTC (€)',   dataType: 'number', getValue: (s) => String(s.total) },
  { key: 'next',      label: 'Prochaine facture', dataType: 'date',   getValue: (s) => s.nextBillingDate?.slice(0, 10) ?? '' },
  { key: 'createdAt', label: 'Date de création',  dataType: 'date',   getValue: (s) => s.createdAt?.slice(0, 10) ?? '' },
];

const FILTERS = [
  { value: '',         label: 'Toutes'    },
  { value: 'ACTIVE',   label: 'Actives'   },
  { value: 'INACTIVE', label: 'Inactives' },
];

const ALL_COLS = [
  { key: 'number',    label: 'Numéro'     },
  { key: 'company',   label: 'Client'     },
  { key: 'frequency', label: 'Fréquence'  },
  { key: 'subtotal',  label: 'HT'         },
  { key: 'total',     label: 'TTC'        },
  { key: 'nextDate',  label: 'Prochaine'  },
  { key: 'createdAt', label: 'Création'   },
  { key: 'status',    label: 'Statut'     },
];

// ── Composant ligne ───────────────────────────────────────────────────────────
function LineRow({ line, idx, onChange, onRemove, canRemove }: {
  line: LineForm; idx: number;
  onChange: (idx: number, k: string, v: string) => void;
  onRemove: (idx: number) => void;
  canRemove: boolean;
}) {
  return (
    <div className="grid gap-2 p-3 rounded-lg" style={{ background: '#FAFAF9', border: `1px solid ${T.border}`, gridTemplateColumns: '1fr 60px 90px 70px 60px 30px' }}>
      <input className={inputClass} placeholder="Description" value={line.description} onChange={e => onChange(idx, 'description', e.target.value)} required />
      <input className={inputClass} placeholder="Qté" type="number" min="0" step="0.01" value={line.quantity} onChange={e => onChange(idx, 'quantity', e.target.value)} />
      <input className={inputClass} placeholder="PU HT" type="number" min="0" step="0.01" value={line.unitPrice} onChange={e => onChange(idx, 'unitPrice', e.target.value)} />
      <input className={inputClass} placeholder="Unité" value={line.unite} onChange={e => onChange(idx, 'unite', e.target.value)} />
      <input className={inputClass} placeholder="Remise%" type="number" min="0" max="100" value={line.discountRate} onChange={e => onChange(idx, 'discountRate', e.target.value)} />
      {canRemove ? (
        <button type="button" onClick={() => onRemove(idx)}
          className="text-red-400 hover:text-red-600 font-bold cursor-pointer">✕</button>
      ) : <span />}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const [list, setList]       = useState<Subscription[]>([]);
  const [compList, setCompList] = useState<Company[]>([]);
  const [filter, setFilter]   = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState(emptyForm());
  const [saving, setSaving]   = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const { sort, toggle: sortToggle, sorted } = useSort(list);
  const { search, setSearch, rules, addRule, removeRule, updateRule, clearRules, clearAll, filtered, activeCount } = useSegmentFilter(sorted, SEGMENT_DEFS);
  const pagination = usePagination(filtered);
  const { visible, toggle: colToggle } = useColumns('subscriptions', ALL_COLS);

  const load = (s?: string) => {
    setLoading(true);
    subscriptions.list(s || undefined).then(setList).finally(() => setLoading(false));
  };
  useEffect(() => { load(); companies.list().then(setCompList); }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setLine = (idx: number, k: string, v: string) =>
    setForm(f => { const ls = [...f.lines]; ls[idx] = { ...ls[idx], [k]: v }; return { ...f, lines: ls }; });
  const addLine  = () => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }));
  const removeLine = (idx: number) => setForm(f => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));

  // ── Totaux calculés ──────────────────────────────────────────────────────
  const vatRate  = parseFloat(form.vatRate) || 0;
  const subtotal = form.lines.reduce((s, l) => s + lineTotal(l), 0);
  const vatAmt   = subtotal * vatRate / 100;
  const total    = subtotal + vatAmt;

  // ── Soumission ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await subscriptions.create({
        companyId:  form.companyId,
        frequency:  form.frequency,
        startDate:  form.startDate,
        vatRate:    vatRate,
        vatMention: form.vatMention || undefined,
        notes:      form.notes || undefined,
        lines: form.lines.map(l => ({
          description:  l.description,
          quantity:     parseFloat(l.quantity) || 1,
          unitPrice:    parseFloat(l.unitPrice) || 0,
          unite:        l.unite || undefined,
          discountRate: parseFloat(l.discountRate) || undefined,
          lineVatRate:  parseFloat(l.lineVatRate) || undefined,
        })),
      } as any);
      setOpen(false); setForm(emptyForm()); load(filter || undefined);
    } finally { setSaving(false); }
  };

  // ── Générer les factures dues ────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await subscriptions.generate();
      if (res.generated === 0) alert('Aucune facture à générer pour aujourd\'hui.');
      else { alert(`${res.generated} facture(s) brouillon générée(s) avec succès !`); load(filter || undefined); }
    } finally { setGenerating(false); }
  };

  // ── Toggle actif/inactif ─────────────────────────────────────────────────
  const toggleStatus = async (s: Subscription) => {
    setToggling(s.id);
    try {
      const updated = s.status === 'ACTIVE'
        ? await subscriptions.deactivate(s.id)
        : await subscriptions.activate(s.id);
      setList(l => l.map(x => x.id === s.id ? { ...x, status: updated.status } : x));
    } finally { setToggling(null); }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Souscriptions"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="text-sm px-4 py-2 rounded-xl font-semibold cursor-pointer transition-colors"
              style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', opacity: generating ? 0.6 : 1 }}
            >
              {generating ? 'Génération…' : '⚡ Générer les factures'}
            </button>
            <AddButton onClick={() => { setForm(emptyForm()); setOpen(true); }} />
          </div>
        }
      />

      <FilterBar filters={FILTERS} value={filter} onChange={v => { setFilter(v); load(v || undefined); }} />
      <SegmentFilterBar search={search} onSearch={setSearch} placeholder="Rechercher une souscription..." defs={SEGMENT_DEFS} rules={rules} addRule={addRule} removeRule={removeRule} updateRule={updateRule} clearRules={clearRules} clearAll={clearAll} activeCount={activeCount} />

      <DataTable loading={loading} empty="Aucune souscription — cliquez sur «+ Ajouter»" sort={sort} onSort={sortToggle}
        headers={[
          ...(visible.includes('number')    ? [{ label: 'Numéro',    key: 'number' }] : []),
          ...(visible.includes('company')   ? [{ label: 'Client',    key: 'company' }] : []),
          ...(visible.includes('frequency') ? [{ label: 'Fréquence' }] : []),
          ...(visible.includes('subtotal')  ? [{ label: 'HT',        align: 'right' as const }] : []),
          ...(visible.includes('total')     ? [{ label: 'TTC',       align: 'right' as const }] : []),
          ...(visible.includes('nextDate')  ? [{ label: 'Prochaine facture' }] : []),
          ...(visible.includes('createdAt') ? [{ label: 'Création',  key: 'createdAt' }] : []),
          ...(visible.includes('status')    ? [{ label: 'Statut' }] : []),
          { label: '', align: 'center' as const },
        ]}>
        {pagination.paged.map((s, i) => {
          const inactive = s.status === 'INACTIVE';
          return (
            <tr key={s.id} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined, opacity: inactive ? 0.6 : 1 }}>
              {visible.includes('number')    && <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: T.copper }}>{s.number}</td>}
              {visible.includes('company')   && <Td>{s.company?.name ?? '—'}</Td>}
              {visible.includes('frequency') && (
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#EFF6FF', color: '#1D6FD8' }}>
                    {freqLabel(s.frequency)}
                  </span>
                </td>
              )}
              {visible.includes('subtotal')  && <td className="px-4 py-3 text-right text-sm" style={{ color: T.dark }}>{fmt(s.subtotal)}</td>}
              {visible.includes('total')     && <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: T.dark }}>{fmt(s.total)}</td>}
              {visible.includes('nextDate')  && <Td>{fmtDate(s.nextBillingDate)}</Td>}
              {visible.includes('createdAt') && <Td>{fmtDate(s.createdAt)}</Td>}
              {visible.includes('status')    && (
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={inactive ? { background: '#F5F5F5', color: '#999' } : { background: '#F0FDF4', color: '#16A34A' }}>
                    {inactive ? 'Inactive' : 'Active'}
                  </span>
                </td>
              )}
              <td className="px-4 py-3 text-center">
                <button onClick={() => toggleStatus(s)} disabled={toggling === s.id}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer"
                  style={inactive
                    ? { color: '#16A34A', borderColor: '#BBF7D0', background: 'transparent', opacity: toggling === s.id ? 0.5 : 1 }
                    : { color: '#DC2626', borderColor: '#FECACA', background: 'transparent', opacity: toggling === s.id ? 0.5 : 1 }}>
                  {inactive ? 'Réactiver' : 'Désactiver'}
                </button>
              </td>
            </tr>
          );
        })}
      </DataTable>

      <TableFooter
        pagination={pagination}
        export={{ getData: () => filtered.map(s => ({ Numéro: s.number, Client: s.company?.name ?? '', Fréquence: freqLabel(s.frequency), 'HT (€)': s.subtotal, 'TVA (€)': s.vatAmount, 'TTC (€)': s.total, 'Prochaine facture': fmtDate(s.nextBillingDate), Statut: s.status === 'ACTIVE' ? 'Active' : 'Inactive' })), filename: 'souscriptions', title: 'Souscriptions' }}
        columnSelector={{ allCols: ALL_COLS, visible, toggle: colToggle }}
      />

      {/* ── Modale création ── */}
      <Modal title="Nouvelle souscription" open={open} onClose={() => setOpen(false)} wide>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Client + Fréquence */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Client" required>
              <select className={selectClass} value={form.companyId} onChange={e => set('companyId', e.target.value)} required>
                <option value="">— Choisir un client —</option>
                {compList.filter(c => c.isActive !== false).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Fréquence de facturation" required>
              <select className={selectClass} value={form.frequency} onChange={e => set('frequency', e.target.value)}>
                {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </FormField>
          </div>

          {/* Date de début */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date de début (1ère facture le)" required>
              <input type="date" className={inputClass} value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
            </FormField>
            <FormField label="TVA (%)">
              <input type="number" className={inputClass} value={form.vatRate} min="0" max="100"
                onChange={e => set('vatRate', e.target.value)} />
            </FormField>
          </div>

          {/* Lignes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: T.muted }}>Lignes</label>
              <div className="grid gap-1 text-xs" style={{ gridTemplateColumns: '1fr 60px 90px 70px 60px 30px', paddingRight: '30px' }}>
                {['Description', 'Qté', 'Prix HT', 'Unité', 'Remise%'].map(h => (
                  <span key={h} className="font-semibold" style={{ color: T.muted }}>{h}</span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {form.lines.map((l, idx) => (
                <LineRow key={idx} line={l} idx={idx} onChange={setLine} onRemove={removeLine} canRemove={form.lines.length > 1} />
              ))}
            </div>
            <button type="button" onClick={addLine}
              className="mt-2 text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
              style={{ background: T.copper + '18', color: T.copper, border: `1px solid ${T.copper}40` }}>
              + Ajouter une ligne
            </button>
          </div>

          {/* Totaux */}
          <div className="rounded-xl p-4 space-y-1.5 text-sm" style={{ background: T.head, border: `1px solid ${T.border}` }}>
            <div className="flex justify-between"><span style={{ color: T.muted }}>Sous-total HT</span><span style={{ color: T.dark }}>{fmt(subtotal)}</span></div>
            <div className="flex justify-between"><span style={{ color: T.muted }}>TVA ({form.vatRate}%)</span><span style={{ color: T.dark }}>{fmt(vatAmt)}</span></div>
            <div className="flex justify-between font-bold text-base pt-1" style={{ borderTop: `1px solid ${T.border}` }}>
              <span style={{ color: T.dark }}>Total TTC</span><span style={{ color: T.copper }}>{fmt(total)}</span>
            </div>
          </div>

          {/* Mention TVA + Notes */}
          <FormField label="Mention TVA">
            <input className={inputClass} placeholder="Ex: Autoliquidation — Art. 44 Dir. 2006/112/CE" value={form.vatMention} onChange={e => set('vatMention', e.target.value)} />
          </FormField>
          <FormField label="Notes">
            <textarea className={inputClass} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </FormField>

          <FormActions onCancel={() => setOpen(false)} saving={saving} label="Créer la souscription" />
        </form>
      </Modal>
    </div>
  );
}
