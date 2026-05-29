'use client';
import { useEffect, useState } from 'react';
import { contacts, companies, Contact, Company } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, DataTable, Td, FormActions, usePagination, useSort, TableFooter } from '@/components/PageShell';

const empty = { firstName: '', lastName: '', email: '', phone: '', mobile: '', jobTitle: '', companyId: '', notes: '' };

export default function ContactsPage() {
  const [list, setList] = useState<Contact[]>([]);
  const [compList, setCompList] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [togglingActive, setTogglingActive] = useState<string | null>(null);
  const { sort, toggle: sortToggle, sorted } = useSort(list, null);
  const pagination = usePagination(sorted);

  const load = (q?: string) => { setLoading(true); contacts.list(q).then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); companies.list().then(setCompList); }, []);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const data: any = { ...form };
      if (!data.companyId) delete data.companyId;
      await contacts.create(data); setOpen(false); setForm(empty); load(search || undefined);
    } finally { setSaving(false); }
  };

  const toggleInvoice = async (c: Contact) => {
    setToggling(c.id);
    try {
      await contacts.update(c.id, { canReceiveInvoices: !c.canReceiveInvoices });
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

  return (
    <div className="p-6">
      <PageHeader title="Contacts" action={<AddButton onClick={() => setOpen(true)} />} />

      <div className="mb-5">
        <input type="text" placeholder="Rechercher un contact..." value={search}
          onChange={e => { setSearch(e.target.value); load(e.target.value || undefined); }}
          className="px-4 py-2.5 rounded-lg text-sm outline-none w-full max-w-xs transition-all"
          style={{ background: '#FFF', border: `1.5px solid ${T.border}`, color: T.dark }}
          onFocus={e => { e.target.style.borderColor = T.copper; e.target.style.boxShadow = '0 0 0 3px rgba(200,128,58,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      <DataTable loading={loading} empty="Aucun contact — cliquez sur «+ Ajouter»" sort={sort} onSort={sortToggle}
        headers={[
          { label: 'Réf.' }, { label: 'Nom', key: 'lastName' }, { label: 'Email' }, { label: 'Téléphone' },
          { label: 'Poste' }, { label: 'Client' },
          { label: 'Reçoit factures', align: 'center' },
          { label: '', align: 'center' },
        ]}>
        {pagination.paged.map((c, i) => {
          const inactive = c.isActive === false;
          return (
            <tr key={c.id} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined, opacity: inactive ? 0.55 : 1, cursor: 'default' }}>
              <td className="px-4 py-3 font-mono text-xs" style={{ color: T.muted }}>{(c as any).reference ?? '—'}</td>
              <td className="px-4 py-3 font-semibold text-sm" style={{ color: T.dark }}>
                {c.firstName} {c.lastName}
                {inactive && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#F5F5F5', color: '#999' }}>Inactif</span>}
              </td>
              <Td>{c.email ?? '—'}</Td>
              <Td>{c.phone ?? '—'}</Td>
              <Td>{c.jobTitle ?? '—'}</Td>
              <Td>{c.company?.name ?? '—'}</Td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => toggleInvoice(c)}
                  disabled={toggling === c.id || inactive}
                  title={inactive ? 'Contact inactif — ne reçoit pas de mails' : c.canReceiveInvoices ? 'Autorisé à recevoir les factures' : 'Non autorisé'}
                  className="w-9 h-5 rounded-full transition-all relative flex-shrink-0 inline-flex"
                  style={{
                    background: (c.canReceiveInvoices && !inactive) ? T.copper : T.border,
                    opacity: (toggling === c.id || inactive) ? 0.4 : 1,
                  }}>
                  <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
                    style={{ left: (c.canReceiveInvoices && !inactive) ? '18px' : '2px' }} />
                </button>
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => toggleActive(c)}
                  disabled={togglingActive === c.id}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors"
                  style={inactive
                    ? { color: '#16A34A', borderColor: '#BBF7D0', background: 'transparent', opacity: togglingActive === c.id ? 0.5 : 1 }
                    : { color: '#DC2626', borderColor: '#FECACA', background: 'transparent', opacity: togglingActive === c.id ? 0.5 : 1 }}>
                  {inactive ? 'Réactiver' : 'Désactiver'}
                </button>
              </td>
            </tr>
          );
        })}
      </DataTable>
      <TableFooter pagination={pagination} export={{ getData: () => sorted.map(c => ({ Référence: (c as any).reference ?? '', Prénom: c.firstName, Nom: c.lastName, Email: c.email ?? '', Téléphone: c.phone ?? '', Mobile: c.mobile ?? '', Poste: c.jobTitle ?? '', Client: c.company?.name ?? '', 'Reçoit factures': c.canReceiveInvoices ? 'Oui' : 'Non', Statut: c.isActive === false ? 'Inactif' : 'Actif' })), filename: 'contacts', title: 'Contacts' }} />

      <Modal title="Nouveau contact" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Prénom" required><input className={inputClass} value={form.firstName} onChange={e => set('firstName', e.target.value)} required /></FormField>
            <FormField label="Nom" required><input className={inputClass} value={form.lastName} onChange={e => set('lastName', e.target.value)} required /></FormField>
          </div>
          <FormField label="Email"><input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Téléphone"><input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} /></FormField>
            <FormField label="Mobile"><input className={inputClass} value={form.mobile} onChange={e => set('mobile', e.target.value)} /></FormField>
          </div>
          <FormField label="Poste"><input className={inputClass} value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} /></FormField>
          <FormField label="Client">
            <select className={selectClass} value={form.companyId} onChange={e => set('companyId', e.target.value)}>
              <option value="">— Aucune —</option>
              {compList.filter(c => c.isActive !== false).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormActions onCancel={() => setOpen(false)} saving={saving} />
        </form>
      </Modal>
    </div>
  );
}
