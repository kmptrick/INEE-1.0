'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { invoicing, companies, Quote, Company, Service } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, FilterBar, DataTable, Td, StatusBadge, FormActions, usePagination, useSort, useColumns, TableFooter, useSegmentFilter, SegmentFilterBar, FilterRuleDef } from '@/components/PageShell';
import { NotesWidget } from '@/components/NotesWidget';
import { ServicePicker } from '@/components/ServicePicker';
import { computeVat, LU_VAT_RATES } from '@/lib/vat-rules';
import type { IneeDocumentProps } from '@/components/IneeDocumentPdf';

const PdfDownloadButton = dynamic(
  () => import('@/components/PdfDownloadButton').then(m => m.PdfDownloadButton),
  { ssr: false }
) as React.ComponentType<IneeDocumentProps & { filename: string }>;

const STATUS_ST: Record<string, { bg: string; color: string }> = {
  DRAFT:    { bg: '#F5F5F5', color: '#666'    },
  SENT:     { bg: '#EFF6FF', color: '#1D6FD8' },
  ACCEPTED: { bg: '#F0FDF4', color: '#16A34A' },
  REJECTED: { bg: '#FEF2F2', color: '#DC2626' },
  EXPIRED:  { bg: '#FFF7ED', color: '#C2410C' },
};
const STATUS_FR: Record<string, string> = { DRAFT: 'Brouillon', SENT: 'Envoyé', ACCEPTED: 'Accepté', REJECTED: 'Refusé', EXPIRED: 'Expiré' };
const FILTERS = [
  { value: '',         label: 'Tous'       },
  { value: 'DRAFT',    label: 'Brouillon'  },
  { value: 'SENT',     label: 'Envoyés'    },
  { value: 'ACCEPTED', label: 'Acceptés'   },
  { value: 'REJECTED', label: 'Refusés'    },
];

const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);
const today = () => new Date().toLocaleDateString('fr-LU');
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('fr-LU') : '—';

type LineForm = { serviceId: string; description: string; quantity: string; unitPrice: string; unite: string; discountRate: string; lineVatRate: string; periodStart: string; periodEnd: string; };
const emptyLine = (): LineForm => ({ serviceId: '', description: '', quantity: '1', unitPrice: '', unite: '', discountRate: '', lineVatRate: '', periodStart: '', periodEnd: '' });
const emptyForm = () => ({ companyId: '', vatRate: '17', vatMention: '', notes: '', remarque: '', lines: [emptyLine()] });
const lineTotal = (l: LineForm) => { const q = parseFloat(l.quantity)||0; const p = parseFloat(l.unitPrice)||0; const d = parseFloat(l.discountRate)||0; return q * p * (1 - d/100); };
function calcVatGroups(lines: LineForm[], defaultVatRate: number) {
  const groups: Record<string, number> = {};
  let subtotal = 0;
  for (const l of lines) { const lt = lineTotal(l); subtotal += lt; const rate = String(parseFloat(l.lineVatRate)||defaultVatRate); groups[rate]=(groups[rate]||0)+lt; }
  subtotal = Math.round(subtotal*100)/100;
  const vatTotal = Math.round(Object.entries(groups).reduce((s,[r,b])=>s+b*Number(r)/100,0)*100)/100;
  return { subtotal, vatGroups: groups, vatTotal, total: Math.round((subtotal+vatTotal)*100)/100 };
}
const SEGMENT_DEFS_Q: FilterRuleDef[] = [
  { key: 'number',    label: 'Numéro',          dataType: 'text',   getValue: (q) => q.number },
  { key: 'company',   label: 'Client',           dataType: 'text',   getValue: (q) => q.company?.name ?? '' },
  { key: 'subtotal',  label: 'Montant HT (€)',   dataType: 'number', getValue: (q) => String(q.subtotal) },
  { key: 'total',     label: 'Montant TTC (€)',  dataType: 'number', getValue: (q) => String(q.total) },
  { key: 'createdAt', label: 'Date de création', dataType: 'date',   getValue: (q) => q.createdAt?.slice(0, 10) ?? '' },
];

const ALL_COLS_Q = [
  { key: 'number',    label: 'Numéro'  },
  { key: 'company',   label: 'Client'  },
  { key: 'subtotal',  label: 'HT'      },
  { key: 'vatAmount', label: 'TVA'     },
  { key: 'total',     label: 'TTC'     },
  { key: 'createdAt', label: 'Création'},
  { key: 'status',    label: 'Statut'  },
];

