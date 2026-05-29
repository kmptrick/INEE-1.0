'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { invoicing, companies, creditNotes, Invoice, Company, Service } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, FilterBar, DataTable, Td, StatusBadge, FormActions, usePagination, useSort, useColumns, TableFooter } from '@/components/PageShell';
import { NotesWidget } from '@/components/NotesWidget';
import { ServicePicker } from '@/components/ServicePicker';
import { computeVat, LU_VAT_RATES } from '@/lib/vat-rules';
import type { IneeDocumentProps } from '@/components/IneeDocumentPdf';

const PdfDownloadButton = dynamic(
  () => import('@/components/PdfDownloadButton').then(m => m.PdfDownloadButton),
  { ssr: false }
) as React.ComponentType<IneeDocumentProps & { filename: string }>;

const STATUS_ST: Record<string, { bg: string; color: string }> = {
  DRAFT:     { bg: '#F5F5F5', color: '#666'    },
  SENT:      { bg: '#EFF6FF', color: '#1D6FD8' },
  PAID:      { bg: '#F0FDF4', color: '#16A34A' },
  OVERDUE:   { bg: '#FEF2F2', color: '#DC2626' },
  CANCELLED: { bg: '#F5F5F5', color: '#999'    },
};
const STATUS_FR: Record<string, string> = { DRAFT: 'Brouillon', SENT: 'Envoyée', PAID: 'Payée', OVERDUE: 'En retard', CANCELLED: 'Annulée' };
const FILTERS = [
  { value: '',        label: 'Toutes'     },
  { value: 'DRAFT',   label: 'Brouillon'  },
  { value: 'SENT',    label: 'Envoyées'   },
  { value: 'PAID',    label: 'Payées'     },
  { value: 'OVERDUE', label: 'En retard'  },
];

const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);
const today = () => new Date().toLocaleDateString('fr-LU');
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('fr-LU') : undefined;

