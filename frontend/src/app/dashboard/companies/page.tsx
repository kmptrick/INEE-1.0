'use client';
import { useEffect, useState } from 'react';
import { companies, contacts, Company, Contact } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, DataTable, Td, FormActions, usePagination, useSort, useColumns, TableFooter, useSegmentFilter, SegmentFilterBar, FilterRuleDef } from '@/components/PageShell';

// ── Qualifications contacts ──────────────────────────────────────────────────
const QUALS_DIRECTES = ['Actionnaire', 'Associé'];
const QUALS_AUTRES   = ['Dirigeant', 'Comptable', 'Agent payeur', 'Autre'];
const ALL_QUALIFICATIONS = [...QUALS_DIRECTES, ...QUALS_AUTRES];

// ── Formes juridiques par pays ───────────────────────────────────────────────
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

// ── Filtres segment ──────────────────────────────────────────────────────────
const SEGMENT_DEFS: FilterRuleDef[] = [
  { key: 'type',      label: 'Type',             dataType: 'select', options: [{ value: 'SOCIETE', label: 'Société' }, { value: 'PARTICULIER', label: 'Particulier' }], getValue: (c) => c.clientType },
  { key: 'name',      label: 'Nom',              dataType: 'text',   getValue: (c) => c.name },
  { key: 'email',     label: 'Email',            dataType: 'text',   getValue: (c) => c.email ?? '' },
  { key: 'city',      label: 'Ville',            dataType: 'text',   getValue: (c) => c.city ?? '' },
  { key: 'country',   label: 'Pays',             dataType: 'text',   getValue: (c) => c.country ?? '' },
  { key: 'status',    label: 'Statut',           dataType: 'select', options: [{ value: 'actif', label: 'Actif' }, { value: 'inactif', label: 'Inactif' }], getValue: (c) => c.isActive === false ? 'inactif' : 'actif' },
  { key: 'createdAt', label: 'Date de création', dataType: 'date',   getValue: (c) => c.createdAt?.slice(0, 10) ?? '' },
];

// ── Formulaire nouveau client ────────────────────────────────────────────────
const emptyForm = () => ({
  clientType: 'SOCIETE' as 'SOCIETE' | 'PARTICULIER',
  denomination: '', formeJuridique: '', prenom: '', nom: '',
  email: '', phone: '', streetNumber: '', address: '', postalCode: '', city: '', country: 'LU', vatNumber: '', notes: '',
});

// ── Formulaire nouveau contact ───────────────────────────────────────────────
const emptyContactForm = (companyId: string, jobTitle = '') => ({
  firstName: '', lastName: '', email: '', phone: '', jobTitle, companyId,
});

