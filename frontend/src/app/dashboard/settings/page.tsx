'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { users, leaveTypes, LeaveType, UserProfile } from '@/lib/api';
import { T, inputClass, selectClass } from '@/components/FormField';

const LEAVE_COLORS = ['#16A34A','#DC2626','#1D6FD8','#D9924E','#7C3AED','#0891B2','#DB2777','#6B7280'];

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'password' | 'leaves'>('password');

  // Password change by select
  const [pwUserId, setPwUserId] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [userList, setUserList] = useState<UserProfile[]>([]);

  // Leave types
  const [ltList, setLtList] = useState<LeaveType[]>([]);
  const [ltLoading, setLtLoading] = useState(true);
  const [ltForm, setLtForm] = useState({ name: '', color: '#16A34A', maxDaysPerYear: '25' });
  const [ltSaving, setLtSaving] = useState(false);
  const [ltEditing, setLtEditing] = useState<LeaveType | null>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    users.list().then(setUserList).catch(() => {});
    leaveTypes.list().then(setLtList).finally(() => setLtLoading(false));
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: T.muted }}>Accès réservé aux administrateurs.</p>
      </div>
    );
  }

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwUserId) { setPwMsg({ ok: false, text: 'Sélectionnez un utilisateur.' }); return; }
    if (pwNew !== pwConfirm) { setPwMsg({ ok: false, text: 'Les mots de passe ne correspondent pas.' }); return; }
    if (pwNew.length < 8) { setPwMsg({ ok: false, text: 'Minimum 8 caractères.' }); return; }
    setPwSaving(true); setPwMsg(null);
    try {
      const target = userList.find(u => u.id === pwUserId)!;
      await users.changePassword(pwUserId, pwNew);
      setPwMsg({ ok: true, text: `Mot de passe mis à jour pour ${target.firstName} ${target.lastName}.` });
      setPwUserId(''); setPwNew(''); setPwConfirm('');
    } catch (err: any) {
      setPwMsg({ ok: false, text: err.message ?? 'Erreur' });
    } finally { setPwSaving(false); }
  };

  const handleSaveLt = async (e: React.FormEvent) => {
    e.preventDefault(); setLtSaving(true);
    try {
      const data = { name: ltForm.name, color: ltForm.color, maxDaysPerYear: parseInt(ltForm.maxDaysPerYear) || 25 };
      if (ltEditing) {
        const updated = await leaveTypes.update(ltEditing.id, data);
        setLtList(l => l.map(x => x.id === ltEditing.id ? updated : x));
      } else {
        const created = await leaveTypes.create(data);
        setLtList(l => [...l, created]);
      }
      setLtForm({ name: '', color: '#16A34A', maxDaysPerYear: '25' });
      setLtEditing(null);
    } finally { setLtSaving(false); }
  };

  const startEditLt = (lt: LeaveType) => {
    setLtEditing(lt);
    setLtForm({ name: lt.name, color: lt.color, maxDaysPerYear: String(lt.maxDaysPerYear) });
  };

  const deleteLt = async (id: string) => {
    await leaveTypes.delete(id);
    setLtList(l => l.filter(x => x.id !== id));
  };

  const toggleLt = async (lt: LeaveType) => {
    const updated = await leaveTypes.update(lt.id, { isActive: !lt.isActive });
    setLtList(l => l.map(x => x.id === lt.id ? updated : x));
  };

  const tabs: { key: 'password' | 'leaves'; label: string }[] = [
    { key: 'password', label: '🔑 Mots de passe' },
    { key: 'leaves',   label: '🏖 Types de congés' },
  ];

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold mb-6" style={{ color: T.dark }}>Paramètres</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: T.border }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer"
            style={{
              color: tab === t.key ? T.copper : T.muted,
              borderBottom: tab === t.key ? `2px solid ${T.copper}` : '2px solid transparent',
              marginBottom: -1,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Password tab */}
      {tab === 'password' && (
        <div className="rounded-xl p-6 space-y-5" style={{ background: '#FFF', border: `1px solid ${T.border}` }}>
          <div>
            <h2 className="text-sm font-bold mb-1" style={{ color: T.dark }}>Changer le mot de passe d'un utilisateur</h2>
            <p className="text-xs" style={{ color: T.muted }}>Sélectionnez un utilisateur et définissez son nouveau mot de passe.</p>
          </div>
          <form onSubmit={handleChangePw} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6B4C35' }}>Utilisateur</label>
              <select value={pwUserId} onChange={e => setPwUserId(e.target.value)} required className={selectClass}
                style={{ color: pwUserId ? T.dark : T.muted }}>
                <option value="">— Sélectionner un utilisateur —</option>
                {userList.map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6B4C35' }}>Nouveau mot de passe</label>
                <input type="password" value={pwNew} onChange={e => setPwNew(e.target.value)} required minLength={8}
                  placeholder="••••••••" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6B4C35' }}>Confirmer</label>
                <input type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} required
                  placeholder="••••••••" className={inputClass} />
              </div>
            </div>
            {pwMsg && (
              <div className="text-xs rounded-lg px-4 py-3"
                style={{ background: pwMsg.ok ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${pwMsg.ok ? '#BBF7D0' : '#FECACA'}`, color: pwMsg.ok ? '#16A34A' : '#B91C1C' }}>
                {pwMsg.text}
              </div>
            )}
            <button type="submit" disabled={pwSaving}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
              style={{ background: T.copper, opacity: pwSaving ? 0.7 : 1 }}>
              {pwSaving ? 'Enregistrement...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      )}

      {/* Leave types tab */}
      {tab === 'leaves' && (
        <div className="space-y-5">
          {/* List */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#FFF', border: `1px solid ${T.border}` }}>
            <div className="px-4 py-3" style={{ background: T.head, borderBottom: `1px solid ${T.border}` }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6B4C35' }}>Types de congés</span>
            </div>
            {ltLoading ? (
              <div className="px-4 py-8 text-center text-sm" style={{ color: T.muted }}>Chargement...</div>
            ) : ltList.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm" style={{ color: T.muted }}>Aucun type de congé — ajoutez-en un ci-dessous.</div>
            ) : (
              <div className="divide-y" style={{ borderColor: T.rowDiv }}>
                {ltList.map(lt => (
                  <div key={lt.id} className="flex items-center gap-3 px-4 py-3" style={{ opacity: lt.isActive ? 1 : 0.5 }}>
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: lt.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: T.dark }}>{lt.name}</p>
                      <p className="text-xs" style={{ color: T.muted }}>{lt.maxDaysPerYear} jours/an max</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleLt(lt)}
                        className="text-xs px-2.5 py-1 rounded-lg border cursor-pointer"
                        style={lt.isActive
                          ? { color: '#DC2626', borderColor: '#FECACA', background: 'transparent' }
                          : { color: '#16A34A', borderColor: '#BBF7D0', background: 'transparent' }}>
                        {lt.isActive ? 'Désactiver' : 'Réactiver'}
                      </button>
                      <button onClick={() => startEditLt(lt)}
                        className="text-xs px-2.5 py-1 rounded-lg border cursor-pointer"
                        style={{ color: T.copper, borderColor: '#FDE68A', background: 'transparent' }}>
                        Modifier
                      </button>
                      <button onClick={() => deleteLt(lt.id)}
                        className="text-xs px-2.5 py-1 rounded-lg border cursor-pointer"
                        style={{ color: '#DC2626', borderColor: '#FECACA', background: 'transparent' }}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="rounded-xl p-5 space-y-4" style={{ background: '#FFF', border: `1px solid ${T.border}` }}>
            <h3 className="text-sm font-bold" style={{ color: T.dark }}>
              {ltEditing ? `Modifier : ${ltEditing.name}` : 'Ajouter un type de congé'}
            </h3>
            <form onSubmit={handleSaveLt} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6B4C35' }}>Nom</label>
                  <input className={inputClass} required value={ltForm.name} onChange={e => setLtForm(f => ({ ...f, name: e.target.value }))} placeholder="Congé annuel" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6B4C35' }}>Jours max / an</label>
                  <input type="number" min="1" max="365" className={inputClass} value={ltForm.maxDaysPerYear}
                    onChange={e => setLtForm(f => ({ ...f, maxDaysPerYear: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6B4C35' }}>Couleur</label>
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    {LEAVE_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setLtForm(f => ({ ...f, color: c }))}
                        className="w-6 h-6 rounded-full transition-all cursor-pointer"
                        style={{ background: c, outline: ltForm.color === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {ltEditing && (
                  <button type="button" onClick={() => { setLtEditing(null); setLtForm({ name: '', color: '#16A34A', maxDaysPerYear: '25' }); }}
                    className="px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer"
                    style={{ color: T.muted, borderColor: T.border }}>
                    Annuler
                  </button>
                )}
                <button type="submit" disabled={ltSaving}
                  className="px-6 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer"
                  style={{ background: T.copper, opacity: ltSaving ? 0.7 : 1 }}>
                  {ltSaving ? '...' : ltEditing ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
