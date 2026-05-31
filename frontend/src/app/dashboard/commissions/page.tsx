'use client';
import { useEffect, useState } from 'react';
import { commissions, companies, Commission, Company } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, FilterBar, DataTable, Td, StatusBadge, FormActions, usePagination, useSort, TableFooter, useSegmentFilter, SegmentFilterBar, FilterRuleDef } from '@/components/PageShell';

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
const emptyForm = () => ({ brokerName: '', dealValue: '', commissionRate: '10', currency: 'EUR', companyId: '', notes: '' });

const SEGMENT_DEFS: FilterRuleDef[] = [
  { key: 'broker',          label: 'Apporteur',         dataType: 'text',   getValue: (c) => c.brokerName },
  { key: 'company',         label: 'Client',             dataType: 'text',   getValue: (c) => c.company?.name ?? '' },
  { key: 'dealValue',       label: 'Valeur affaire (€)', dataType: 'number', getValue: (c) => String(c.dealValue) },
  { key: 'commissionAmount',label: 'Commission (€)',     dataType: 'number', getValue: (c) => String(c.commissionAmount) },
  { key: 'createdAt',       label: 'Date de création',  dataType: 'date',   getValue: (c) => c.createdAt?.slice(0, 10) ?? '' },
];

export default function CommissionsPage() {
  const [list, setList]         = useState<Commission[]>([]);
  const [compList, setCompList] = useState<Company[]>([]);
  const [filter, setFilter]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [open, setOpen]         = useState(false);
  const [viewItem, setViewItem] = useState<Commission | null>(null);
  const [editItem, setEditItem] = useState<Commission | null>(null);
  const [form, setForm]         = useState(emptyForm());
  const [saving, setSaving]     = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const { sort, toggle: sortToggle, sorted } = useSort(list);
  const { search, setSearch, rules, addRule, removeRule, updateRule, clearRules, clearAll, filtered, activeCount } = useSegmentFilter(sorted, SEGMENT_DEFS);
  const pagination = usePagination(filtered);

  const load = (s?: string) => { setLoading(true); commissions.list(s || undefined).then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); companies.list().then(setCompList); }, []);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openEdit = (c: Commission) => {
    setForm({
      brokerName: c.brokerName,
      dealValue: String(c.dealValue),
      commissionRate: String(c.commissionRate),
      currency: c.currency,
      companyId: c.company?.id ?? '',
      notes: c.notes ?? '',
    });
    setEditItem(c);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const data: any = { brokerName: form.brokerName, dealValue: parseFloat(form.dealValue) || 0, commissionRate: parseFloat(form.commissionRate) || 0, currency: form.currency, notes: form.notes };
      if (form.companyId) data.companyId = form.companyId;
      await commissions.create(data); setOpen(false); setForm(emptyForm()); load(filter || undefined);
    } finally { setSaving(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editItem) return; setSaving(true);
    try {
      const data: any = { brokerName: form.brokerName, dealValue: parseFloat(form.dealValue) || 0, commissionRate: parseFloat(form.commissionRate) || 0, currency: form.currency, notes: form.notes };
      if (form.companyId) data.companyId = form.companyId;
      await commissions.update(editItem.id, data); setEditItem(null); setForm(emptyForm()); load(filter || undefined);
    } finally { setSaving(false); }
  };

  const handleDelete = async (c: Commission) => {
    if (!confirm(`Supprimer définitivement la commission ${c.reference} ?`)) return;
    setCancelling(c.id);
    try {
      await commissions.delete(c.id);
      setList(l => l.filter(x => x.id !== c.id));
    } finally { setCancelling(null); }
  };

  const handleStatus = async (c: Commission, status: string) => {
    setCancelling(c.id);
    try {
      const updated = await commissions.update(c.id, { status } as any);
      setList(l => l.map(x => x.id === c.id ? { ...x, status: updated.status } : x));
      if (viewItem?.id === c.id) setViewItem(v => v ? { ...v, status: updated.status } : v);
      if (editItem?.id === c.id) setEditItem(v => v ? { ...v, status: updated.status } : v);
    } finally { setCancelling(null); }
  };

  const CommissionForm = ({ onSubmit, onCancel }: { onSubmit: (e: React.FormEvent) => void; onCancel: () => void }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField label="Nom de l'apporteur" required>
        <input className={inputClass} value={form.brokerName} onChange={e => set('brokerName', e.target.value)} required />
      </FormField>
      <FormField label="Client">
        <select className={selectClass} value={form.companyId} onChange={e => set('companyId', e.target.value)}>
          <option value="">— Aucune —</option>
          {compList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Valeur de l'affaire (€)" required>
          <input type="number" min="0" step="0.01" className={inputClass} value={form.dealValue} onChange={e => set('dealValue', e.target.value)} required />
        </FormField>
        <FormField label="Taux (%)">
          <input type="number" min="0" max="100" step="0.1" className={inputClass} value={form.commissionRate} onChange={e => set('commissionRate', e.target.value)} />
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea className={inputClass} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
      </FormField>
      {editItem && (
        <div className="rounded-xl p-3 space-y-2" style={{ background: T.head, border: `1px solid ${T.border}` }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: T.muted }}>Changer le statut</p>
          <div className="flex flex-wrap gap-2">
            {editItem.status !== 'APPROVED' && (
              <button type="button" onClick={() => handleStatus(editItem, 'APPROVED')} disabled={cancelling === editItem.id}
                className="text-xs px-3 py-1.5 rounded-lg border font-semibold cursor-pointer"
                style={{ color: '#1D6FD8', borderColor: '#BFDBFE', background: '#EFF6FF' }}>✓ Approuver</button>
            )}
            {editItem.status !== 'PAID' && (
              <button type="button" onClick={() => handleStatus(editItem, 'PAID')} disabled={cancelling === editItem.id}
                className="text-xs px-3 py-1.5 rounded-lg border font-semibold cursor-pointer"
                style={{ color: '#16A34A', borderColor: '#BBF7D0', background: '#F0FDF4' }}>💰 Marquer payée</button>
            )}
            {editItem.status !== 'CANCELLED' && (
              <button type="button" onClick={() => handleStatus(editItem, 'CANCELLED')} disabled={cancelling === editItem.id}
                className="text-xs px-3 py-1.5 rounded-lg border font-semibold cursor-pointer"
                style={{ color: '#888', borderColor: '#E5E7EB', background: '#F5F5F5' }}>✕ Annuler</button>
            )}
          </div>
        </div>
      )}
      <FormActions onCancel={onCancel} saving={saving} label="Enregistrer" />
    </form>
  );

  return (
    <div className="p-6">
      <PageHeader title="Commissions" action={<AddButton onClick={() => { setForm(emptyForm()); setOpen(true); }} />} />
      <FilterBar filters={FILTERS} active={filter} onChange={v => { setFilter(v); load(v || undefined); }} />
      <SegmentFilterBar search={search} onSearch={setSearch} placeholder="Rechercher une commission..." defs={SEGMENT_DEFS} rules={rules} addRule={addRule} removeRule={removeRule} updateRule={updateRule} clearRules={clearRules} clearAll={clearAll} activeCount={activeCount} />

      <DataTable loading={loading} empty="Aucune commission — cliquez sur «+ Ajouter»" sort={sort} onSort={sortToggle}
        headers={[
          { label: 'Référence' }, { label: 'Apporteur', key: 'brokerName' }, { label: 'Client' },
          { label: 'Affaire', key: 'dealValue', align: 'right' as const }, { label: 'Taux', align: 'center' as const },
          { label: 'Commission', key: 'commissionAmount', align: 'right' as const },
          { label: 'Création', key: 'createdAt' }, { label: 'Statut', key: 'status', align: 'center' as const },
          { label: '', align: 'center' as const },
        ]}>
        {pagination.paged.map((c, i) => {
          const ss = STATUS_ST[c.status] ?? { bg: '#F5F5F5', color: '#888' };
          const isCancelled = c.status === 'CANCELLED';
          return (
            <tr key={c.id} onClick={() => setViewItem(c)}
              style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined, opacity: isCancelled ? 0.6 : 1, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = T.copperBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <td className="px-4 py-3 font-mono text-xs" style={{ color: T.muted }}>{c.reference}</td>
              <Td bold>{c.brokerName}</Td>
              <Td>{c.company?.name ?? '—'}</Td>
              <td className="px-4 py-3 text-right text-sm" style={{ color: T.dark }}>{fmt(c.dealValue)}</td>
              <td className="px-4 py-3 text-center text-sm" style={{ color: T.muted }}>{c.commissionRate}%</td>
              <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: T.copper }}>{fmt(c.commissionAmount)}</td>
              <Td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-LU') : '—'}</Td>
              <td className="px-4 py-3 text-center"><StatusBadge label={STATUS_FR[c.status] ?? c.status} bg={ss.bg} color={ss.color} /></td>
              <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-1.5">
                  {!isCancelled && (
                    <button onClick={() => openEdit(c)}
                      className="text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer"
                      style={{ color: T.copper, borderColor: T.copper + '60', background: 'transparent' }}>
                      ✎ Modifier
                    </button>
                  )}
                  {c.status === 'PENDING' && (
                    <button onClick={() => handleDelete(c)} disabled={cancelling === c.id}
                      className="text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-colors"
                      style={{ color: '#DC2626', borderColor: '#FECACA', background: 'transparent', opacity: cancelling === c.id ? 0.5 : 1 }}>
                      🗑 Supprimer
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      <TableFooter pagination={pagination} export={{ getData: () => filtered.map(c => ({ Référence: c.reference, Apporteur: c.brokerName, Client: c.company?.name ?? '', 'Affaire (€)': c.dealValue, 'Taux (%)': c.commissionRate, 'Commission (€)': c.commissionAmount, Statut: STATUS_FR[c.status] ?? c.status })), filename: 'commissions', title: 'Commissions' }} />

      {/* ── Modale détail commission ── */}
      {viewItem && (
        <Modal title={`Commission ${viewItem.reference}`} open onClose={() => setViewItem(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              {(() => { const ss = STATUS_ST[viewItem.status] ?? { bg: '#F5F5F5', color: '#888' }; return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.color }}>{STATUS_FR[viewItem.status] ?? viewItem.status}</span>; })()}
              <div className="flex gap-2 ml-auto">
                {viewItem.status !== 'CANCELLED' && (
                  <button onClick={() => { setViewItem(null); openEdit(viewItem); }}
                    className="text-xs px-3 py-1.5 rounded-lg border font-semibold cursor-pointer" style={{ color: T.copper, borderColor: T.copper + '60', background: 'transparent' }}>✎ Modifier</button>
                )}
                {viewItem.status !== 'CANCELLED' && (
                  <button onClick={() => { handleCancel(viewItem); setViewItem(null); }}
                    className="text-xs px-3 py-1.5 rounded-lg border font-semibold cursor-pointer" style={{ color: '#DC2626', borderColor: '#FECACA', background: 'transparent' }}>✕ Annuler</button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><span style={{ color: T.muted }}>Apporteur : </span><span className="font-semibold" style={{ color: T.dark }}>{viewItem.brokerName}</span></div>
              <div><span style={{ color: T.muted }}>Client : </span><span className="font-semibold" style={{ color: T.dark }}>{viewItem.company?.name ?? '—'}</span></div>
              <div><span style={{ color: T.muted }}>Valeur affaire : </span><span className="font-bold" style={{ color: T.dark }}>{fmt(viewItem.dealValue)}</span></div>
              <div><span style={{ color: T.muted }}>Taux : </span><span className="font-semibold" style={{ color: T.dark }}>{viewItem.commissionRate}%</span></div>
              <div className="col-span-2">
                <span style={{ color: T.muted }}>Commission : </span>
                <span className="font-bold text-lg" style={{ color: T.copper }}>{fmt(viewItem.commissionAmount)}</span>
              </div>
              <div><span style={{ color: T.muted }}>Création : </span><span style={{ color: T.dark }}>{viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleDateString('fr-LU') : '—'}</span></div>
            </div>
            {viewItem.notes && (
              <div className="rounded-lg p-3 text-sm" style={{ background: T.head, border: `1px solid ${T.border}` }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: T.muted }}>Notes</p>
                <p style={{ color: T.dark }}>{viewItem.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Nouvelle commission */}
      <Modal title="Nouvelle commission" open={open} onClose={() => setOpen(false)}>
        <CommissionForm onSubmit={handleCreate} onCancel={() => setOpen(false)} />
      </Modal>

      {/* Modifier commission */}
      <Modal title="Modifier la commission" open={!!editItem} onClose={() => setEditItem(null)}>
        <CommissionForm onSubmit={handleEdit} onCancel={() => setEditItem(null)} />
      </Modal>
    </div>
  );
}
