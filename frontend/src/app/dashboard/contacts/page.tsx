'use client';
import { useEffect, useState } from 'react';
import { contacts, companies, Contact, Company } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, DataTable, Td, FormActions, usePagination, useSort, TableFooter, useSegmentFilter, SegmentFilterBar, FilterRuleDef } from '@/components/PageShell';

const QUALIFICATIONS = ['Actionnaire', 'Associé', 'Dirigeant', 'Comptable', 'Agent payeur', 'Autre'];

const emptyForm = () => ({ firstName: '', lastName: '', email: '', phone: '', mobile: '', jobTitle: '', companyId: '', notes: '' });

const SEGMENT_DEFS: FilterRuleDef[] = [
  { key: 'name',      label: 'Nom',             dataType: 'text',   getValue: (c) => `${c.firstName} ${c.lastName}` },
  { key: 'email',     label: 'Email',            dataType: 'text',   getValue: (c) => c.email ?? '' },
  { key: 'jobTitle',  label: 'Poste',            dataType: 'text',   getValue: (c) => c.jobTitle ?? '' },
  { key: 'company',   label: 'Client',           dataType: 'text',   getValue: (c) => c.company?.name ?? '' },
  { key: 'status',    label: 'Statut',           dataType: 'select', options: [{ value: 'actif', label: 'Actif' }, { value: 'inactif', label: 'Inactif' }], getValue: (c) => c.isActive === false ? 'inactif' : 'actif' },
  { key: 'invoices',  label: 'Reçoit factures',  dataType: 'select', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }], getValue: (c) => c.canReceiveInvoices ? 'oui' : 'non' },
  { key: 'createdAt', label: 'Date de création', dataType: 'date',   getValue: (c) => c.createdAt?.slice(0, 10) ?? '' },
];

