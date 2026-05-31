'use client';
import { useEffect, useState } from 'react';
import { deals, companies, contacts, Deal, Company, Contact } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, FilterBar, DataTable, Td, StatusBadge, FormActions, usePagination, useSort, TableFooter, useSegmentFilter, SegmentFilterBar, FilterRuleDef } from '@/components/PageShell';

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

const SEGMENT_DEFS: FilterRuleDef[] = [
  { key: 'title',     label: 'Titre',           dataType: 'text',   getValue: (d) => d.title },
  { key: 'company',   label: 'Client',           dataType: 'text',   getValue: (d) => d.company?.name ?? '' },
  { key: 'contact',   label: 'Contact',          dataType: 'text',   getValue: (d) => d.contact ? `${d.contact.firstName ?? ''} ${d.contact.lastName ?? ''}` : '' },
  { key: 'value',     label: 'Valeur (€)',       dataType: 'number', getValue: (d) => String(d.value) },
  { key: 'probability', label: 'Probabilité (%)', dataType: 'number', getValue: (d) => String(d.probability) },
  { key: 'createdAt', label: 'Date de création', dataType: 'date',   getValue: (d) => d.createdAt?.slice(0, 10) ?? '' },
];

export default function DealsPage() {
  const [list, setList] = useState<Deal[]>([]);
  const [compList, setCompList] = useState<Company[]>([]);
  const [contList, setContList] = useState<Contact[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Deal | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [actioning, setActioning] = useState(false);

  const { sort, toggle: sortToggle, sorted } = useSort(list);
  const { search, setSearch, rules, addRule, removeRule, updateRule, clearRules, clearAll, filtered, activeCount } = useSegmentFilter(sorted, SEGMENT_DEFS);
  const pagination = usePagination(filtered);
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
      <SegmentFilterBar search={search} onSearch={setSearch} placeholder="Rechercher une affaire..." defs={SEGMENT_DEFS} rules={rules} addRule={addRule} removeRule={removeRule} updateRule={updateRule} clearRules={clearRules} clearAll={clearAll} activeCount={activeCount} />

      <DataTable loading={loading} empty="Aucune affaire — cliquez sur «+ Ajouter»" sort={sort} onSort={sortToggle}
        headers={[{ label: 'Titre', key: 'title' }, { label: 'Client' }, { label: 'Valeur', key: 'value', align: 'right' }, { label: 'Proba.', align: 'center' }, { label: 'Création', key: 'createdAt' }, { label: 'Statut', key: 'status', align: 'center' }]}>
        {pagination.paged.map((d, i) => {
          const ss = STATUS_ST[d.status] ?? { bg: '#F5F5F5', color: '#888' };
          return (
            <tr key={d.id} onClick={() => setViewItem(d)}
              style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = T.copperBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <Td bold>{d.title}</Td>
              <Td>{d.company?.name ?? '—'}</Td>
              <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: T.dark }}>{fmt(d.value)}</td>
              <td className="px-4 py-3 text-center text-sm" style={{ color: T.muted }}>{d.probability}%</td>
              <Td>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-LU') : '—'}</Td>
              <td className="px-4 py-3 text-center"><StatusBadge label={STATUS_FR[d.status] ?? d.status} bg={ss.bg} color={ss.color} /></td>
            </tr>
          );
        })}
      </DataTable>
      <TableFooter pagination={pagination} export={{ getData: () => filtered.map(d => ({ Titre: d.title, Client: d.company?.name ?? '', 'Valeur (€)': d.value, 'Probabilité (%)': d.probability, Statut: STATUS_FR[d.status] ?? d.status })), filename: 'affaires', title: 'Affaires' }} />

      {/* ── Modale détail affaire ── */}
      {viewItem && (
        <Modal title={viewItem.title} open onClose={() => setViewItem(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              {(() => { const ss = STATUS_ST[viewItem.status] ?? { bg: '#F5F5F5', color: '#888' }; return <StatusBadge label={STATUS_FR[viewItem.status] ?? viewItem.status} bg={ss.bg} color={ss.color} />; })()}
              <div className="flex gap-2 ml-auto">
                {viewItem.status === 'OPEN' && <>
                  <button onClick={async () => { setActioning(true); try { const u = await deals.update(viewItem.id, { status: 'WON' } as any); setViewItem(u); load(filter || undefined); } finally { setActioning(false); } }} disabled={actioning}
                    className="text-xs px-3 py-1.5 rounded-lg border font-semibold cursor-pointer" style={{ color: '#16A34A', borderColor: '#BBF7D0', background: 'transparent' }}>✓ Gagné</button>
                  <button onClick={async () => { setActioning(true); try { const u = await deals.update(viewItem.id, { status: 'LOST' } as any); setViewItem(u); load(filter || undefined); } finally { setActioning(false); } }} disabled={actioning}
                    className="text-xs px-3 py-1.5 rounded-lg border font-semibold cursor-pointer" style={{ color: '#DC2626', borderColor: '#FECACA', background: 'transparent' }}>✕ Perdu</button>
                </>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><span style={{ color: T.muted }}>Client : </span><span className="font-semibold" style={{ color: T.dark }}>{viewItem.company?.name ?? '—'}</span></div>
              <div><span style={{ color: T.muted }}>Contact : </span><span className="font-semibold" style={{ color: T.dark }}>{viewItem.contact ? `${viewItem.contact.firstName} ${viewItem.contact.lastName}` : '—'}</span></div>
              <div><span style={{ color: T.muted }}>Valeur : </span><span className="font-bold text-base" style={{ color: T.copper }}>{fmt(viewItem.value)}</span></div>
              <div><span style={{ color: T.muted }}>Probabilité : </span><span className="font-semibold" style={{ color: T.dark }}>{viewItem.probability}%</span></div>
              {(viewItem as any).stage && <div><span style={{ color: T.muted }}>Étape : </span><span className="font-semibold" style={{ color: T.dark }}>{(viewItem as any).stage.name}</span></div>}
              <div><span style={{ color: T.muted }}>Création : </span><span style={{ color: T.dark }}>{viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleDateString('fr-LU') : '—'}</span></div>
            </div>
            {(viewItem as any).notes && (
              <div className="rounded-lg p-3 text-sm" style={{ background: T.head, border: `1px solid ${T.border}` }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: T.muted }}>Notes</p>
                <p style={{ color: T.dark }}>{(viewItem as any).notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

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
