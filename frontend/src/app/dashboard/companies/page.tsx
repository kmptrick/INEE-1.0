'use client';
import { useEffect, useState } from 'react';
import { companies, Company } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, T } from '@/components/FormField';
import { PageHeader, AddButton, DataTable, Td, FormActions } from '@/components/PageShell';

const empty = { name: '', email: '', phone: '', website: '', address: '', city: '', country: 'LU', vatNumber: '', notes: '' };

export default function CompaniesPage() {
  const [list, setList] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = (q?: string) => { setLoading(true); companies.list(q).then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await companies.create(form); setOpen(false); setForm(empty); load(search || undefined); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6">
      <PageHeader title="Sociétés" action={<AddButton onClick={() => setOpen(true)} />} />

      <div className="mb-5">
        <input type="text" placeholder="Rechercher une société..." value={search}
          onChange={e => { setSearch(e.target.value); load(e.target.value || undefined); }}
          className="px-4 py-2.5 rounded-lg text-sm outline-none w-full max-w-xs transition-all"
          style={{ background: '#FFF', border: `1.5px solid ${T.border}`, color: T.dark }}
          onFocus={e => { e.target.style.borderColor = T.copper; e.target.style.boxShadow = '0 0 0 3px rgba(200,128,58,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      <DataTable loading={loading} empty="Aucune société — cliquez sur «+ Ajouter»"
        headers={[
          { label: 'Nom' }, { label: 'Email' }, { label: 'Ville' }, { label: 'Pays' },
          { label: 'Contacts', align: 'center' }, { label: 'Affaires', align: 'center' },
        ]}>
        {list.map((c, i) => (
          <tr key={c.id} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined }}>
            <Td bold>{c.name}</Td>
            <Td>{c.email ?? '—'}</Td>
            <Td>{c.city ?? '—'}</Td>
            <Td>{c.country ?? '—'}</Td>
            <td className="px-4 py-3 text-center text-sm font-semibold" style={{ color: T.dark }}>{c._count?.contacts ?? 0}</td>
            <td className="px-4 py-3 text-center text-sm font-semibold" style={{ color: T.dark }}>{c._count?.deals ?? 0}</td>
          </tr>
        ))}
      </DataTable>

      <Modal title="Nouvelle société" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nom" required>
            <input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} required />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email"><input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} /></FormField>
            <FormField label="Téléphone"><input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ville"><input className={inputClass} value={form.city} onChange={e => set('city', e.target.value)} /></FormField>
            <FormField label="Pays"><input className={inputClass} value={form.country} onChange={e => set('country', e.target.value)} /></FormField>
          </div>
          <FormField label="N° TVA"><input className={inputClass} placeholder="LU12345678" value={form.vatNumber} onChange={e => set('vatNumber', e.target.value)} /></FormField>
          <FormField label="Notes"><textarea className={inputClass} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></FormField>
          <FormActions onCancel={() => setOpen(false)} saving={saving} />
        </form>
      </Modal>
    </div>
  );
}