export default function ContactsPage() {
  const [list, setList]           = useState<Contact[]>([]);
  const [compList, setCompList]   = useState<Company[]>([]);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [form, setForm]           = useState(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [toggling, setToggling]   = useState<string | null>(null);
  const [togglingActive, setTogglingActive] = useState<string | null>(null);

  const { sort, toggle: sortToggle, sorted } = useSort(list);
  const { search, setSearch, rules, addRule, removeRule, updateRule, clearRules, clearAll, filtered, activeCount } = useSegmentFilter(sorted, SEGMENT_DEFS);
  const pagination = usePagination(filtered);

  const load = () => { setLoading(true); contacts.list().then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); companies.list().then(setCompList); }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openEdit = (c: Contact) => {
    setForm({
      firstName: c.firstName, lastName: c.lastName,
      email: c.email ?? '', phone: c.phone ?? '', mobile: (c as any).mobile ?? '',
      jobTitle: c.jobTitle ?? '', companyId: c.company?.id ?? '', notes: (c as any).notes ?? '',
    });
    setEditContact(c);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const data: any = { ...form };
      if (!data.companyId) delete data.companyId;
      await contacts.create(data); setOpen(false); setForm(emptyForm()); load();
    } finally { setSaving(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editContact) return; setSaving(true);
    try {
      const data: any = { ...form };
      if (!data.companyId) delete data.companyId;
      await contacts.update(editContact.id, data);
      setEditContact(null); setForm(emptyForm()); load();
    } finally { setSaving(false); }
  };

  const toggleInvoice = async (c: Contact) => {
    setToggling(c.id);
    try {
      await contacts.update(c.id, { canReceiveInvoices: !c.canReceiveInvoices } as any);
      setList(l => l.map(x => x.id === c.id ? { ...x, canReceiveInvoices: !c.canReceiveInvoices } : x));
    } finally { setToggling(null); }
  };

  const toggleActive = async (c: Contact) => {
    setTogglingActive(c.id);
    try {
      const updated = c.isActive === false ? await contacts.activate(c.id) : await contacts.deactivate(c.id);
      setList(l => l.map(x => x.id === c.id ? { ...x, isActive: updated.isActive } : x));
    } finally { setTogglingActive(null); }
  };

  // Formulaire contact (réutilisé création + édition)
  const ContactForm = ({ onSubmit, onCancel }: { onSubmit: (e: React.FormEvent) => void; onCancel: () => void }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Prénom" required><input className={inputClass} value={form.firstName} onChange={e => set('firstName', e.target.value)} required /></FormField>
        <FormField label="Nom" required><input className={inputClass} value={form.lastName} onChange={e => set('lastName', e.target.value)} required /></FormField>
      </div>
      <FormField label="Email"><input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} /></FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Téléphone 1"><input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} /></FormField>
        <FormField label="Téléphone 2"><input className={inputClass} value={form.mobile} onChange={e => set('mobile', e.target.value)} /></FormField>
      </div>
      <FormField label="Poste / Qualification">
        <select className={selectClass} value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)}>
          <option value="">— Choisir —</option>
          {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
      </FormField>
      <FormField label="Client">
        <select className={selectClass} value={form.companyId} onChange={e => set('companyId', e.target.value)}>
          <option value="">— Aucune —</option>
          {compList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </FormField>
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  );

  return (
    <div className="p-6">
      <PageHeader title="Contacts" action={<AddButton onClick={() => { setForm(emptyForm()); setOpen(true); }} />} />
      <SegmentFilterBar search={search} onSearch={setSearch} placeholder="Rechercher un contact..." defs={SEGMENT_DEFS} rules={rules} addRule={addRule} removeRule={removeRule} updateRule={updateRule} clearRules={clearRules} clearAll={clearAll} activeCount={activeCount} />

      <DataTable loading={loading} empty="Aucun contact — cliquez sur «+ Ajouter»" sort={sort} onSort={sortToggle}
        headers={[
          { label: 'Réf.' }, { label: 'Nom', key: 'lastName' }, { label: 'Email' },
          { label: 'Tél. 1' }, { label: 'Poste' }, { label: 'Client' },
          { label: 'Création', key: 'createdAt' },
          { label: 'Reçoit factures', align: 'center' as const },
          { label: '', align: 'center' as const },
        ]}>
        {pagination.paged.map((c, i) => {
          const inactive = c.isActive === false;
          return (
            <tr key={c.id} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined, opacity: inactive ? 0.55 : 1 }}>
              <td className="px-4 py-3 font-mono text-xs" style={{ color: T.muted }}>{(c as any).reference ?? '—'}</td>
              <td className="px-4 py-3 font-semibold text-sm" style={{ color: T.dark }}>
                {c.firstName} {c.lastName}
                {inactive && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#F5F5F5', color: '#999' }}>Inactif</span>}
              </td>
              <Td>{c.email ?? '—'}</Td>
              <Td>{c.phone ?? '—'}</Td>
              <Td>{c.jobTitle ?? '—'}</Td>
              <Td>{c.company?.name ?? '—'}</Td>
              <Td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-LU') : '—'}</Td>
              {/* Toggle Reçoit factures */}
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => toggleInvoice(c)}
                  disabled={toggling === c.id || inactive}
                  title={inactive ? 'Contact inactif' : c.canReceiveInvoices ? 'Autorisé' : 'Non autorisé'}
                  className="w-9 h-5 rounded-full transition-all relative flex-shrink-0 inline-flex cursor-pointer"
                  style={{ background: (c.canReceiveInvoices && !inactive) ? T.copper : T.border, opacity: (toggling === c.id || inactive) ? 0.4 : 1 }}>
                  <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
                    style={{ left: (c.canReceiveInvoices && !inactive) ? '18px' : '2px' }} />
                </button>
              </td>
              {/* Actions */}
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button onClick={() => openEdit(c)}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer"
                    style={{ color: T.copper, borderColor: T.copper + '60', background: 'transparent' }}>
                    ✎ Modifier
                  </button>
                  <button onClick={() => toggleActive(c)} disabled={togglingActive === c.id}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer"
                    style={inactive
                      ? { color: '#16A34A', borderColor: '#BBF7D0', background: 'transparent', opacity: togglingActive === c.id ? 0.5 : 1 }
                      : { color: '#DC2626', borderColor: '#FECACA', background: 'transparent', opacity: togglingActive === c.id ? 0.5 : 1 }}>
                    {inactive ? 'Réactiver' : 'Désactiver'}
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      <TableFooter pagination={pagination} export={{ getData: () => filtered.map(c => ({
        Référence: (c as any).reference ?? '', Prénom: c.firstName, Nom: c.lastName,
        Email: c.email ?? '', 'Téléphone 1': c.phone ?? '', 'Téléphone 2': (c as any).mobile ?? '',
        Poste: c.jobTitle ?? '', Client: c.company?.name ?? '',
        'Reçoit factures': c.canReceiveInvoices ? 'Oui' : 'Non',
        Statut: c.isActive === false ? 'Inactif' : 'Actif',
      })), filename: 'contacts', title: 'Contacts' }} />

      {/* Modale création */}
      <Modal title="Nouveau contact" open={open} onClose={() => setOpen(false)}>
        <ContactForm onSubmit={handleCreate} onCancel={() => setOpen(false)} />
      </Modal>

      {/* Modale édition */}
      <Modal title="Modifier le contact" open={!!editContact} onClose={() => setEditContact(null)}>
        <ContactForm onSubmit={handleEdit} onCancel={() => setEditContact(null)} />
      </Modal>
    </div>
  );
}
