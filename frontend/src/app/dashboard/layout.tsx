'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { users, UserProfile } from '@/lib/api';

const nav = [
  {
    items: [
      { href: '/dashboard', label: 'Tableau de bord', icon: '⊞' },
    ],
  },
  {
    label: 'CRM',
    items: [
      { href: '/dashboard/companies', label: 'Clients',  icon: '🏢' },
      { href: '/dashboard/contacts',  label: 'Contacts', icon: '👤' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { href: '/dashboard/quotes',      label: 'Devis',       icon: '📄' },
      { href: '/dashboard/deals',       label: 'Affaires',    icon: '🤝' },
      { href: '/dashboard/commissions', label: 'Commissions', icon: '💰' },
      { href: '/dashboard/projects',    label: 'Projets',     icon: '📁' },
    ],
  },
  {
    label: 'Facturation',
    items: [
      { href: '/dashboard/invoices',     label: 'Factures',        icon: '🧾' },
      { href: '/dashboard/credit-notes', label: 'Notes de crédit', icon: '↩' },
      { href: '/dashboard/prestations',  label: 'Prestations',     icon: '📋' },
    ],
  },
];

const agendaNav = {
  label: 'Agenda',
  items: [
    { href: '/dashboard/agenda', label: 'Calendrier', icon: '📅' },
  ],
};

const adminNav = {
  label: 'Administration',
  items: [
    { href: '/dashboard/users',    label: 'Utilisateurs', icon: '👥' },
    { href: '/dashboard/settings', label: 'Paramètres',   icon: '⚙' },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Admin — modale nouvel utilisateur
  const [newUserOpen, setNewUserOpen] = useState(false);
  const emptyNewUser = () => ({ firstName: '', lastName: '', username: '', email: '', password: '', jobTitle: '', birthDate: '', role: 'MEMBER' });
  const [newUserForm, setNewUserForm] = useState(emptyNewUser());
  const [newUserSaving, setNewUserSaving] = useState(false);
  const [newUserError, setNewUserError] = useState('');
  const [newUserDone, setNewUserDone] = useState(false);

  const openNewUser = () => { setNewUserForm(emptyNewUser()); setNewUserError(''); setNewUserDone(false); setNewUserOpen(true); };
  const setNU = (k: string, v: string) => setNewUserForm(f => ({ ...f, [k]: v }));

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserForm.password.length < 8) { setNewUserError('Minimum 8 caractères pour le mot de passe.'); return; }
    setNewUserSaving(true); setNewUserError('');
    try {
      const data: any = { firstName: newUserForm.firstName, lastName: newUserForm.lastName, email: newUserForm.email, password: newUserForm.password, role: newUserForm.role };
      if (newUserForm.username) data.username = newUserForm.username;
      if (newUserForm.jobTitle) data.jobTitle = newUserForm.jobTitle;
      if (newUserForm.birthDate) data.birthDate = newUserForm.birthDate;
      await users.create(data);
      setNewUserDone(true);
    } catch (err: any) {
      setNewUserError(err.message ?? 'Erreur');
    } finally { setNewUserSaving(false); }
  };

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  const allNav = user.role === 'ADMIN' ? [...nav, agendaNav, adminNav] : [...nav, agendaNav];

  return (
    <div className="flex h-screen" style={{ background: '#F8F5F2' }}>
      {/* Sidebar */}
      <aside className="w-60 flex flex-col flex-shrink-0" style={{ background: '#1A1008', borderRight: '1px solid #2E1E10' }}>
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid #2E1E10' }}>
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
              <path d="M50 4 L96 50 L50 96 L4 50 Z" stroke="#C8803A" strokeWidth="4" fill="none" />
              <path d="M50 16 L84 50 L50 84 L16 50 Z" stroke="#C8803A" strokeWidth="2" fill="none" />
              <line x1="50" y1="30" x2="50" y2="70" stroke="#F5EDE4" strokeWidth="4" strokeLinecap="round" />
              <line x1="36" y1="30" x2="64" y2="30" stroke="#F5EDE4" strokeWidth="4" strokeLinecap="round" />
              <line x1="36" y1="70" x2="64" y2="70" stroke="#F5EDE4" strokeWidth="4" strokeLinecap="round" />
              <circle cx="50" cy="50" r="4" fill="#C8803A" />
            </svg>
            <div className="font-bold tracking-[0.18em] text-4xl" style={{ color: '#F5EDE4' }}>INEE</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-3">
          {allNav.map((group, gi) => (
            <div key={gi} className="rounded-xl overflow-hidden" style={{ border: '1px solid #2E1E10', background: 'rgba(255,255,255,0.03)' }}>
              {group.label && (
                <p className="px-3 pt-2.5 pb-1.5 text-[13px] font-bold uppercase tracking-widest" style={{ color: '#5A3820', borderBottom: '1px solid #2E1E10' }}>
                  {group.label}
                </p>
              )}
              <div className="p-1.5 space-y-0.5">
                {group.items.map(item => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                      style={{
                        background: active ? 'rgba(200,128,58,0.15)' : 'transparent',
                        color:      active ? '#C8803A' : '#8A7060',
                        fontWeight: active ? '600' : '400',
                        borderLeft: active ? '2px solid #C8803A' : '2px solid transparent',
                      }}
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 pt-3" style={{ borderTop: '1px solid #2E1E10' }}>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#C8803A', color: '#FFF' }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#F5EDE4' }}>{user.firstName} {user.lastName}</p>
              <p className="text-xs truncate" style={{ color: '#5A4030' }}>{user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { logout(); router.replace('/login'); }}
              className="flex-1 text-left text-xs px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ color: '#5A4030' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#8A7060'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#5A4030'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              ↩ Se déconnecter
            </button>
            {user.role === 'ADMIN' && (
              <button
                onClick={openNewUser}
                title="Ajouter un utilisateur"
                className="p-1.5 rounded-lg transition-colors cursor-pointer text-2xl leading-none"
                style={{ color: '#5A4030' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C8803A'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#5A4030'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                🔑
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Admin — modale nouvel utilisateur */}
      {newUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-md rounded-xl shadow-2xl p-6 space-y-4" style={{ background: '#FFF' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold" style={{ color: '#1A1008' }}>🔑 Nouvel utilisateur</h2>
              <button onClick={() => setNewUserOpen(false)} className="cursor-pointer" style={{ color: '#AAA', fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>

            {newUserDone ? (
              <div className="text-center space-y-3 py-4">
                <p className="text-3xl">✓</p>
                <p className="font-semibold text-sm" style={{ color: '#16A34A' }}>Utilisateur créé avec succès</p>
                <button onClick={() => setNewUserOpen(false)} className="cursor-pointer w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#C8803A' }}>Fermer</button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#4A3020' }}>Prénom *</label>
                    <input value={newUserForm.firstName} onChange={e => setNU('firstName', e.target.value)} required className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid #E8DDD5', background: '#FFF8F4' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#4A3020' }}>Nom *</label>
                    <input value={newUserForm.lastName} onChange={e => setNU('lastName', e.target.value)} required className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid #E8DDD5', background: '#FFF8F4' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#4A3020' }}>Nom d'utilisateur</label>
                  <input value={newUserForm.username} onChange={e => setNU('username', e.target.value)} placeholder="ex : jdupont" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid #E8DDD5', background: '#FFF8F4' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#4A3020' }}>Email *</label>
                  <input type="email" value={newUserForm.email} onChange={e => setNU('email', e.target.value)} required className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid #E8DDD5', background: '#FFF8F4' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#4A3020' }}>Mot de passe * (min. 8 caractères)</label>
                  <input type="password" value={newUserForm.password} onChange={e => setNU('password', e.target.value)} required minLength={8} placeholder="••••••••" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid #E8DDD5', background: '#FFF8F4' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#4A3020' }}>Fonction</label>
                    <input value={newUserForm.jobTitle} onChange={e => setNU('jobTitle', e.target.value)} placeholder="Comptable, RH..." className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid #E8DDD5', background: '#FFF8F4' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#4A3020' }}>Date de naissance</label>
                    <input type="date" value={newUserForm.birthDate} onChange={e => setNU('birthDate', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ border: '1.5px solid #E8DDD5', background: '#FFF8F4' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#4A3020' }}>Rôle</label>
                  <select value={newUserForm.role} onChange={e => setNU('role', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none cursor-pointer" style={{ border: '1.5px solid #E8DDD5', background: '#FFF8F4' }}>
                    <option value="MEMBER">Membre</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
                {newUserError && <p className="text-xs font-semibold" style={{ color: '#DC2626' }}>{newUserError}</p>}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setNewUserOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium cursor-pointer" style={{ border: '1px solid #E8DDD5', color: '#7A6050' }}>Annuler</button>
                  <button type="submit" disabled={newUserSaving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ background: '#C8803A', opacity: newUserSaving ? 0.6 : 1 }}>
                    {newUserSaving ? '…' : 'Créer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
