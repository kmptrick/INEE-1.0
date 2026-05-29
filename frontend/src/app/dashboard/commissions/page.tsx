'use client';
import { useEffect, useState } from 'react';
import { commissions, companies, Commission, Company } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, FilterBar, DataTable, Td, StatusBadge, FormActions, usePagination, useSort, TableFooter } from '@/components/PageShell';

const STATUS_ST: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: '#FDF3E8', color: '#C8803A' },
  APPROVED:  { bg: '#EFF6FF', color: '#1D6FD8' },
  PAID:      { bg: '#F0FDF4', color: '#16A34A' },
  CANCELLED: { bg: '#F5F5F5', color: '#888'    },
};
const STATUS_FR: Record<string, string> = { PENDING: 'En attente', APPROVED: 'Approuvée', PAID: 'Payée', CANCELLED: 'Annulée' };
const FILTERS = [
  { value: '',          label: 'Toutes'      },
  { value: 'PENDING',   label: 'En attente'  },
  { value: 'APPROVED',  label: 'Approuvées'  },
  { value: 'PAID',      label: 'Payées'      },
  { value: 'CANCELLED', label: 'Annulées'    },
];

const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);
const empty = { brokerName: '', dealValue: '', commissionRate: '10', currency: 'EUR', companyId: '', notes: '' };

export default function CommissionsPage() {
  const [list, setList] = useState<Commission[]>([]);
  const [compList, setCompList] = useState<Company[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const { sort, toggle: sortToggle, sorted } = useSort(list, null);
  const pagination = usePagination(sorted);
  const load = (s?: string) => { setLoading(true); commissions.list(s || undefined).then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); companies.list().then(setCompList); }, []);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const data: any = { brokerName: form.brokerName, dealValue: parseFloat(form.dealValue) || 0, commissionRate: parseFloat(form.commissionRate) || 0, currency: form.currency, notes: form.notes };
      if (form.companyId) data.companyId = form.companyId;
      await commissions.create(data); setOpen(false); setForm(empty); load(filter || undefined);
    } finally { setSaving(false); }
  };

  return (
    <div className="p-6">
      <PageHeader title="Commissions" action={<AddButton onClick={() => setOpen(true)} />} />
      <FilterBar filters={FILTERS} active={filter} onChange={v => { setFilter(v); load(v || undefined); }} />

      <DataTable loading={loading} empty="Aucune commission — cliquez sur «+ Ajouter»" sort={sort} onSort={sortToggle}
        headers={[{ label: 'Référence' }, { label: 'Apporteur', key: 'brokerName' }, { label: 'Client' }, { label: 'Affaire', key: 'dealValue', align: 'right' }, { label: 'Taux', align: 'center' }, { label: 'Commission', key: 'commissionAmount', align: 'right' }, { label: 'Statut', key: 'status', align: 'center' }]}>
        {pagination.paged.map((c, i) => {
          const ss = STATUS_ST[c.status] ?? { bg: '#F5F5F5', color: '#888' };
          return (
            <tr key={c.id} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined }}>
              <td className="px-4 py-3 font-mono text-xs" style={{ color: T.muted }}>{c.reference}</td>
              <Td bold>{c.brokerName}</Td>
              <Td>{c.company?.name ?? '—'}</Td>
              <td className="px-4 py-3 text-right text-sm" style={{ color: T.dark }}>{fmt(c.dealValue)}</td>
              <td className="px-4 py-3 text-center text-sm" style={{ color: T.muted }}>{c.commissionRate}%</td>
              <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: T.copper }}>{fmt(c.commissionAmount)}</td>
              <td className="px-4 py-3 text-center"><StatusBadge label={STATUS_FR[c.status] ?? c.status} bg={ss.bg} color={ss.color} /></td>
            </tr>
          );
        })}
      </DataTable>
      <TableFooter pagination={pagination} export={{ getData: () => sorted.map(c => ({ Référence: c.reference, Apporteur: c.brokerName, Client: c.company?.name ?? '', 'Affaire (€)': c.dealValue, 'Taux (%)': c.commissionRate, 'Commission (€)': c.commissionAmount, Statut: STATUS_FR[c.status] ?? c.status })), filename: 'commissions', title: 'Commissions' }} />

      <Modal title="Nouvelle commission" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nom de l'apporteur" required><input className={inputClass} value={form.brokerName} onChange={e => set('brokerName', e.target.value)} required /></FormField>
          <FormField label="Client">
            <select className={selectClass} value={form.companyId} onChange={e => set('companyId', e.target.value)}>
              <option value="">— Aucune —</option>
              {compList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Valeur de l'affaire (€)" required><input type="number" min="0" step="0.01" className={inputClass} value={form.dealValue} onChange={e => set('dealValue', e.target.value)} required /></FormField>
            <FormField label="Taux (%)"><input type="number" min="0" max="100" step="0.1" className={inputClass} value={form.commissionRate} onChange={e => set('commissionRate', e.target.value)} /></FormField>
          </div>
          <FormField label="Notes"><textarea className={inputClass} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></FormField>
          <FormActions onCancel={() => setOpen(false)} saving={saving} />
        </form>
      </Modal>
    </div>
  );
}
