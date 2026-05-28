'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { invoicing, companies, Quote, Company, Service } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, FilterBar, DataTable, Td, StatusBadge, FormActions } from '@/components/PageShell';
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

type LineForm = { serviceId: string; description: string; quantity: string; unitPrice: string; unite: string };
const emptyLine = (): LineForm => ({ serviceId: '', description: '', quantity: '1', unitPrice: '', unite: '' });
const emptyForm = () => ({ companyId: '', vatRate: '17', vatMention: '', notes: '', lines: [emptyLine()] });

export default function QuotesPage() {
  const [list, setList] = useState<Quote[]>([]);
  const [compList, setCompList] = useState<Company[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [fullQuotes, setFullQuotes] = useState<Record<string, Quote>>({});

  const load = (s?: string) => { setLoading(true); invoicing.quotes.list(s || undefined).then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); companies.list().then(setCompList); }, []);
  useEffect(() => { list.forEach(q => { if (!fullQuotes[q.id]) invoicing.quotes.get(q.id).then(full => setFullQuotes(p => ({ ...p, [q.id]: full }))); }); }, [list]);

  const setField = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setLine = (i: number, k: string, v: string) => setForm(f => { const l = [...f.lines]; l[i] = { ...l[i], [k]: v }; return { ...f, lines: l }; });
  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }));
  const removeLine = (i: number) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));

  const onClientChange = (companyId: string) => {
    const client = compList.find(c => c.id === companyId) ?? null;
    const baseRate = parseFloat(form.vatRate) || 17;
    const vat = computeVat(client, baseRate);
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
        vatMention: form.vatMention || undefined,
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
      await invoicing.quotes.create(data); setOpen(false); setForm(emptyForm()); load(filter || undefined);
    } finally { setSaving(false); }
  };

  const selectedClient = compList.find(c => c.id === form.companyId) ?? null;
  const vatResult = computeVat(selectedClient, parseFloat(form.vatRate) || 17);

  const buildPdfProps = (q: Quote): IneeDocumentProps & { filename: string } => ({
    type: 'DEVIS', number: q.number, date: today(), status: q.status,
    company: q.company ? { name: q.company.name } : undefined,
    lines: (q.lines ?? []).map(l => ({ description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, total: l.total })),
    subtotal: q.subtotal, vatRate: q.vatRate, vatAmount: q.vatAmount, total: q.total,
    vatMention: q.vatMention,
    filename: `${q.number}.pdf`,
  });

  return (
    <div className="p-6">
      <PageHeader title="Devis" action={<AddButton onClick={() => setOpen(true)} />} />
      <FilterBar filters={FILTERS} active={filter} onChange={v => { setFilter(v); load(v || undefined); }} />

      <DataTable loading={loading} empty="Aucun devis"
        headers={[{ label: 'Numéro' }, { label: 'Client' }, { label: 'HT', align: 'right' }, { label: 'TVA', align: 'right' }, { label: 'TTC', align: 'right' }, { label: 'Statut', align: 'center' }, { label: '', align: 'center' }]}>
        {list.map((q, i) => {
          const full = fullQuotes[q.id] ?? q;
          const ss = STATUS_ST[q.status] ?? { bg: '#F5F5F5', color: '#888' };
          return (
            <tr key={q.id} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined }}>
              <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: T.dark }}>{q.number}</td>
              <Td>{q.company?.name ?? '—'}</Td>
              <td className="px-4 py-3 text-right text-sm" style={{ color: T.dark }}>{fmt(q.subtotal)}</td>
              <td className="px-4 py-3 text-right text-sm" style={{ color: T.muted }}>{fmt(q.vatAmount)}</td>
              <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: T.dark }}>{fmt(q.total)}</td>
              <td className="px-4 py-3 text-center"><StatusBadge label={STATUS_FR[q.status] ?? q.status} bg={ss.bg} color={ss.color} /></td>
              <td className="px-4 py-3 text-center"><PdfDownloadButton {...buildPdfProps(full)} /></td>
            </tr>
          );
        })}
      </DataTable>

      <Modal title="Nouveau devis" open={open} onClose={() => setOpen(false)}>
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
