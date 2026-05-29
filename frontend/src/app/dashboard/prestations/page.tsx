'use client';
import { useEffect, useState } from 'react';
import { services, Service } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { LU_VAT_RATES } from '@/lib/vat-rules';
import { PageHeader, AddButton, DataTable, Td, FormActions, usePagination, useSort, useColumns, TableFooter, useColumnFilters, ColumnFilterBar, FilterDef } from '@/components/PageShell';

const UNITES = ['/h', '/mois', '/déclaration', '/facture', '/employé/mois', '/session', '/personne', '/groupe', '/module', '/post', '/envoi', '/consultation', '/jour', 'forfait'];

const emptyForm = { idPrestation: '', categorie: '', description: '', prixHT: '', vatRate: '17', unite: '', remarques: '' };

const FILTER_DEFS: FilterDef[] = [
  { key: 'id',          label: 'ID Prestation', type: 'text',   placeholder: 'PREST-001...', getValue: (s) => s.idPrestation },
  { key: 'description', label: 'Description',   type: 'text',   placeholder: 'Comptabilité...', getValue: (s) => s.description },
  { key: 'categorie',   label: 'Catégorie',      type: 'text',   placeholder: 'Social...', getValue: (s) => s.categorie ?? '' },
  { key: 'vatRate',     label: 'TVA',            type: 'select', options: [{ value: '17', label: '17%' }, { value: '8', label: '8%' }, { value: '3', label: '3%' }, { value: '0', label: '0%' }], getValue: (s) => String(s.vatRate ?? 17) },
];

