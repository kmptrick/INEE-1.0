'use client';
import { useEffect, useState } from 'react';
import { users, UserProfile } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, AddButton, DataTable, Td, FormActions, usePagination, useSort, TableFooter } from '@/components/PageShell';

const ROLE_FR: Record<string, string> = { ADMIN: 'Administrateur', MANAGER: 'Manager', MEMBER: 'Membre' };
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  ADMIN:   { bg: '#FEF3C7', color: '#92400E' },
  MANAGER: { bg: '#EFF6FF', color: '#1D6FD8' },
  MEMBER:  { bg: '#F5F5F5', color: '#666'    },
};

function PasswordModal({ target, onClose }: { target: UserProfile | 'self'; onClose: () => void }) {
  const [pwd, setPwd] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (target === 'self') return;
    setSaving(true);
    try { await users.resetPassword(target.id); setDone(true); }
    finally { setSaving(false); }
  };

  const handleSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (target === 'self') return;
    setSaving(true);
    try { await users.changePassword(target.id, pwd); setDone(true); }
    finally { setSaving(false); }
  };

  const name = target === 'self' ? '' : `${target.firstName} ${target.lastName}`;

  return (
    <Modal title={`Mot de passe — ${name}`} open onClose={onClose}>
      {done ? (
        <div className="space-y-4 text-center">
          <p className="text-2xl">✓</p>
          <p className="text-sm font-semibold" style={{ color: '#16A34A' }}>Opération réussie</p>
          <p className="text-xs" style={{ color: T.muted }}>Un email a été envoyé à l&apos;utilisateur.</p>
          <button onClick={onClose} className="w-full py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: T.copper, color: '#FFF' }}>Fermer</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg p-3 text-sm" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <p className="font-semibold" style={{ color: '#92400E' }}>Option 1 — Réinitialisation automatique</p>
            <p className="text-xs mt-1" style={{ color: T.muted }}>Un mot de passe aléatoire est généré et envoyé par email.</p>
            <button onClick={handleReset} disabled={saving}
              className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold w-full"
              style={{ background: '#C8803A', color: '#FFF', opacity: saving ? 0.6 : 1 }}>
              Réinitialiser et envoyer par email
            </button>
          </div>
          <form onSubmit={handleSet} className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: T.dark }}>Option 2 — Définir un mot de passe</p>
            <FormField label="Nouveau mot de passe (min. 8 caractères)">
              <input type="password" className={inputClass} value={pwd} minLength={8} required
                onChange={e => setPwd(e.target.value)} placeholder="••••••••••••" />
            </FormField>
            <FormActions onCancel={onClose} saving={saving} label="Enregistrer" />
          </form>
        </div>
      )}
    </Modal>
  );
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const [list, setList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [pwTarget, setPwTarget] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'MEMBER' });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const { sort, toggle: sortToggle, sorted } = useSort(list, null);
  const pagination = usePagination(sorted);

  const load = () => { setLoading(true); users.list().then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await users.create(form); setOpen(false); setForm({ firstName: '', lastName: '', email: '', role: 'MEMBER' }); load(); }
    finally { setSaving(false); }
  };

  const toggleActive = async (u: UserProfile) => {
    setToggling(u.id);
    try {
      const updated = u.isActive ? await users.deactivate(u.id) : await users.activate(u.id);
      setList(l => l.map(x => x.id === u.id ? { ...x, isActive: updated.isActive } : x));
    } finally { setToggling(null); }
  };

  if (me?.role !== 'ADMIN') {
    return <div className="p-6 text-sm" style={{ color: T.muted }}>Accès réservé aux administrateurs.</div>;
  }

  return (
    <div className="p-6">
      <PageHeader title="Utilisateurs" action={<AddButton onClick={() => setOpen(true)} label="+ Nouvel utilisateur" />} />

      <DataTable loading={loading} empty="Aucun utilisateur" sort={sort} onSort={sortToggle}
        headers={[
          { label: 'Nom', key: 'lastName' }, { label: 'Email', key: 'email' }, { label: 'Rôle', key: 'role', align: 'center' },
          { label: 'Statut', align: 'center' }, { label: '', align: 'right' },
        ]}>
        {pagination.paged.map((u, i) => {
          const rc = ROLE_COLORS[u.role] ?? ROLE_COLORS.MEMBER;
          const isMe = u.id === me?.id;
          return (
            <tr key={u.id} style={{ borderTop: i > 0 ? `1px solid ${T.rowDiv}` : undefined, opacity: u.isActive ? 1 : 0.55 }}>
              <td className="px-4 py-3 font-semibold text-sm" style={{ color: T.dark }}>
                {u.firstName} {u.lastName}
                {isMe && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: T.copperBg, color: T.copper }}>Moi</span>}
              </td>
              <td className="px-4 py-3 text-sm" style={{ color: T.muted }}>{u.email}</td>
              <td className="px-4 py-3 text-center">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: rc.bg, color: rc.color }}>
                  {ROLE_FR[u.role] ?? u.role}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={u.isActive ? { background: '#F0FDF4', color: '#16A34A' } : { background: '#F5F5F5', color: '#999' }}>
                  {u.isActive ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setPwTarget(u)}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors"
                    style={{ color: T.copper, borderColor: T.copper, background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = T.copperBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    🔑 Mot de passe
                  </button>
                  {!isMe && (
                    <button onClick={() => toggleActive(u)} disabled={toggling === u.id}
                      className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors"
                      style={u.isActive
                        ? { color: '#DC2626', borderColor: '#FECACA', background: 'transparent', opacity: toggling === u.id ? 0.5 : 1 }
                        : { color: '#16A34A', borderColor: '#BBF7D0', background: 'transparent', opacity: toggling === u.id ? 0.5 : 1 }}>
                      {u.isActive ? 'Désactiver' : 'Réactiver'}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>
      <TableFooter pagination={pagination} export={{ getData: () => sorted.map(u => ({ Prénom: u.firstName, Nom: u.lastName, Email: u.email, Rôle: ROLE_FR[u.role] ?? u.role, Statut: u.isActive ? 'Actif' : 'Inactif' })), filename: 'utilisateurs', title: 'Utilisateurs' }} />

      {pwTarget && <PasswordModal target={pwTarget} onClose={() => { setPwTarget(null); }} />}

      <Modal title="Nouvel utilisateur" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Prénom" required>
              <input className={inputClass} value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
            </FormField>
            <FormField label="Nom" required>
              <input className={inputClass} value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
            </FormField>
          </div>
          <FormField label="Email" required>
            <input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} required />
          </FormField>
          <FormField label="Rôle">
            <select className={selectClass} value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="MEMBER">Membre</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </FormField>
          <div className="rounded-lg px-3 py-2.5 text-xs" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            Un mot de passe temporaire sera généré automatiquement et envoyé à l&apos;adresse email renseignée.
          </div>
          <FormActions onCancel={() => setOpen(false)} saving={saving} label="Créer et envoyer" />
        </form>
      </Modal>
    </div>
  );
}
