'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { invoicing, companies, Invoice, Company, Service } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, FilterBar, DataTable, Td, StatusBadge, FormActions } from '@/components/PageShell';
import { ServicePicker } from '@/components/ServicePicker';
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

type LineForm = { serviceId: string; description: string; quantity: string; unitPrice: string; unite: string };
const emptyLine = (): LineForm => ({ serviceId: '', description: '', quantity: '1', unitPrice: '', unite: '' });
const emptyForm = () => ({ companyId: '', vatRate: '17', dueDate: '', notes: '', lines: [emptyLine()] });

export default function InvoicesPage() {
  const [list, setList] = useState<Invoice[]>([]);
  const [compList, setCompList] = useState<Company[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [fullInvoices, setFullInvoices] = useState<Record<string, Invoice>>({});

  const load = (s?: string) => { setLoading(true); invoicing.invoices.list(s || undefined).then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); companies.list().then(setCompList); }, []);
  useEffect(() => { list.forEach(inv => { if (!fullInvoices[inv.id]) invoicing.invoices.get(inv.id).then(full => setFullInvoices(p => ({ ...p, [inv.id]: full }))); }); }, [list]);

  const setField = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setLine = (i: number, k: string, v: string) => setForm(f => { const l = [...f.lines]; l[i] = { ...l[i], [k]: v }; return { ...f, lines: l }; });
  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }));
  const removeLine = (i: number) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));

  const pickService = (i: number, s: Service) => {
    setForm(f => {
      const lines = [...f.lines];
      lines[i] = { serviceId: s.id, description: s.description, quantity: '1', unitPrice: String(s.prixHT), unite: s.unite ?? '' };
      return { ...f, lines };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const data: any = {
        vatRate: parseFloat(form.vatRate) || 17,
        notes: form.notes,
        lines: form.lines.map(l => ({
          ...(l.serviceId ? { serviceId: l.serviceId } : {}),
          description: l.description,
          quantity: parseFloat(l.quantity) || 1,
          unitPrice: parseFloat(l.unitPrice) || 0,
          ...(l.unite ? { unite: l.unite } : {}),
        })),
      };
      if (form.companyId) data.companyId = form.companyId;
      if (form.dueDate) data.dueDate = form.dueDate;
      await invoicing.invoices.create(data); setOpen(false); setForm(emptyForm()); load(filter || undefined);
    } finally { setSaving(false); }
  };

  const buildPdfProps = (inv: Invoice): IneeDocumentProps & { filename: string } => ({
    type: 'FACTURE', number: inv.number, date: today(), dueDate: fmtDate(inv.dueDate), status: inv.status,
    company: inv.company ? { name: inv.company.name } : undefined,
    lines: (inv.lines ?? []).map(l => ({ description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, total: l.total })),
    subtotal: inv.subtotal, vatRate: inv.vatRate, vatAmount: inv.vatAmount, total: inv.total,
    filename: `${inv.number}.pdf`,
  });

  return (
    <div className="p-6">
      <PageHeader title="Factures" action={<AddButton onClick={() => setOpen(true)} />} />
      <FilterBar filters={FILTERS} active={filter} onChange={v => { setFilter(v); load(v || undefined); }} />

      <DataTable loading={loading} empty="Aucune facture"
        headers={[{ label: 'Numéro' }, { label: 'Société' }, { label: 'HT', align: 'right' }, { label: 'TVA', align: 'right' }, { label: 'TTC', align: 'right' }, { label: 'Payé', align: 'right' }, { label: 'Statut', align: 'center' }, { label: '', align: 'center' }]}>
        {list.map((inv, i) => {
          const full = fullInvoices[inv.id] ?? inv;
          const ss = STATUS_ST[inv.status] ?? { bg: '#F5F5F5', color: '#888' };
          return (
            <tr key={inv.id} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined }}>
              <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: T.dark }}>{inv.number}</td>
              <Td>{inv.company?.name ?? '—'}</Td>
              <td className="px-4 py-3 text-right text-sm" style={{ color: T.dark }}>{fmt(inv.subtotal)}</td>
              <td className="px-4 py-3 text-right text-sm" style={{ color: T.muted }}>{fmt(inv.vatAmount)}</td>
              <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: T.dark }}>{fmt(inv.total)}</td>
              <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#16A34A' }}>{fmt(inv.paidAmount)}</td>
              <td className="px-4 py-3 text-center"><StatusBadge label={STATUS_FR[inv.status] ?? inv.status} bg={ss.bg} color={ss.color} /></td>
              <td className="px-4 py-3 text-center"><PdfDownloadButton {...buildPdfProps(full)} /></td>
            </tr>
          );
        })}
      </DataTable>

      <Modal title="Nouvelle facture" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Société">
            <select className={selectClass} value={form.companyId} onChange={e => setField('companyId', e.target.value)}>
              <option value="">— Aucune —</option>
              {compList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="TVA (%)"><input type="number" min="0" max="100" step="0.1" className={inputClass} value={form.vatRate} onChange={e => setField('vatRate', e.target.value)} /></FormField>
            <FormField label="Échéance"><input type="date" className={inputClass} value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} /></FormField>
          </div>

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

          <FormField label="Notes"><textarea className={inputClass} rows={2} value={form.notes} onChange={e => setField('notes', e.target.value)} /></FormField>
          <FormActions onCancel={() => setOpen(false)} saving={saving} />
        </form>
      </Modal>
    </div>
  );
}
