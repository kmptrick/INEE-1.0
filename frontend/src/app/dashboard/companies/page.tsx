'use client';
import { useEffect, useState } from 'react';
import { companies, Company } from '@/lib/api';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, DataTable, Td, FormActions } from '@/components/PageShell';

const FORMES = ['Sàrl', 'SA', 'SNC', 'SCS', 'SC', 'GIE', 'ASBL', 'Fondation', 'Autre'];

const emptyForm = () => ({
  clientType: 'SOCIETE' as 'SOCIETE' | 'PARTICULIER',
  denomination: '', formeJuridique: '', prenom: '', nom: '',
  email: '', phone: '', city: '', country: 'LU', vatNumber: '', notes: '',
});

export default function ClientsPage() {
  const [list, setList] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = (q?: string) => { setLoading(true); companies.list(q).then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await companies.create(form); setOpen(false); setForm(emptyForm()); load(search || undefined); }
    finally { setSaving(false); }
  };

  const isSociete = form.clientType === 'SOCIETE';

  return (
    <div className="p-6">
      <PageHeader title="Clients" action={<AddButton onClick={() => { setForm(emptyForm()); setOpen(true); }} />} />

      <div className="mb-5">
        <input type="text" placeholder="Rechercher un client..." value={search}
          onChange={e => { setSearch(e.target.value); load(e.target.value || undefined); }}
          className="px-4 py-2.5 rounded-lg text-sm outline-none w-full max-w-xs transition-all"
          style={{ background: '#FFF', border: `1.5px solid ${T.border}`, color: T.dark }}
          onFocus={e => { e.target.style.borderColor = T.copper; e.target.style.boxShadow = '0 0 0 3px rgba(200,128,58,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      <DataTable loading={loading} empty="Aucun client — cliquez sur «+ Ajouter»"
        headers={[
          { label: 'Type' }, { label: 'Nom' }, { label: 'Email' }, { label: 'Ville' },
          { label: 'N° TVA' }, { label: 'Contacts', align: 'center' }, { label: 'Affaires', align: 'center' },
        ]}>
        {list.map((c, i) => (
          <tr key={c.id} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined }}>
            <td className="px-4 py-3">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={c.clientType === 'SOCIETE'
                  ? { background: '#EFF6FF', color: '#1D6FD8' }
                  : { background: '#F0FDF4', color: '#16A34A' }}>
                {c.clientType === 'SOCIETE' ? 'Société' : 'Particulier'}
              </span>
            </td>
            <Td bold>{c.name}</Td>
            <Td>{c.email ?? '—'}</Td>
            <Td>{c.city ?? '—'}</Td>
            <td className="px-4 py-3 text-xs font-mono" style={{ color: T.muted }}>{c.vatNumber ?? '—'}</td>
            <td className="px-4 py-3 text-center text-sm font-semibold" style={{ color: T.dark }}>{c._count?.contacts ?? 0}</td>
            <td className="px-4 py-3 text-center text-sm font-semibold" style={{ color: T.dark }}>{c._count?.deals ?? 0}</td>
          </tr>
        ))}
      </DataTable>

      <Modal title="Nouveau client" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Type toggle */}
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
                <input className={inputClass} value={form.formeJuridique} onChange={e => set('formeJuridique', e.target.value)} list="formes-list" placeholder="Sàrl, SA..." />
                <datalist id="formes-list">{FORMES.map(f => <option key={f} value={f} />)}</datalist>
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
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ville"><input className={inputClass} value={form.city} onChange={e => set('city', e.target.value)} /></FormField>
            <FormField label="Pays"><input className={inputClass} value={form.country} onChange={e => set('country', e.target.value)} /></FormField>
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
