'use client';
import { useEffect, useState } from 'react';
import { deals, companies, contacts, Deal, Company, Contact } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, FilterBar, DataTable, Td, StatusBadge, FormActions } from '@/components/PageShell';

const STATUS_FR: Record<string, string> = { OPEN: 'En cours', WON: 'Gagné', LOST: 'Perdu' };
const STATUS_ST: Record<string, { bg: string; color: string }> = {
  OPEN: { bg: '#FDF3E8', color: '#C8803A' },
  WON:  { bg: '#F0FDF4', color: '#16A34A' },
  LOST: { bg: '#FEF2F2', color: '#DC2626' },
};
const FILTERS = [
  { value: '',     label: 'Toutes'    },
  { value: 'OPEN', label: 'En cours' },
  { value: 'WON',  label: 'Gagné'    },
  { value: 'LOST', label: 'Perdu'    },
];

const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);
const empty = { title: '', value: '', probability: '50', currency: 'EUR', companyId: '', contactId: '', notes: '' };

export default function DealsPage() {
  const [list, setList] = useState<Deal[]>([]);
  const [compList, setCompList] = useState<Company[]>([]);
  const [contList, setContList] = useState<Contact[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = (s?: string) => { setLoading(true); deals.list(s || undefined).then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); companies.list().then(setCompList); contacts.list().then(setContList); }, []);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const data: any = { title: form.title, value: parseFloat(form.value) || 0, probability: parseInt(form.probability) || 0, currency: form.currency, notes: form.notes };
      if (form.companyId) data.companyId = form.companyId;
      if (form.contactId) data.contactId = form.contactId;
      await deals.create(data); setOpen(false); setForm(empty); load(filter || undefined);
    } finally { setSaving(false); }
  };

  return (
    <div className="p-6">
      <PageHeader title="Affaires" action={<AddButton onClick={() => setOpen(true)} />} />
      <FilterBar filters={FILTERS} active={filter} onChange={v => { setFilter(v); load(v || undefined); }} />

      <DataTable loading={loading} empty="Aucune affaire — cliquez sur «+ Ajouter»"
        headers={[{ label: 'Titre' }, { label: 'Client' }, { label: 'Valeur', align: 'right' }, { label: 'Proba.', align: 'center' }, { label: 'Statut', align: 'center' }]}>
        {list.map((d, i) => {
          const ss = STATUS_ST[d.status] ?? { bg: '#F5F5F5', color: '#888' };
          return (
            <tr key={d.id} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined }}>
              <Td bold>{d.title}</Td>
              <Td>{d.company?.name ?? '—'}</Td>
              <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: T.dark }}>{fmt(d.value)}</td>
              <td className="px-4 py-3 text-center text-sm" style={{ color: T.muted }}>{d.probability}%</td>
              <td className="px-4 py-3 text-center">
                <StatusBadge label={STATUS_FR[d.status] ?? d.status} bg={ss.bg} color={ss.color} />
              </td>
            </tr>
          );
        })}
      </DataTable>

      <Modal title="Nouvelle affaire" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Titre" required><input className={inputClass} value={form.title} onChange={e => set('title', e.target.value)} required /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Valeur (€)"><input type="number" min="0" step="0.01" className={inputClass} value={form.value} onChange={e => set('value', e.target.value)} /></FormField>
            <FormField label="Probabilité (%)"><input type="number" min="0" max="100" className={inputClass} value={form.probability} onChange={e => set('probability', e.target.value)} /></FormField>
          </div>
          <FormField label="Client">
            <select className={selectClass} value={form.companyId} onChange={e => set('companyId', e.target.value)}>
              <option value="">— Aucune —</option>
              {compList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Contact">
            <select className={selectClass} value={form.contactId} onChange={e => set('contactId', e.target.value)}>
              <option value="">— Aucun —</option>
              {contList.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </FormField>
          <FormField label="Notes"><textarea className={inputClass} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></FormField>
          <FormActions onCancel={() => setOpen(false)} saving={saving} />
        </form>
      </Modal>
    </div>
  );
}