function ActionBtn({ label, color, bg, border, onClick, disabled }: { label: string; color: string; bg: string; border: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{ color, background: bg, border: `1px solid ${border}`, opacity: disabled ? 0.5 : 1 }}>
      {label}
    </button>
  );
}

export default function QuotesPage() {
  const [list, setList] = useState<Quote[]>([]);
  const [compList, setCompList] = useState<Company[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [fullQuotes, setFullQuotes] = useState<Record<string, Quote>>({});
  const { sort, toggle: sortToggle, sorted } = useSort(list);
  const { search, setSearch, rules, addRule, removeRule, updateRule, clearRules, clearAll, filtered, activeCount } = useSegmentFilter(sorted, SEGMENT_DEFS_Q);
  const pagination = usePagination(filtered);
  const { visible, toggle: colToggle } = useColumns('quotes', ALL_COLS_Q);

  // Detail / action modal
  const [viewItem, setViewItem] = useState<Quote | null>(null);
  const [actioning, setActioning] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertDueDate, setConvertDueDate] = useState('');
  const [converting, setConverting] = useState(false);

  const load = (s?: string) => { setLoading(true); invoicing.quotes.list(s || undefined).then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); companies.list().then(setCompList); }, []);
  useEffect(() => { list.forEach(q => { if (!fullQuotes[q.id]) invoicing.quotes.get(q.id).then(full => setFullQuotes(p => ({ ...p, [q.id]: full }))); }); }, [list]);

  const openView = (q: Quote) => setViewItem(fullQuotes[q.id] ?? q);

  const updateStatus = async (q: Quote, status: string) => {
    setActioning(true);
    try {
      const updated = await invoicing.quotes.update(q.id, {
        status,
        vatRate: q.vatRate,
        vatMention: q.vatMention,
        notes: q.notes,
        lines: (q.lines ?? []).map(l => ({
          ...(l.serviceId ? { serviceId: l.serviceId } : {}),
          description: l.description, quantity: l.quantity, unitPrice: l.unitPrice,
          ...(l.unite ? { unite: l.unite } : {}),
        })),
      } as any);
      setFullQuotes(p => ({ ...p, [q.id]: updated }));
      setViewItem(updated);
      load(filter || undefined);
    } finally { setActioning(false); }
  };

  const convertToInvoice = async () => {
    if (!viewItem) return;
    setConverting(true);
    try {
      await invoicing.invoices.fromQuote(viewItem.id, convertDueDate || undefined);
      setConvertOpen(false);
      setViewItem(null);
      load(filter || undefined);
    } finally { setConverting(false); }
  };

  const setField = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setLine = (i: number, k: string, v: string) => setForm(f => { const l = [...f.lines]; l[i] = { ...l[i], [k]: v }; return { ...f, lines: l }; });
  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }));
  const removeLine = (i: number) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));

  const onClientChange = (companyId: string) => {
    const client = compList.find(c => c.id === companyId) ?? null;
    const vat = computeVat(client, parseFloat(form.vatRate) || 17);
    setForm(f => ({ ...f, companyId, vatRate: String(vat.rate), vatMention: vat.mention ?? '' }));
  };

  const pickService = (i: number, s: Service) => {
    setForm(f => {
      const lines = [...f.lines];
      lines[i] = { serviceId: s.id, description: s.description, quantity: '1', unitPrice: String(s.prixHT), unite: s.unite ?? '', discountRate: '', lineVatRate: '', periodStart: '', periodEnd: '' };
      const client = compList.find(c => c.id === f.companyId) ?? null;
      const vat = computeVat(client, s.vatRate ?? 17);
      return { ...f, lines, vatRate: String(vat.rate), vatMention: vat.mention ?? '' };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const data: any = {
        vatRate: parseFloat(form.vatRate) || 0,
        vatMention: form.vatMention || undefined, notes: form.notes,
        lines: form.lines.map(l => ({
          ...(l.serviceId ? { serviceId: l.serviceId } : {}),
          description: l.description, quantity: parseFloat(l.quantity) || 1,
          unitPrice: parseFloat(l.unitPrice) || 0, ...(l.unite ? { unite: l.unite } : {}),
          ...(l.discountRate ? { discountRate: parseFloat(l.discountRate) } : {}),
          ...(l.lineVatRate ? { lineVatRate: parseFloat(l.lineVatRate) } : {}),
          ...(l.periodStart ? { periodStart: l.periodStart } : {}),
          ...(l.periodEnd ? { periodEnd: l.periodEnd } : {}),
        })),
      };
      if (form.companyId) data.companyId = form.companyId;
      await invoicing.quotes.create(data); setOpen(false); setForm(emptyForm()); load(filter || undefined);
    } finally { setSaving(false); }
  };

  const selectedClient = compList.find(c => c.id === form.companyId) ?? null;
  const vatResult = computeVat(selectedClient, parseFloat(form.vatRate) || 17);
  const formTotals = open ? calcVatGroups(form.lines, parseFloat(form.vatRate) || 17) : { subtotal: 0, vatGroups: {} as Record<string, number>, vatTotal: 0, total: 0 };

  const buildPdfProps = (q: Quote): IneeDocumentProps & { filename: string } => ({
    type: 'DEVIS', number: q.number, date: today(), status: q.status,
    company: q.company ? { name: q.company.name } : undefined,
    lines: (q.lines ?? []).map(l => ({ description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, total: l.total })),
    subtotal: q.subtotal, vatRate: q.vatRate, vatAmount: q.vatAmount, total: q.total,
    vatMention: q.vatMention, filename: `${q.number}.pdf`,
  });

  return (
    <div className="p-6">
      <PageHeader title="Devis" action={<AddButton onClick={() => setOpen(true)} />} />
      <FilterBar filters={FILTERS} active={filter} onChange={v => { setFilter(v); load(v || undefined); }} />
      <SegmentFilterBar search={search} onSearch={setSearch} placeholder="Rechercher un devis..." defs={SEGMENT_DEFS_Q} rules={rules} addRule={addRule} removeRule={removeRule} updateRule={updateRule} clearRules={clearRules} clearAll={clearAll} activeCount={activeCount} />

      <DataTable loading={loading} empty="Aucun devis" sort={sort} onSort={sortToggle}
        headers={[
          ...(visible.includes('number')   ? [{ label: 'Numéro',  key: 'number' }] : []),
          ...(visible.includes('company')  ? [{ label: 'Client' }] : []),
          ...(visible.includes('subtotal') ? [{ label: 'HT',      key: 'subtotal',  align: 'right' as const }] : []),
          ...(visible.includes('vatAmount')? [{ label: 'TVA',     key: 'vatAmount', align: 'right' as const }] : []),
          ...(visible.includes('total')     ? [{ label: 'TTC',      key: 'total',     align: 'right' as const }] : []),
          ...(visible.includes('createdAt') ? [{ label: 'Création', key: 'createdAt' }] : []),
          ...(visible.includes('status')    ? [{ label: 'Statut',   key: 'status',    align: 'center' as const }] : []),
          { label: '', align: 'center' as const },
        ]}>
        {pagination.paged.map((q, i) => {
          const full = fullQuotes[q.id] ?? q;
          const ss = STATUS_ST[q.status] ?? { bg: '#F5F5F5', color: '#888' };
          return (
            <tr key={q.id} onClick={() => openView(q)} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = T.copperBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {visible.includes('number')    && <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: T.dark }}>{q.number}</td>}
              {visible.includes('company')   && <Td>{q.company?.name ?? '—'}</Td>}
              {visible.includes('subtotal')  && <td className="px-4 py-3 text-right text-sm" style={{ color: T.dark }}>{fmt(q.subtotal)}</td>}
              {visible.includes('vatAmount') && <td className="px-4 py-3 text-right text-sm" style={{ color: T.muted }}>{fmt(q.vatAmount)}</td>}
              {visible.includes('total')     && <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: T.dark }}>{fmt(q.total)}</td>}
              {visible.includes('createdAt') && <Td>{q.createdAt ? new Date(q.createdAt).toLocaleDateString('fr-LU') : '—'}</Td>}
              {visible.includes('status')    && <td className="px-4 py-3 text-center"><StatusBadge label={STATUS_FR[q.status] ?? q.status} bg={ss.bg} color={ss.color} /></td>}
              <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                <PdfDownloadButton {...buildPdfProps(full)} />
              </td>
            </tr>
          );
        })}
      </DataTable>
      <TableFooter pagination={pagination} export={{ getData: () => filtered.map(q => ({ Numéro: q.number, Client: q.company?.name ?? '', 'HT (€)': q.subtotal, 'TVA (€)': q.vatAmount, 'TTC (€)': q.total, Statut: STATUS_FR[q.status] ?? q.status, Validité: (q as any).validUntil ? new Date((q as any).validUntil).toLocaleDateString('fr-LU') : '' })), filename: 'devis', title: 'Devis' }} columnSelector={{ allCols: ALL_COLS_Q, visible, toggle: colToggle }} />

      {/* ── Detail / Actions modal ── */}
      {viewItem && (
        <Modal title={`Devis ${viewItem.number}`} open={!!viewItem} onClose={() => setViewItem(null)}>
          <div className="space-y-4">
            {/* Status + actions */}
            <div className="flex flex-wrap items-center gap-2 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <NotesWidget value={viewItem.notes ?? ''} onChange={v => setViewItem(d => d ? { ...d, notes: v } : d)} />
              {(() => { const ss = STATUS_ST[viewItem.status] ?? { bg: '#F5F5F5', color: '#888' }; return <StatusBadge label={STATUS_FR[viewItem.status] ?? viewItem.status} bg={ss.bg} color={ss.color} />; })()}
              <div className="flex flex-wrap gap-2 ml-auto">
                <PdfDownloadButton {...buildPdfProps(viewItem)} />
                {viewItem.status === 'DRAFT' && (
                  <ActionBtn label="Marquer envoyé" color="#1D6FD8" bg="#EFF6FF" border="#BFDBFE" onClick={() => updateStatus(viewItem, 'SENT')} disabled={actioning} />
                )}
                {viewItem.status === 'SENT' && (<>
                  <ActionBtn label="Accepter" color="#16A34A" bg="#F0FDF4" border="#BBF7D0" onClick={() => updateStatus(viewItem, 'ACCEPTED')} disabled={actioning} />
                  <ActionBtn label="Refuser" color="#DC2626" bg="#FEF2F2" border="#FECACA" onClick={() => updateStatus(viewItem, 'REJECTED')} disabled={actioning} />
                  <ActionBtn label="Expiré" color="#C2410C" bg="#FFF7ED" border="#FED7AA" onClick={() => updateStatus(viewItem, 'EXPIRED')} disabled={actioning} />
                </>)}
                {viewItem.status === 'ACCEPTED' && (
                  <ActionBtn label="Convertir en facture" color="#FFF" bg={T.copper} border={T.copper} onClick={() => { setConvertDueDate(''); setConvertOpen(true); }} disabled={actioning} />
                )}
                {viewItem.status === 'DRAFT' && (
                  <ActionBtn label="Remettre en brouillon" color={T.muted} bg="#F5F5F5" border={T.border} onClick={() => updateStatus(viewItem, 'DRAFT')} disabled={actioning} />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div><span style={{ color: T.muted }}>Client : </span><span className="font-semibold" style={{ color: T.dark }}>{viewItem.company?.name ?? '—'}</span></div>
              <div><span style={{ color: T.muted }}>TVA : </span><span className="font-semibold" style={{ color: T.dark }}>{viewItem.vatRate}%</span></div>
            </div>

            {/* Lines */}
            {(viewItem.lines ?? []).length > 0 && (
              <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                <table className="w-full text-xs">
                  <thead style={{ background: T.head }}>
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: T.muted }}>Description</th>
                      <th className="text-center px-3 py-2 font-semibold" style={{ color: T.muted }}>Qté</th>
                      <th className="text-right px-3 py-2 font-semibold" style={{ color: T.muted }}>Prix HT</th>
                      <th className="text-right px-3 py-2 font-semibold" style={{ color: T.muted }}>Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewItem.lines!.map((l, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${T.rowDiv}` }}>
                        <td className="px-3 py-2" style={{ color: T.dark }}>{l.description}</td>
                        <td className="px-3 py-2 text-center" style={{ color: T.muted }}>{l.quantity}</td>
                        <td className="px-3 py-2 text-right" style={{ color: T.muted }}>{fmt(l.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-semibold" style={{ color: T.dark }}>{fmt(l.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-52 space-y-1 text-sm">
                <div className="flex justify-between"><span style={{ color: T.muted }}>HT</span><span style={{ color: T.dark }}>{fmt(viewItem.subtotal)}</span></div>
                <div className="flex justify-between"><span style={{ color: T.muted }}>TVA {viewItem.vatRate}%</span><span style={{ color: T.muted }}>{fmt(viewItem.vatAmount)}</span></div>
                <div className="flex justify-between font-bold pt-1" style={{ borderTop: `1px solid ${T.border}`, color: T.dark }}>
                  <span>Total TTC</span><span>{fmt(viewItem.total)}</span>
                </div>
              </div>
            </div>

            {viewItem.vatMention && (
              <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <span className="font-semibold" style={{ color: '#92400E' }}>Mention légale TVA : </span>
                <span style={{ color: '#78350F' }}>{viewItem.vatMention}</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Convertir en facture ── */}
      <Modal title="Convertir en facture" open={convertOpen} onClose={() => setConvertOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: T.muted }}>Le devis <strong style={{ color: T.dark }}>{viewItem?.number}</strong> sera converti en facture.</p>
          <FormField label="Date d&apos;échéance (optionnel)">
            <input type="date" className={inputClass} value={convertDueDate} onChange={e => setConvertDueDate(e.target.value)} />
          </FormField>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setConvertOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium" style={{ border: `1px solid ${T.border}`, color: T.muted }}>Annuler</button>
            <button onClick={convertToInvoice} disabled={converting} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: T.copper }}>
              {converting ? 'Conversion...' : 'Convertir'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Nouveau devis ── */}
      <Modal title="Nouveau devis" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Client">
            <select className={selectClass} value={form.companyId} onChange={e => onClientChange(e.target.value)}>
              <option value="">— Aucun —</option>
              {compList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>

          {vatResult.mention && (
            <div className="rounded-lg px-3 py-2.5 text-xs" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
              <span className="font-semibold" style={{ color: T.dark }}>{vatResult.label}</span>
              <span className="block mt-0.5" style={{ color: '#92400E' }}>Mention : «{vatResult.mention}»</span>
              {vatResult.regime === 'EU_B2B' && selectedClient && !selectedClient.vatNumber && (
                <span className="block mt-0.5 font-semibold" style={{ color: '#DC2626' }}>N° TVA client requis pour l&apos;autoliquidation</span>
              )}
            </div>
          )}


          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A3020' }}>Lignes</label>
              <button type="button" onClick={addLine} className="text-xs font-semibold" style={{ color: T.copper }}>+ Ajouter ligne</button>
            </div>
            <div className="space-y-2">
              {form.lines.map((l, i) => (
                <div key={i}>
                  <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 64px 88px 32px 24px' }}>
                    <input placeholder="Description" className={inputClass} value={l.description} onChange={e => setLine(i, 'description', e.target.value)} required />
                    <input type="number" min="0" step="0.01" placeholder="Qté" className={inputClass} value={l.quantity} onChange={e => setLine(i, 'quantity', e.target.value)} />
                    <input type="number" min="0" step="0.01" placeholder="Prix HT" className={inputClass} value={l.unitPrice} onChange={e => setLine(i, 'unitPrice', e.target.value)} required />
                    <ServicePicker onSelect={s => pickService(i, s)} />
                    {form.lines.length > 1 && <button type="button" onClick={() => removeLine(i)} className="text-lg leading-none" style={{ color: '#CCC' }}>✕</button>}
                  </div>
                  {l.unite && <div className="text-xs mt-0.5 pl-1" style={{ color: T.muted }}>Unité : {l.unite}</div>}
                  {l.serviceId && <div className="text-xs pl-1" style={{ color: T.copper }}>Prestation liée au catalogue</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Totaux multi-TVA */}
          <div className="rounded-xl p-4 space-y-1.5 text-sm" style={{ background: T.head, border: `1px solid ${T.border}` }}>
            <div className="flex justify-between"><span style={{ color: T.muted }}>Sous-total HT</span><span style={{ color: T.dark }}>{fmt(formTotals.subtotal)}</span></div>
            {Object.entries(formTotals.vatGroups).sort((a, b) => Number(a[0]) - Number(b[0])).map(([rate, base]) => (
              <div key={rate} className="flex justify-between"><span style={{ color: T.muted }}>TVA {rate}%</span><span style={{ color: T.dark }}>{fmt(Math.round(base * Number(rate) / 100 * 100) / 100)}</span></div>
            ))}
            <div className="flex justify-between font-bold text-base pt-1" style={{ borderTop: `1px solid ${T.border}` }}>
              <span style={{ color: T.dark }}>Total TTC</span><span style={{ color: T.copper }}>{fmt(formTotals.total)}</span>
            </div>
          </div>

          <FormField label="Notes"><textarea className={inputClass} rows={2} value={form.notes} onChange={e => setField('notes', e.target.value)} /></FormField>
          <FormField label="Remarque"><textarea className={inputClass} rows={2} value={form.remarque} onChange={e => setField('remarque', e.target.value)} /></FormField>
          <FormActions onCancel={() => setOpen(false)} saving={saving} />
        </form>
      </Modal>
    </div>
  );
}