// ── Bloc contacts dans la modale ─────────────────────────────────────────────
function ContactBlock({
  title, color, qualifications, contactList, companyId, onCreated,
}: {
  title: string;
  color: string;
  qualifications: string[];
  contactList: Contact[];
  companyId: string;
  onCreated: () => void;
}) {
  const filtered = contactList.filter(c => qualifications.includes(c.jobTitle ?? ''));
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState(emptyContactForm(companyId, qualifications[0]));
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await contacts.create(form);
      setForm(emptyContactForm(companyId, qualifications[0]));
      setAdding(false);
      onCreated();
    } finally { setSaving(false); }
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: T.border }}>
      {/* En-tête bloc */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: T.head, borderBottom: `1px solid ${T.border}` }}>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{title}</span>
          <span className="ml-2 text-xs" style={{ color: T.muted }}>({qualifications.join(', ')})</span>
        </div>
        <button
          onClick={() => { setAdding(a => !a); setForm(emptyContactForm(companyId, qualifications[0])); }}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors"
          style={{ background: color + '18', color, border: `1px solid ${color}40` }}
        >
          {adding ? '✕ Annuler' : '+ Ajouter'}
        </button>
      </div>

      {/* Mini-formulaire */}
      {adding && (
        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-3" style={{ borderBottom: `1px solid ${T.border}`, background: '#FAFAF9' }}>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Prénom" required>
              <input className={inputClass} value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
            </FormField>
            <FormField label="Nom" required>
              <input className={inputClass} value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email">
              <input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} />
            </FormField>
            <FormField label="Téléphone">
              <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Qualification">
            <select className={selectClass} value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)}>
              {qualifications.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </FormField>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setAdding(false)}
              className="text-sm px-4 py-2 rounded-lg border cursor-pointer"
              style={{ borderColor: T.border, color: T.muted }}>Annuler</button>
            <button type="submit" disabled={saving}
              className="text-sm px-4 py-2 rounded-lg font-semibold cursor-pointer"
              style={{ background: T.copper, color: '#FFF', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {/* Liste contacts */}
      {filtered.length === 0 ? (
        <p className="px-4 py-4 text-sm" style={{ color: T.muted }}>Aucune personne dans cette catégorie.</p>
      ) : (
        <div className="divide-y" style={{ '--tw-divide-color': T.rowDiv } as any}>
          {filtered.map(ct => (
            <div key={ct.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: color + '20', color }}>
                {ct.firstName[0]}{ct.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: T.dark }}>{ct.firstName} {ct.lastName}</p>
                <p className="text-xs" style={{ color: T.muted }}>
                  {ct.email ?? ''}
                  {ct.phone ? (ct.email ? ` · ${ct.phone}` : ct.phone) : ''}
                  {(ct as any).mobile ? ` · ${(ct as any).mobile}` : ''}
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{ background: color + '15', color }}>
                {ct.jobTitle}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Modale détail client ──────────────────────────────────────────────────────
function CompanyDetailModal({ company, onClose, onNoteSaved }: { company: Company; onClose: () => void; onNoteSaved: (id: string, notes: string) => void }) {
  const [ctList, setCtList]   = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote]       = useState(company.notes ?? '');
  const [savingNote, setSavingNote] = useState(false);

  const loadContacts = () => {
    setLoading(true);
    contacts.list(undefined, company.id).then(setCtList).finally(() => setLoading(false));
  };
  useEffect(() => { loadContacts(); }, [company.id]);

  const saveNote = async () => {
    setSavingNote(true);
    try {
      await companies.update(company.id, { notes: note } as any);
      onNoteSaved(company.id, note);
    } finally { setSavingNote(false); }
  };

  const addr = [company.streetNumber, company.address, company.postalCode, company.city, company.country]
    .filter(Boolean).join(' · ');

  return (
    <Modal title={company.name} open onClose={onClose} wide>
      <div className="space-y-5">

        {/* ── Bloc infos client ── */}
        <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: T.border, background: '#FAFAF9' }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: T.copper }}>Informations client</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div><span style={{ color: T.muted }}>Type : </span><span style={{ color: T.dark }}>{company.clientType === 'SOCIETE' ? 'Société' : 'Particulier'}</span></div>
            {company.formeJuridique && <div><span style={{ color: T.muted }}>Forme juridique : </span><span style={{ color: T.dark }}>{company.formeJuridique}</span></div>}
            {company.vatNumber     && <div><span style={{ color: T.muted }}>N° TVA : </span><span style={{ color: T.dark }}>{company.vatNumber}</span></div>}
            {company.email         && <div><span style={{ color: T.muted }}>Email : </span><span style={{ color: T.dark }}>{company.email}</span></div>}
            {company.phone         && <div><span style={{ color: T.muted }}>Téléphone : </span><span style={{ color: T.dark }}>{company.phone}</span></div>}
            {addr                  && <div className="col-span-2"><span style={{ color: T.muted }}>Adresse : </span><span style={{ color: T.dark }}>{addr}</span></div>}
            {company.notes         && <div className="col-span-2"><span style={{ color: T.muted }}>Notes : </span><span style={{ color: T.dark }}>{company.notes}</span></div>}
          </div>
        </div>

        {/* ── Personnes directement liées ── */}
        {loading ? (
          <p className="text-sm text-center py-4" style={{ color: T.muted }}>Chargement des contacts…</p>
        ) : (
          <>
            <ContactBlock
              title="Personnes directement liées"
              color="#1D6FD8"
              qualifications={QUALS_DIRECTES}
              contactList={ctList}
              companyId={company.id}
              onCreated={loadContacts}
            />
            <ContactBlock
              title="Autres intervenants"
              color="#C8803A"
              qualifications={QUALS_AUTRES}
              contactList={ctList}
              companyId={company.id}
              onCreated={loadContacts}
            />
          </>
        )}

        {/* ── Bloc Notes ── */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: T.border }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: T.head, borderBottom: `1px solid ${T.border}` }}>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: T.muted }}>Notes</span>
            <button
              onClick={saveNote}
              disabled={savingNote}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors"
              style={{ background: T.copper + '18', color: T.copper, border: `1px solid ${T.copper}40`, opacity: savingNote ? 0.6 : 1 }}
            >
              {savingNote ? 'Enregistrement…' : '💾 Enregistrer'}
            </button>
          </div>
          <div className="p-3">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={4}
              placeholder="Commentaires, informations complémentaires…"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{ background: '#FAFAF9', border: `1px solid ${T.border}`, color: T.dark }}
            />
          </div>
        </div>

      </div>
    </Modal>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ClientsPage() {
  const [list, setList]             = useState<Company[]>([]);
  const [loading, setLoading]       = useState(true);
  const [open, setOpen]             = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [form, setForm]             = useState(emptyForm());
  const [saving, setSaving]         = useState(false);
  const [toggling, setToggling]     = useState<string | null>(null);
  const [detail, setDetail]         = useState<Company | null>(null);

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

  const openEdit = (e: React.MouseEvent, c: Company) => {
    e.stopPropagation();
    setForm({
      clientType: c.clientType, denomination: c.denomination ?? '', formeJuridique: c.formeJuridique ?? '',
      prenom: c.prenom ?? '', nom: c.nom ?? '', email: c.email ?? '', phone: c.phone ?? '',
      streetNumber: c.streetNumber ?? '', address: c.address ?? '', postalCode: c.postalCode ?? '',
      city: c.city ?? '', country: c.country ?? 'LU', vatNumber: c.vatNumber ?? '', notes: c.notes ?? '',
    });
    setEditCompany(c);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await companies.create(form); setOpen(false); setForm(emptyForm()); load(); }
    finally { setSaving(false); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editCompany) return; setSaving(true);
    try { await companies.update(editCompany.id, form as any); setEditCompany(null); setForm(emptyForm()); load(); }
    finally { setSaving(false); }
  };

  const toggleActive = async (e: React.MouseEvent, c: Company) => {
    e.stopPropagation();
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
          ...(visible.includes('reference')  ? [{ label: 'Réf.' }] : []),
          ...(visible.includes('name')       ? [{ label: 'Nom',      key: 'name' }] : []),
          ...(visible.includes('email')      ? [{ label: 'Email' }] : []),
          ...(visible.includes('city')       ? [{ label: 'Ville',    key: 'city' }] : []),
          ...(visible.includes('country')    ? [{ label: 'Pays' }] : []),
          ...(visible.includes('status')     ? [{ label: 'Statut' }] : []),
          ...(visible.includes('createdAt')  ? [{ label: 'Création', key: 'createdAt' }] : []),
          { label: '', align: 'center' as const },
        ]}>
        {pagination.paged.map((c, i) => {
          const inactive = c.isActive === false;
          return (
            <tr key={c.id}
              onClick={() => setDetail(c)}
              className="cursor-pointer transition-colors"
              style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined, opacity: inactive ? 0.55 : 1 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F5EDE420'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
            >
              <td className="px-4 py-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={c.clientType === 'SOCIETE' ? { background: '#EFF6FF', color: '#1D6FD8' } : { background: '#F0FDF4', color: '#16A34A' }}>
                  {c.clientType === 'SOCIETE' ? 'Société' : 'Particulier'}
                </span>
              </td>
              {visible.includes('reference')  && <td className="px-4 py-3 font-mono text-xs" style={{ color: T.muted }}>{(c as any).reference ?? '—'}</td>}
              {visible.includes('name') && (
                <td className="px-4 py-3 font-semibold text-sm" style={{ color: T.dark }}>
                  {c.name}
                  {inactive && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#F5F5F5', color: '#999' }}>Inactif</span>}
                </td>
              )}
              {visible.includes('email')      && <Td>{c.email ?? '—'}</Td>}
              {visible.includes('city')       && <Td>{c.city ?? '—'}</Td>}
              {visible.includes('country')    && <Td>{c.country ?? '—'}</Td>}
              {visible.includes('status')     && <td className="px-4 py-3 text-xs font-semibold" style={{ color: inactive ? '#999' : '#16A34A' }}>{inactive ? 'Inactif' : 'Actif'}</td>}
              {visible.includes('createdAt')  && <Td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-LU') : '—'}</Td>}
              <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-1.5">
                  <button onClick={e => openEdit(e, c)}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer"
                    style={{ color: T.copper, borderColor: T.copper + '60', background: 'transparent' }}>
                    ✎ Modifier
                  </button>
                  <button onClick={e => toggleActive(e, c)} disabled={toggling === c.id}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer"
                    style={inactive ? { color: '#16A34A', borderColor: '#BBF7D0', background: 'transparent', opacity: toggling === c.id ? 0.5 : 1 }
                                    : { color: '#DC2626', borderColor: '#FECACA', background: 'transparent', opacity: toggling === c.id ? 0.5 : 1 }}>
                    {inactive ? 'Réactiver' : 'Désactiver'}
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      <TableFooter pagination={pagination}
        export={{ getData: () => filtered.map(c => ({ Référence: (c as any).reference ?? '', Type: c.clientType === 'SOCIETE' ? 'Société' : 'Particulier', Nom: c.name, 'Forme juridique': c.formeJuridique ?? '', Email: c.email ?? '', Téléphone: c.phone ?? '', 'N°': c.streetNumber ?? '', Rue: c.address ?? '', 'Code postal': c.postalCode ?? '', Ville: c.city ?? '', Pays: c.country ?? '', 'N° TVA': c.vatNumber ?? '', Statut: c.isActive === false ? 'Inactif' : 'Actif' })), filename: 'clients', title: 'Clients' }}
        columnSelector={{ allCols: [
          { key: 'reference', label: 'Réf.' }, { key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' },
          { key: 'city', label: 'Ville' }, { key: 'country', label: 'Pays' }, { key: 'status', label: 'Statut' }, { key: 'createdAt', label: 'Création' },
        ], visible, toggle: colToggle }}
      />

      {/* ── Modale détail client ── */}
      {detail && (
        <CompanyDetailModal
          company={detail}
          onClose={() => setDetail(null)}
          onNoteSaved={(id, notes) => {
            setList(l => l.map(x => x.id === id ? { ...x, notes } : x));
            setDetail(d => d ? { ...d, notes } : d);
          }}
        />
      )}

      {/* ── Modale édition client ── */}
      <Modal title="Modifier le client" open={!!editCompany} onClose={() => setEditCompany(null)}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {form.clientType === 'SOCIETE' ? (
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Dénomination" required>
                <input className={inputClass} value={form.denomination} onChange={e => set('denomination', e.target.value)} required />
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
              <FormField label="Prénom" required><input className={inputClass} value={form.prenom} onChange={e => set('prenom', e.target.value)} required /></FormField>
              <FormField label="Nom" required><input className={inputClass} value={form.nom} onChange={e => set('nom', e.target.value)} required /></FormField>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email"><input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} /></FormField>
            <FormField label="Téléphone"><input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} /></FormField>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: '90px 1fr' }}>
            <FormField label="N°"><input className={inputClass} value={form.streetNumber} onChange={e => set('streetNumber', e.target.value)} /></FormField>
            <FormField label="Rue"><input className={inputClass} value={form.address} onChange={e => set('address', e.target.value)} /></FormField>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: '100px 1fr 1fr' }}>
            <FormField label="Code postal"><input className={inputClass} value={form.postalCode} onChange={e => set('postalCode', e.target.value)} /></FormField>
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
          <FormField label="N° TVA"><input className={inputClass} value={form.vatNumber} onChange={e => set('vatNumber', e.target.value)} /></FormField>
          <FormField label="Notes"><textarea className={inputClass} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></FormField>
          <FormActions onCancel={() => setEditCompany(null)} saving={saving} label="Enregistrer" />
        </form>
      </Modal>

      {/* ── Modale nouveau client ── */}
      <Modal title="Nouveau client" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: T.border }}>
            {(['SOCIETE', 'PARTICULIER'] as const).map(t => (
              <button key={t} type="button"
                onClick={() => set('clientType', t)}
                className="flex-1 py-2 text-sm font-semibold transition-all"
                style={form.clientType === t ? { background: T.copper, color: '#FFF' } : { background: '#FFF', color: T.muted }}>
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
          <div className="grid gap-3" style={{ gridTemplateColumns: '90px 1fr' }}>
            <FormField label="N°"><input className={inputClass} placeholder="42" value={form.streetNumber} onChange={e => set('streetNumber', e.target.value)} /></FormField>
            <FormField label="Rue"><input className={inputClass} placeholder="Route d'Arlon" value={form.address} onChange={e => set('address', e.target.value)} /></FormField>
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
