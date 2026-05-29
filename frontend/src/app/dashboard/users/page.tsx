'use client';
import { useEffect, useState } from 'react';
import { users, UserProfile } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Modal } from '@/components/Modal';
import { FormField, inputClass, selectClass, T } from '@/components/FormField';
import { PageHeader, DataTable, Td, FormActions, usePagination, useSort, TableFooter } from '@/components/PageShell';

const ROLE_FR: Record<string, string> = { ADMIN: 'Administrateur', MANAGER: 'Manager', MEMBER: 'Membre' };
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  ADMIN:   { bg: '#FEF3C7', color: '#92400E' },
  MANAGER: { bg: '#EFF6FF', color: '#1D6FD8' },
  MEMBER:  { bg: '#F5F5F5', color: '#666'    },
};

const emptyEdit = (u?: UserProfile) => ({
  firstName: u?.firstName ?? '',
  lastName:  u?.lastName  ?? '',
  username:  u?.username  ?? '',
  email:     u?.email     ?? '',
  jobTitle:  u?.jobTitle  ?? '',
  birthDate: u?.birthDate ? u.birthDate.slice(0, 10) : '',
  role:      u?.role      ?? 'MEMBER',
});

export default function UsersPage() {
  const { user: me } = useAuth();
  const [list, setList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [editTarget, setEditTarget] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState(emptyEdit());
  const [editSaving, setEditSaving] = useState(false);

  const [pwTarget, setPwTarget] = useState<UserProfile | null>(null);
  const [newPwd, setNewPwd] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwDone, setPwDone] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toggling, setToggling] = useState<string | null>(null);

  const { sort, toggle: sortToggle, sorted } = useSort(list, { key: 'role', dir: 'asc' });
  const pagination = usePagination(sorted);

  const load = () => { setLoading(true); users.list().then(setList).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const setEF = (k: string, v: string) => setEditForm(f => ({ ...f, [k]: v }));

  const openEdit = (u: UserProfile) => { setEditTarget(u); setEditForm(emptyEdit(u)); };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); setEditSaving(true);
    try {
      const data: any = { firstName: editForm.firstName, lastName: editForm.lastName, email: editForm.email, role: editForm.role };
      if (editForm.username)  data.username  = editForm.username;
      if (editForm.jobTitle)  data.jobTitle  = editForm.jobTitle;
      if (editForm.birthDate) data.birthDate = editForm.birthDate;
      await users.update(editTarget!.id, data);
      setEditTarget(null);
      load();
    } finally { setEditSaving(false); }
  };

  const handlePw = async (e: React.FormEvent) => {
    e.preventDefault(); setPwSaving(true);
    try { await users.changePassword(pwTarget!.id, newPwd); setPwDone(true); }
    finally { setPwSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await users.delete(deleteTarget!.id); setDeleteTarget(null); load(); }
    finally { setDeleting(false); }
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
      <PageHeader title="Utilisateurs" />

      <DataTable loading={loading} empty="Aucun utilisateur" sort={sort} onSort={sortToggle}
        headers={[
          { label: 'Nom', key: 'lastName' }, { label: 'Nom d\'utilisateur' }, { label: 'Email', key: 'email' },
          { label: 'Fonction' }, { label: 'Rôle', key: 'role', align: 'center' },
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
              <Td>{u.username ?? '—'}</Td>
              <td className="px-4 py-3 text-sm" style={{ color: T.muted }}>{u.email}</td>
              <Td>{u.jobTitle ?? '—'}</Td>
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
                  <button onClick={() => openEdit(u)}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer"
                    style={{ color: T.copper, borderColor: T.copper, background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = T.copperBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    ✎ Modifier
                  </button>
                  <button onClick={() => { setPwTarget(u); setNewPwd(''); setPwDone(false); }}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer"
                    style={{ color: '#1D6FD8', borderColor: '#BFDBFE', background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#EFF6FF')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    🔑 Mot de passe
                  </button>
                  {!isMe && (
                    <button onClick={() => toggleActive(u)} disabled={toggling === u.id}
                      className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer"
                      style={u.isActive
                        ? { color: '#DC2626', borderColor: '#FECACA', background: 'transparent', opacity: toggling === u.id ? 0.5 : 1 }
                        : { color: '#16A34A', borderColor: '#BBF7D0', background: 'transparent', opacity: toggling === u.id ? 0.5 : 1 }}>
                      {u.isActive ? 'Désactiver' : 'Réactiver'}
                    </button>
                  )}
                  {!isMe && (
                    <button onClick={() => setDeleteTarget(u)}
                      className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer"
                      style={{ color: '#DC2626', borderColor: '#FECACA', background: 'transparent' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      Supprimer
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>
      <TableFooter pagination={pagination} export={{ getData: () => sorted.map(u => ({ Prénom: u.firstName, Nom: u.lastName, Utilisateur: u.username ?? '', Email: u.email, Fonction: u.jobTitle ?? '', Rôle: ROLE_FR[u.role] ?? u.role, Statut: u.isActive ? 'Actif' : 'Inactif' })), filename: 'utilisateurs', title: 'Utilisateurs' }} />

      {/* Modale modification */}
      {editTarget && (
        <Modal title={`Modifier — ${editTarget.firstName} ${editTarget.lastName}`} open onClose={() => setEditTarget(null)}>
          <form onSubmit={handleEdit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Prénom" required>
                <input className={inputClass} value={editForm.firstName} onChange={e => setEF('firstName', e.target.value)} required />
              </FormField>
              <FormField label="Nom" required>
                <input className={inputClass} value={editForm.lastName} onChange={e => setEF('lastName', e.target.value)} required />
              </FormField>
            </div>
            <FormField label="Nom d'utilisateur">
              <input className={inputClass} value={editForm.username} onChange={e => setEF('username', e.target.value)} placeholder="ex : jdupont" />
            </FormField>
            <FormField label="Email" required>
              <input type="email" className={inputClass} value={editForm.email} onChange={e => setEF('email', e.target.value)} required />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Fonction">
                <input className={inputClass} value={editForm.jobTitle} onChange={e => setEF('jobTitle', e.target.value)} placeholder="Comptable, RH..." />
              </FormField>
              <FormField label="Date de naissance">
                <input type="date" className={inputClass} value={editForm.birthDate} onChange={e => setEF('birthDate', e.target.value)} />
              </FormField>
            </div>
            <FormField label="Rôle">
              <select className={selectClass} value={editForm.role} onChange={e => setEF('role', e.target.value)}>
                <option value="MEMBER">Membre</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </FormField>
            <FormActions onCancel={() => setEditTarget(null)} saving={editSaving} label="Enregistrer" />
          </form>
        </Modal>
      )}

      {/* Modale mot de passe */}
      {pwTarget && (
        <Modal title={`Mot de passe — ${pwTarget.firstName} ${pwTarget.lastName}`} open onClose={() => setPwTarget(null)}>
          {pwDone ? (
            <div className="text-center space-y-3 py-4">
              <p className="text-3xl">✓</p>
              <p className="text-sm font-semibold" style={{ color: '#16A34A' }}>Mot de passe mis à jour</p>
              <button onClick={() => setPwTarget(null)} className="w-full py-2.5 rounded-lg text-sm font-semibold cursor-pointer" style={{ background: T.copper, color: '#FFF' }}>Fermer</button>
            </div>
          ) : (
            <form onSubmit={handlePw} className="space-y-4">
              <FormField label="Nouveau mot de passe (min. 8 caractères)">
                <input type="password" className={inputClass} value={newPwd} minLength={8} required
                  onChange={e => setNewPwd(e.target.value)} placeholder="••••••••••••" />
              </FormField>
              <FormActions onCancel={() => setPwTarget(null)} saving={pwSaving} label="Enregistrer" />
            </form>
          )}
        </Modal>
      )}

      {/* Modale confirmation suppression */}
      {deleteTarget && (
        <Modal title="Supprimer l'utilisateur" open onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: T.dark }}>
              Voulez-vous vraiment supprimer <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong> ({deleteTarget.email}) ?
            </p>
            <p className="text-xs" style={{ color: T.muted }}>Cette action est irréversible.</p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer" style={{ border: `1px solid ${T.border}`, color: T.muted }}>Annuler</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ background: '#DC2626', opacity: deleting ? 0.6 : 1 }}>
                {deleting ? '…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