type LineForm = { serviceId: string; description: string; quantity: string; unitPrice: string; unite: string; discountRate: string; lineVatRate: string; periodStart: string; periodEnd: string; };
const emptyLine = (): LineForm => ({ serviceId: '', description: '', quantity: '1', unitPrice: '', unite: '', discountRate: '', lineVatRate: '', periodStart: '', periodEnd: '' });
const emptyForm = () => ({ companyId: '', vatRate: '17', vatMention: '', dueDate: '', notes: '', lines: [emptyLine()] });
const lineTotal = (l: LineForm) => { const q = parseFloat(l.quantity)||0; const p = parseFloat(l.unitPrice)||0; const d = parseFloat(l.discountRate)||0; return q * p * (1 - d/100); };
const ALL_COLS_INV = [
  { key: 'number', label: 'Numéro' }, { key: 'company', label: 'Client' },
  { key: 'subtotal', label: 'HT' }, { key: 'vatAmount', label: 'TVA' },
  { key: 'total', label: 'TTC' }, { key: 'paidAmount', label: 'Payé' },
  { key: 'status', label: 'Statut' },
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

export default function InvoicesPage() {
  const router = useRouter();
  const [list, setList] = useState<Invoice[]>([]);
  const [compList, setCompList] = useState<Company[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [fullInvoices, setFullInvoices] = useState<Record<string, Invoice>>({});
  const { sort, toggle: sortToggle, sorted } = useSort(list, null);
  const pagination = usePagination(sorted);
  const { visible, toggle: colToggle } = useColumns('invoices', ALL_COLS_INV);

  // Detail / action modal
  const [viewItem, setViewItem] = useState<Invoice | null>(null);
  const [actioning, setActioning] = useState(false);

  const load = (s?: string) => { setLoading(true); invoicing.invoices.list(s || undefined).then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); companies.list().then(setCompList); }, []);
  useEffect(() => { list.forEach(inv => { if (!fullInvoices[inv.id]) invoicing.invoices.get(inv.id).then(full => setFullInvoices(p => ({ ...p, [inv.id]: full }))); }); }, [list]);

  const openView = (inv: Invoice) => setViewItem(fullInvoices[inv.id] ?? inv);

  const updateStatus = async (inv: Invoice, status: string) => {
    setActioning(true);
    try {
      const updated = await invoicing.invoices.update(inv.id, {
        status,
        vatRate: inv.vatRate,
        vatMention: inv.vatMention,
        notes: inv.notes,
        lines: (inv.lines ?? []).map(l => ({
          ...(l.serviceId ? { serviceId: l.serviceId } : {}),
          description: l.description, quantity: l.quantity, unitPrice: l.unitPrice,
          ...(l.unite ? { unite: l.unite } : {}),
        })),
      } as any);
      setFullInvoices(p => ({ ...p, [inv.id]: updated }));
      setViewItem(updated);
      load(filter || undefined);
    } finally { setActioning(false); }
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
      lines[i] = { serviceId: s.id, description: s.description, quantity: '1', unitPrice: String(s.prixHT), unite: s.unite ?? '' };
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
      if (form.dueDate) data.dueDate = form.dueDate;
      await invoicing.invoices.create(data); setOpen(false); setForm(emptyForm()); load(filter || undefined);
    } finally { setSaving(false); }
  };

  const selectedClient = compList.find(c => c.id === form.companyId) ?? null;
  const vatResult = computeVat(selectedClient, parseFloat(form.vatRate) || 17);

  const buildPdfProps = (inv: Invoice): IneeDocumentProps & { filename: string } => ({
    type: 'FACTURE', number: inv.number, date: today(), dueDate: fmtDate(inv.dueDate), status: inv.status,
    company: inv.company ? { name: inv.company.name } : undefined,
    lines: (inv.lines ?? []).map(l => ({ description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, total: l.total })),
    subtotal: inv.subtotal, vatRate: inv.vatRate, vatAmount: inv.vatAmount, total: inv.total,
    vatMention: inv.vatMention, filename: `${inv.number}.pdf`,
  });

  return (
    <div className="p-6">
      <PageHeader title="Factures" action={<AddButton onClick={() => setOpen(true)} />} />
      <FilterBar filters={FILTERS} active={filter} onChange={v => { setFilter(v); load(v || undefined); }} />

      <DataTable loading={loading} empty="Aucune facture" sort={sort} onSort={sortToggle}
        headers={[
          ...(visible.includes('number')    ? [{ label: 'Numéro',  key: 'number' }] : []),
          ...(visible.includes('company')   ? [{ label: 'Client' }] : []),
          ...(visible.includes('subtotal')  ? [{ label: 'HT',     key: 'subtotal',  align: 'right' as const }] : []),
          ...(visible.includes('vatAmount') ? [{ label: 'TVA',    key: 'vatAmount', align: 'right' as const }] : []),
          ...(visible.includes('total')     ? [{ label: 'TTC',    key: 'total',     align: 'right' as const }] : []),
          ...(visible.includes('paidAmount')? [{ label: 'Payé',   key: 'paidAmount',align: 'right' as const }] : []),
          ...(visible.includes('status')    ? [{ label: 'Statut', key: 'status',    align: 'center' as const }] : []),
          { label: '', align: 'center' as const },
        ]}>
        {pagination.paged.map((inv, i) => {
          const full = fullInvoices[inv.id] ?? inv;
          const ss = STATUS_ST[inv.status] ?? { bg: '#F5F5F5', color: '#888' };
          return (
            <tr key={inv.id} onClick={() => openView(inv)} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = T.copperBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {visible.includes('number')     && <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: T.dark }}>{inv.number}</td>}
              {visible.includes('company')    && <Td>{inv.company?.name ?? '—'}</Td>}
              {visible.includes('subtotal')   && <td className="px-4 py-3 text-right text-sm" style={{ color: T.dark }}>{fmt(inv.subtotal)}</td>}
              {visible.includes('vatAmount')  && <td className="px-4 py-3 text-right text-sm" style={{ color: T.muted }}>{fmt(inv.vatAmount)}</td>}
              {visible.includes('total')      && <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: T.dark }}>{fmt(inv.total)}</td>}
              {visible.includes('paidAmount') && <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#16A34A' }}>{fmt(inv.paidAmount)}</td>}
              {visible.includes('status')     && <td className="px-4 py-3 text-center"><StatusBadge label={STATUS_FR[inv.status] ?? inv.status} bg={ss.bg} color={ss.color} /></td>}
              <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                <PdfDownloadButton {...buildPdfProps(full)} />
              </td>
            </tr>
          );
        })}
      </DataTable>
      <TableFooter pagination={pagination} export={{ getData: () => sorted.map(inv => ({ Numéro: inv.number, Client: inv.company?.name ?? '', 'HT (€)': inv.subtotal, 'TVA (€)': inv.vatAmount, 'TTC (€)': inv.total, Statut: STATUS_FR[inv.status] ?? inv.status, Échéance: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('fr-LU') : '' })), filename: 'factures', title: 'Factures' }} columnSelector={{ allCols: ALL_COLS_INV, visible, toggle: colToggle }} />

      {/* ── Detail / Actions modal ── */}
      {viewItem && (
        <Modal title={`Facture ${viewItem.number}`} open={!!viewItem} onClose={() => setViewItem(null)}>
          <div className="space-y-4">
            {/* Status + actions */}
            <div className="flex flex-wrap items-center gap-2 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <NotesWidget value={viewItem.notes ?? ''} onChange={v => setViewItem(d => d ? { ...d, notes: v } : d)} />
              {(() => { const ss = STATUS_ST[viewItem.status] ?? { bg: '#F5F5F5', color: '#888' }; return <StatusBadge label={STATUS_FR[viewItem.status] ?? viewItem.status} bg={ss.bg} color={ss.color} />; })()}
              <div className="flex flex-wrap gap-2 ml-auto">
                <PdfDownloadButton {...buildPdfProps(viewItem)} />
                <ActionBtn label="Note de crédit" color="#7C3AED" bg="#F5F3FF" border="#DDD6FE"
                  onClick={() => router.push(`/dashboard/credit-notes?invoiceId=${viewItem.id}&invoiceNumber=${encodeURIComponent(viewItem.number)}`)}
                  disabled={actioning} />
                {viewItem.status === 'DRAFT' && (
                  <ActionBtn label="Marquer envoyée" color="#1D6FD8" bg="#EFF6FF" border="#BFDBFE" onClick={() => updateStatus(viewItem, 'SENT')} disabled={actioning} />
                )}
                {(viewItem.status === 'SENT' || viewItem.status === 'OVERDUE') && (
                  <ActionBtn label="Marquer payée" color="#16A34A" bg="#F0FDF4" border="#BBF7D0" onClick={() => updateStatus(viewItem, 'PAID')} disabled={actioning} />
                )}
                {viewItem.status === 'SENT' && (
                  <ActionBtn label="Marquer en retard" color="#DC2626" bg="#FEF2F2" border="#FECACA" onClick={() => updateStatus(viewItem, 'OVERDUE')} disabled={actioning} />
                )}
                {(viewItem.status === 'DRAFT' || viewItem.status === 'SENT') && (
                  <ActionBtn label="Annuler" color={T.muted} bg="#F5F5F5" border={T.border} onClick={() => updateStatus(viewItem, 'CANCELLED')} disabled={actioning} />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div><span style={{ color: T.muted }}>Client : </span><span className="font-semibold" style={{ color: T.dark }}>{viewItem.company?.name ?? '—'}</span></div>
              <div><span style={{ color: T.muted }}>Échéance : </span><span className="font-semibold" style={{ color: T.dark }}>{fmtDate(viewItem.dueDate) ?? '—'}</span></div>
              <div><span style={{ color: T.muted }}>TVA : </span><span className="font-semibold" style={{ color: T.dark }}>{viewItem.vatRate}%</span></div>
              <div><span style={{ color: T.muted }}>Montant payé : </span><span className="font-semibold" style={{ color: '#16A34A' }}>{fmt(viewItem.paidAmount)}</span></div>
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
                {viewItem.paidAmount > 0 && (
                  <div className="flex justify-between font-semibold" style={{ color: '#16A34A' }}>
                    <span>Reste à payer</span><span>{fmt(viewItem.total - viewItem.paidAmount)}</span>
                  </div>
                )}
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

      {/* ── Nouvelle facture ── */}
      <Modal title="Nouvelle facture" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Client">
            <select className={selectClass} value={form.companyId} onChange={e => onClientChange(e.target.value)}>
              <option value="">— Aucun —</option>
              {compList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>

          <div className="rounded-lg px-3 py-2.5 text-xs" style={{ background: vatResult.mention ? '#FEF3C7' : '#F0FDF4', border: `1px solid ${vatResult.mention ? '#FDE68A' : '#BBF7D0'}` }}>
            <span className="font-semibold" style={{ color: T.dark }}>{vatResult.label}</span>
            {vatResult.mention && <span className="block mt-0.5" style={{ color: '#92400E' }}>Mention : «{vatResult.mention}»</span>}
            {vatResult.regime === 'EU_B2B' && selectedClient && !selectedClient.vatNumber && (
              <span className="block mt-0.5 font-semibold" style={{ color: '#DC2626' }}>N° TVA client requis pour l&apos;autoliquidation</span>
            )}
          </div>

          {vatResult.regime === 'LU' && (
            <FormField label="Taux de TVA">
              <select className={selectClass} value={form.vatRate} onChange={e => setField('vatRate', e.target.value)}>
                {LU_VAT_RATES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </FormField>
          )}

          <FormField label="Echéance"><input type="date" className={inputClass} value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} /></FormField>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A3020' }}>Lignes</label>
              <button type="button" onClick={addLine} className="text-xs font-semibold" style={{ color: T.copper }}>+ Ajouter ligne</button>
            </div>
            <div className="space-y-2">
              {form.lines.map((l, i) => (
                <div key={i} className="rounded-lg p-3 space-y-2" style={{ background: T.head, border: `1px solid ${T.border}` }}>
                  <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 64px 88px 32px 24px' }}>
                    <input placeholder="Description" className={inputClass} value={l.description} onChange={e => setLine(i, 'description', e.target.value)} required />
                    <input type="number" min="0" step="0.01" placeholder="Qté" className={inputClass} value={l.quantity} onChange={e => setLine(i, 'quantity', e.target.value)} />
                    <input type="number" min="0" step="0.01" placeholder="Prix HT" className={inputClass} value={l.unitPrice} onChange={e => setLine(i, 'unitPrice', e.target.value)} required />
                    <ServicePicker onSelect={s => pickService(i, s)} />
                    {form.lines.length > 1 && <button type="button" onClick={() => removeLine(i)} className="text-lg leading-none cursor-pointer" style={{ color: '#CCC' }}>✕</button>}
                  </div>
                  {/* Line extras */}
                  <div className="grid gap-2" style={{ gridTemplateColumns: '90px 90px 1fr 1fr' }}>
                    <div>
                      <label className="block text-xs mb-0.5" style={{ color: T.muted }}>TVA ligne</label>
                      <select className={inputClass} value={l.lineVatRate} onChange={e => setLine(i, 'lineVatRate', e.target.value)}>
                        <option value="">— Héritée —</option>
                        {LU_VAT_RATES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-0.5" style={{ color: T.muted }}>Remise %</label>
                      <input type="number" min="0" max="100" step="0.1" placeholder="0" className={inputClass} value={l.discountRate} onChange={e => setLine(i, 'discountRate', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs mb-0.5" style={{ color: T.muted }}>Période — du</label>
                      <input type="date" className={inputClass} value={l.periodStart} onChange={e => setLine(i, 'periodStart', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs mb-0.5" style={{ color: T.muted }}>au</label>
                      <input type="date" className={inputClass} value={l.periodEnd} onChange={e => setLine(i, 'periodEnd', e.target.value)} />
                    </div>
                  </div>
                  {/* Line total preview */}
                  {(parseFloat(l.quantity)||0) > 0 && (parseFloat(l.unitPrice)||0) > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: T.muted }}>{l.unite && `Unité : ${l.unite}`}</span>
                      <span className="font-semibold" style={{ color: T.copper }}>
                        HT ligne : {fmt(lineTotal(l))}
                        {parseFloat(l.discountRate) > 0 && <span style={{ color: '#DC2626' }}> (-{l.discountRate}%)</span>}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <FormField label="Notes"><textarea className={inputClass} rows={2} value={form.notes} onChange={e => setField('notes', e.target.value)} /></FormField>
          <FormActions onCancel={() => setOpen(false)} saving={saving} />
        </form>
      </Modal>
    </div>
  );
}
