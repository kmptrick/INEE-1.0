'use client';
import { useEffect, useState } from 'react';
import { contacts, companies, Contact, Company } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, DataTable, Td, FormActions } from '@/components/PageShell';

const empty = { firstName: '', lastName: '', email: '', phone: '', mobile: '', jobTitle: '', companyId: '', notes: '' };

export default function ContactsPage() {
  const [list, setList] = useState<Contact[]>([]);
  const [compList, setCompList] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

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

      <DataTable loading={loading} empty="Aucun contact — cliquez sur «+ Ajouter»"
        headers={[{ label: 'Nom' }, { label: 'Email' }, { label: 'Téléphone' }, { label: 'Poste' }, { label: 'Société' }]}>
        {list.map((c, i) => (
          <tr key={c.id} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined }}>
            <Td bold>{c.firstName} {c.lastName}</Td>
            <Td>{c.email ?? '—'}</Td>
            <Td>{c.phone ?? '—'}</Td>
            <Td>{c.jobTitle ?? '—'}</Td>
            <Td>{c.company?.name ?? '—'}</Td>
          </tr>
        ))}
      </DataTable>

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
          <FormField label="Société">
            <select className={selectClass} value={form.companyId} onChange={e => set('companyId', e.target.value)}>
              <option value="">— Aucune —</option>
              {compList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormActions onCancel={() => setOpen(false)} saving={saving} />
        </form>
      </Modal>
    </div>
  );
}
