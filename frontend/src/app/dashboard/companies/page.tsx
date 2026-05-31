'use client';
import { useEffect, useState } from 'react';
import { companies, Company } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, DataTable, Td, FormActions, usePagination, useSort, useColumns, TableFooter, useSegmentFilter, SegmentFilterBar, FilterRuleDef } from '@/components/PageShell';

const FORMES_BY_COUNTRY: Record<string, string[]> = {
  LU: ['Particulier', 'Indépendant', 'SARL', 'SARL-S', 'SA', 'SAS', 'SCA', 'SCS', 'SNC', 'SCoop', 'SCI', 'ASBL', 'Fondation', 'GIE'],
  BE: ['Particulier', 'Indépendant', 'SRL', 'SA', 'SC', 'SNC', 'SComm', 'ASBL', 'Fondation', 'SCI'],
  DE: ['Privatperson', 'Einzelunternehmen', 'GmbH', 'AG', 'KG', 'OHG', 'GmbH & Co. KG', 'GbR', 'e.V.', 'Stiftung'],
  FR: ['Particulier', 'Auto-entrepreneur', 'EI', 'EURL', 'SARL', 'SAS', 'SASU', 'SA', 'SNC', 'SCS', 'SCA', 'SCI', 'SCP', 'SCOP', 'Association loi 1901', 'Fondation', 'GIE'],
  DEFAULT: ['Particulier', 'Indépendant', 'SARL', 'SA', 'SAS', 'SNC', 'ASBL', 'Fondation', 'GIE', 'Autre'],
};
function getFormes(country: string): string[] {
  return FORMES_BY_COUNTRY[country?.toUpperCase()] ?? FORMES_BY_COUNTRY.DEFAULT;
}

const SEGMENT_DEFS: FilterRuleDef[] = [
  { key: 'type',      label: 'Type',            dataType: 'select', options: [{ value: 'SOCIETE', label: 'Société' }, { value: 'PARTICULIER', label: 'Particulier' }], getValue: (c) => c.clientType },
  { key: 'name',      label: 'Nom',             dataType: 'text',   getValue: (c) => c.name },
  { key: 'email',     label: 'Email',           dataType: 'text',   getValue: (c) => c.email ?? '' },
  { key: 'city',      label: 'Ville',           dataType: 'text',   getValue: (c) => c.city ?? '' },
  { key: 'country',   label: 'Pays',            dataType: 'text',   getValue: (c) => c.country ?? '' },
  { key: 'status',    label: 'Statut',          dataType: 'select', options: [{ value: 'actif', label: 'Actif' }, { value: 'inactif', label: 'Inactif' }], getValue: (c) => c.isActive === false ? 'inactif' : 'actif' },
  { key: 'createdAt', label: 'Date de création', dataType: 'date',  getValue: (c) => c.createdAt?.slice(0, 10) ?? '' },
];

const emptyForm = () => ({
  clientType: 'SOCIETE' as 'SOCIETE' | 'PARTICULIER',
  denomination: '', formeJuridique: '', prenom: '', nom: '',
  email: '', phone: '', streetNumber: '', address: '', postalCode: '', city: '', country: 'LU', vatNumber: '', notes: '',
});

