'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/api';

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

  // Change-password modal state
  const [pwOpen, setPwOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwDone, setPwDone] = useState(false);

  const openPw = () => { setOldPwd(''); setNewPwd(''); setConfirmPwd(''); setPwError(''); setPwDone(false); setPwOpen(true); };

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setPwError('Les mots de passe ne correspondent pas.'); return; }
    if (newPwd.length < 8) { setPwError('Minimum 8 caractères.'); return; }
    setPwSaving(true); setPwError('');
    try {
      await auth.changePassword(oldPwd, newPwd);
      setPwDone(true);
    } catch (err: any) {
      setPwError(err.message ?? 'Erreur');
    } finally { setPwSaving(false); }
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
          <button
            onClick={openPw}
            className="w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors mb-0.5"
            style={{ color: '#5A4030' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#8A7060'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#5A4030'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            🔑 Changer mon mot de passe
          </button>
          <button
            onClick={() => { logout(); router.replace('/login'); }}
            className="w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors"
            style={{ color: '#5A4030' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#8A7060'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#5A4030'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            ↩ Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Change-password modal */}
      {pwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-sm rounded-xl shadow-2xl p-6 space-y-4" style={{ background: '#FFF' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold" style={{ color: '#1A1008' }}>Changer mon mot de passe</h2>
              <button onClick={() => setPwOpen(false)} style={{ color: '#AAA', fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>

            {pwDone ? (
              <div className="text-center space-y-3 py-4">
                <p className="text-3xl">✓</p>
                <p className="font-semibold text-sm" style={{ color: '#16A34A' }}>Mot de passe mis à jour</p>
                <button onClick={() => setPwOpen(false)}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
                  style={{ background: '#C8803A' }}>Fermer</button>
              </div>
            ) : (
              <form onSubmit={handleChangePw} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#4A3020' }}>Mot de passe actuel</label>
                  <input type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} required
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ border: '1.5px solid #E8DDD5', background: '#FFF8F4' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#4A3020' }}>Nouveau mot de passe</label>
                  <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required minLength={8}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ border: '1.5px solid #E8DDD5', background: '#FFF8F4' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#4A3020' }}>Confirmer le nouveau mot de passe</label>
                  <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ border: '1.5px solid #E8DDD5', background: '#FFF8F4' }} />
                </div>
                {pwError && <p className="text-xs font-semibold" style={{ color: '#DC2626' }}>{pwError}</p>}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setPwOpen(false)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                    style={{ border: '1px solid #E8DDD5', color: '#7A6050' }}>
                    Annuler
                  </button>
                  <button type="submit" disabled={pwSaving}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white"
                    style={{ background: '#C8803A', opacity: pwSaving ? 0.6 : 1 }}>
                    {pwSaving ? '…' : 'Enregistrer'}
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