export default function PrestationsPage() {
  const [list, setList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Service | null>(null);
  const { sort, toggle: sortToggle, sorted } = useSort(list);
  const { values: fv, set: fset, reset: freset, filtered, activeCount: fCount } = useColumnFilters(sorted, FILTER_DEFS);
  const pagination = usePagination(filtered);
  const { visible, toggle: colToggle } = useColumns('prestations', [
    { key: 'id', label: 'ID Prestation' }, { key: 'categorie', label: 'Catégorie' },
    { key: 'description', label: 'Description' }, { key: 'prix', label: 'Prix HT' },
    { key: 'tva', label: 'TVA' }, { key: 'unite', label: 'Unité' }, { key: 'remarques', label: 'Remarques' },
  ]);

  const load = () => {
    setLoading(true);
    services.list().then(setList).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (s: Service) => {
    setEditTarget(s);
    setForm({ idPrestation: s.idPrestation, categorie: s.categorie, description: s.description, prixHT: String(s.prixHT), vatRate: String(s.vatRate ?? 17), unite: s.unite ?? '', remarques: s.remarques ?? '' });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = { idPrestation: form.idPrestation, categorie: form.categorie, description: form.description, prixHT: parseFloat(form.prixHT) || 0, vatRate: parseFloat(form.vatRate) || 17, unite: form.unite || undefined, remarques: form.remarques || undefined };
      if (editTarget) await services.update(editTarget.id, data);
      else await services.create(data);
      setOpen(false);
      load();
      services.categories().then(setCats);
    } finally { setSaving(false); }
  };

  const handleDelete = async (s: Service) => {
    await services.delete(s.id);
    setDeleteConfirm(null);
    load();
  };

  const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <div className="p-6">
      <PageHeader title="Catalogue de prestations"
        action={<AddButton onClick={openCreate} label="+ Nouvelle prestation" />} />
      <ColumnFilterBar defs={FILTER_DEFS} values={fv} set={fset} reset={freset} activeCount={fCount} />

      <DataTable loading={loading} empty="Aucune prestation — cliquez sur &quot;+ Nouvelle prestation&quot;" sort={sort} onSort={sortToggle}
        headers={[
          { label: 'ID Prestation', key: 'idPrestation' },
          { label: 'Catégorie', key: 'categorie' },
          { label: 'Description', key: 'description' },
          { label: 'Prix HT', key: 'prixHT', align: 'right' },
          { label: 'TVA', align: 'center' },
          { label: 'Unité' },
          { label: 'Remarques' },
          { label: '', align: 'right' },
        ]}>
        {pagination.paged.map((s, i) => (
          <tr key={s.id} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined }}>
            <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: T.copper }}>{s.idPrestation}</td>
            <td className="px-4 py-3 text-xs font-semibold" style={{ color: T.muted }}>{s.categorie}</td>
            <Td bold>{s.description}</Td>
            <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: T.dark }}>{fmt(s.prixHT)}</td>
            <td className="px-4 py-3 text-center text-xs font-semibold" style={{ color: T.copper }}>{(s.vatRate ?? 17)}%</td>
            <td className="px-4 py-3 text-xs" style={{ color: T.muted }}>{s.unite ?? '—'}</td>
            <td className="px-4 py-3 text-xs max-w-[180px] truncate" style={{ color: T.muted }} title={s.remarques ?? ''}>{s.remarques ?? '—'}</td>
            <td className="px-4 py-3 text-right">
              <div className="flex gap-2 justify-end">
                <button onClick={() => openEdit(s)}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium"
                  style={{ color: T.copper, borderColor: T.copper, background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.copperBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  Modifier
                </button>
                <button onClick={() => setDeleteConfirm(s)}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium"
                  style={{ color: '#DC2626', borderColor: '#FECACA', background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  Désactiver
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
      <TableFooter pagination={pagination} export={{ getData: () => filtered.map(s => ({ ID: s.idPrestation, Catégorie: s.categorie, Description: s.description, 'Prix HT (€)': s.prixHT, 'TVA (%)': s.vatRate ?? 17, Unité: s.unite ?? '', Remarques: s.remarques ?? '' })), filename: 'prestations', title: 'Catalogue de prestations' }} columnSelector={{ allCols: [
        { key: 'id', label: 'ID Prestation' }, { key: 'categorie', label: 'Catégorie' },
        { key: 'description', label: 'Description' }, { key: 'prix', label: 'Prix HT' },
        { key: 'tva', label: 'TVA' }, { key: 'unite', label: 'Unité' }, { key: 'remarques', label: 'Remarques' },
      ], visible, toggle: colToggle }} />

      {/* Modal création/édition */}
      <Modal title={editTarget ? 'Modifier la prestation' : 'Nouvelle prestation'} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="ID Prestation" required>
              <input className={inputClass} value={form.idPrestation} onChange={e => set('idPrestation', e.target.value)} required placeholder="70330001" disabled={!!editTarget} />
            </FormField>
            <FormField label="Unité">
              <input className={inputClass} value={form.unite} onChange={e => set('unite', e.target.value)} placeholder="/h, /mois..." list="unites-list" />
              <datalist id="unites-list">
                {UNITES.map(u => <option key={u} value={u} />)}
              </datalist>
            </FormField>
          </div>
          <FormField label="Catégorie" required>
            <input className={inputClass} value={form.categorie} onChange={e => set('categorie', e.target.value)} required list="cats-list" />
            <datalist id="cats-list">
              {cats.map(c => <option key={c} value={c} />)}
            </datalist>
          </FormField>
          <FormField label="Description" required>
            <input className={inputClass} value={form.description} onChange={e => set('description', e.target.value)} required />
          </FormField>
          <FormField label="Prix HT (€)" required>
            <input type="number" min="0" step="0.01" className={inputClass} value={form.prixHT} onChange={e => set('prixHT', e.target.value)} required />
          </FormField>
          <FormField label="TVA par défaut (LU)">
            <select className={selectClass} value={form.vatRate} onChange={e => set('vatRate', e.target.value)}>
              {LU_VAT_RATES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </FormField>
          <FormField label="Remarques">
            <input className={inputClass} value={form.remarques} onChange={e => set('remarques', e.target.value)} placeholder="Selon volume, Selon complexité..." />
          </FormField>
          <FormActions onCancel={() => setOpen(false)} saving={saving} />
        </form>
      </Modal>

      {/* Modal confirmation suppression */}
      <Modal title="Désactiver la prestation" open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: T.dark }}>
            Voulez-vous désactiver la prestation <strong>{deleteConfirm?.idPrestation}</strong> — {deleteConfirm?.description} ?
          </p>
          <p className="text-xs" style={{ color: T.muted }}>
            Si cette prestation est liée à des devis ou factures, elle sera uniquement désactivée (les lignes existantes sont préservées). Sinon, elle sera supprimée définitivement.
          </p>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setDeleteConfirm(null)}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium"
              style={{ border: `1px solid ${T.border}`, color: T.muted }}>
              Annuler
            </button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: '#DC2626' }}>
              Désactiver
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