export default function ClientsPage() {
  const [list, setList] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const { sort, toggle: sortToggle, sorted } = useSort(list);
  const { search, setSearch, rules, addRule, removeRule, updateRule, clearRules, clearAll, filtered, activeCount } = useSegmentFilter(sorted, SEGMENT_DEFS);
  const pagination = usePagination(filtered);
  const { visible, toggle: colToggle } = useColumns('companies', [
    { key: 'reference', label: 'Réf.' }, { key: 'name', label: 'Nom' },
    { key: 'email', label: 'Email' }, { key: 'phone', label: 'Téléphone' },
    { key: 'city', label: 'Ville' }, { key: 'country', label: 'Pays' },
    { key: 'status', label: 'Statut' }, { key: 'createdAt', label: 'Création' },
  ]);

  const load = () => { setLoading(true); companies.list().then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await companies.create(form); setOpen(false); setForm(emptyForm()); load(); }
    finally { setSaving(false); }
  };

  const toggleActive = async (c: Company) => {
    setToggling(c.id);
    try {
      const updated = c.isActive === false ? await companies.activate(c.id) : await companies.deactivate(c.id);
      setList(l => l.map(x => x.id === c.id ? { ...x, isActive: updated.isActive } : x));
    } finally { setToggling(null); }
  };

  const isSociete = form.clientType === 'SOCIETE';

  return (
    <div className="p-6">
      <PageHeader title="Clients" action={<AddButton onClick={() => { setForm(emptyForm()); setOpen(true); }} />} />
      <SegmentFilterBar search={search} onSearch={setSearch} placeholder="Rechercher un client..." defs={SEGMENT_DEFS} rules={rules} addRule={addRule} removeRule={removeRule} updateRule={updateRule} clearRules={clearRules} clearAll={clearAll} activeCount={activeCount} />

      <DataTable loading={loading} empty="Aucun client — cliquez sur «+ Ajouter»" sort={sort} onSort={sortToggle}
        headers={[
          { label: 'Type' },
          ...(visible.includes('reference') ? [{ label: 'Réf.' }] : []),
          ...(visible.includes('name')    ? [{ label: 'Nom',       key: 'name' }] : []),
          ...(visible.includes('email')   ? [{ label: 'Email' }] : []),
          ...(visible.includes('city')    ? [{ label: 'Ville',     key: 'city' }] : []),
          ...(visible.includes('country') ? [{ label: 'Pays' }] : []),
          ...(visible.includes('status')    ? [{ label: 'Statut' }] : []),
          ...(visible.includes('createdAt') ? [{ label: 'Création', key: 'createdAt' }] : []),
          { label: '', align: 'center' as const },
        ]}>
        {pagination.paged.map((c, i) => {
          const inactive = c.isActive === false;
          return (
            <tr key={c.id} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined, opacity: inactive ? 0.55 : 1 }}>
              <td className="px-4 py-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={c.clientType === 'SOCIETE' ? { background: '#EFF6FF', color: '#1D6FD8' } : { background: '#F0FDF4', color: '#16A34A' }}>
                  {c.clientType === 'SOCIETE' ? 'Société' : 'Particulier'}
                </span>
              </td>
              {visible.includes('reference') && <td className="px-4 py-3 font-mono text-xs" style={{ color: T.muted }}>{(c as any).reference ?? '—'}</td>}
              {visible.includes('name') && (
                <td className="px-4 py-3 font-semibold text-sm" style={{ color: T.dark }}>
                  {c.name}
                  {inactive && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#F5F5F5', color: '#999' }}>Inactif</span>}
                </td>
              )}
              {visible.includes('email')   && <Td>{c.email ?? '—'}</Td>}
              {visible.includes('city')    && <Td>{c.city ?? '—'}</Td>}
              {visible.includes('country') && <Td>{c.country ?? '—'}</Td>}
              {visible.includes('status')    && <td className="px-4 py-3 text-xs font-semibold" style={{ color: inactive ? '#999' : '#16A34A' }}>{inactive ? 'Inactif' : 'Actif'}</td>}
              {visible.includes('createdAt') && <Td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-LU') : '—'}</Td>}
              <td className="px-4 py-3 text-center">
                <button onClick={() => toggleActive(c)} disabled={toggling === c.id}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer"
                  style={inactive ? { color: '#16A34A', borderColor: '#BBF7D0', background: 'transparent', opacity: toggling === c.id ? 0.5 : 1 }
                                  : { color: '#DC2626', borderColor: '#FECACA', background: 'transparent', opacity: toggling === c.id ? 0.5 : 1 }}>
                  {inactive ? 'Réactiver' : 'Désactiver'}
                </button>
              </td>
            </tr>
          );
        })}
      </DataTable>
      <TableFooter pagination={pagination} export={{ getData: () => filtered.map(c => ({ Référence: (c as any).reference ?? '', Type: c.clientType === 'SOCIETE' ? 'Société' : 'Particulier', Nom: c.name, 'Forme juridique': c.formeJuridique ?? '', Email: c.email ?? '', Téléphone: c.phone ?? '', 'N°': c.streetNumber ?? '', Rue: c.address ?? '', 'Code postal': c.postalCode ?? '', Ville: c.city ?? '', Pays: c.country ?? '', 'N° TVA': c.vatNumber ?? '', Statut: c.isActive === false ? 'Inactif' : 'Actif' })), filename: 'clients', title: 'Clients' }} columnSelector={{ allCols: [
        { key: 'reference', label: 'Réf.' }, { key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' },
        { key: 'city', label: 'Ville' }, { key: 'country', label: 'Pays' }, { key: 'status', label: 'Statut' }, { key: 'createdAt', label: 'Création' },
      ], visible, toggle: colToggle }} />

      <Modal title="Nouveau client" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: T.border }}>
            {(['SOCIETE', 'PARTICULIER'] as const).map(t => (
              <button key={t} type="button"
                onClick={() => set('clientType', t)}
                className="flex-1 py-2 text-sm font-semibold transition-all"
                style={form.clientType === t
                  ? { background: T.copper, color: '#FFF' }
                  : { background: '#FFF', color: T.muted }}>
                {t === 'SOCIETE' ? 'Société / Organisation' : 'Particulier / Indépendant'}
              </button>
            ))}
          </div>

          {isSociete ? (
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Dénomination" required>
                <input className={inputClass} value={form.denomination} onChange={e => set('denomination', e.target.value)} required placeholder="ACME Sàrl" />
              </FormField>
              <FormField label="Forme juridique">
                <select className={selectClass} value={form.formeJuridique} onChange={e => set('formeJuridique', e.target.value)}>
                  <option value="">— Choisir —</option>
                  {getFormes(form.country).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </FormField>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Prénom" required>
                <input className={inputClass} value={form.prenom} onChange={e => set('prenom', e.target.value)} required />
              </FormField>
              <FormField label="Nom" required>
                <input className={inputClass} value={form.nom} onChange={e => set('nom', e.target.value)} required />
              </FormField>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email"><input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} /></FormField>
            <FormField label="Téléphone"><input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} /></FormField>
          </div>

          {/* Adresse */}
          <div className="grid gap-3" style={{ gridTemplateColumns: '90px 1fr' }}>
            <FormField label="N°">
              <input className={inputClass} placeholder="42" value={form.streetNumber} onChange={e => set('streetNumber', e.target.value)} />
            </FormField>
            <FormField label="Rue">
              <input className={inputClass} placeholder="Route d'Arlon" value={form.address} onChange={e => set('address', e.target.value)} />
            </FormField>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: '100px 1fr 1fr' }}>
            <FormField label="Code postal"><input className={inputClass} placeholder="1234" value={form.postalCode} onChange={e => set('postalCode', e.target.value)} /></FormField>
            <FormField label="Ville"><input className={inputClass} value={form.city} onChange={e => set('city', e.target.value)} /></FormField>
            <FormField label="Pays">
              <select className={selectClass} value={form.country} onChange={e => { set('country', e.target.value); set('formeJuridique', ''); }}>
                <option value="LU">Luxembourg (LU)</option>
                <option value="BE">Belgique (BE)</option>
                <option value="DE">Allemagne (DE)</option>
                <option value="FR">France (FR)</option>
                <option value="">Autre pays</option>
              </select>
            </FormField>
          </div>
          <FormField label="N° TVA">
            <input className={inputClass} placeholder="LU12345678" value={form.vatNumber} onChange={e => set('vatNumber', e.target.value)} />
          </FormField>
          <FormField label="Notes"><textarea className={inputClass} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></FormField>
          <FormActions onCancel={() => setOpen(false)} saving={saving} />
        </form>
      </Modal>
    </div>
  );
}
