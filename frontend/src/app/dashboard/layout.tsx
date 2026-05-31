'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

// Largeur sidebar en px (utilisé aussi par TableFooter)
export const SIDEBAR_W = 240;

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
      { href: '/dashboard/invoices',       label: 'Factures',        icon: '🧾' },
      { href: '/dashboard/credit-notes',  label: 'Notes de crédit', icon: '↩' },
      { href: '/dashboard/subscriptions', label: 'Souscriptions',   icon: '🔄' },
      { href: '/dashboard/prestations',   label: 'Prestations',     icon: '📋' },
    ],
  },
];

const agendaNav = {
  label: 'Agenda',
  items: [{ href: '/dashboard/agenda', label: 'Calendrier', icon: '📅' }],
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ferme la sidebar mobile au changement de page
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  const allNav = user.role === 'ADMIN' ? [...nav, agendaNav, adminNav] : [...nav, agendaNav];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8F5F2' }}>

      {/* ── Overlay backdrop (mobile uniquement) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      {/*
        Mobile  : position fixed, translate-x-(-100%) par défaut, 0 si ouvert
        Desktop : position relative dans le flex, toujours visible
      */}
      <aside
        className={[
          'flex flex-col flex-shrink-0 h-full z-40',
          'transition-transform duration-200',
          // Mobile : fixed + slide
          'fixed md:relative',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
        style={{
          width: SIDEBAR_W,
          background: '#1A1008',
          borderRight: '1px solid #2E1E10',
        }}
      >
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
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto pb-14 min-w-0">

        {/* Barre mobile avec hamburger — cachée sur desktop (md+) */}
        <div
          className="flex items-center gap-3 px-4 py-3 md:hidden sticky top-0 z-20"
          style={{ background: '#1A1008', borderBottom: '1px solid #2E1E10' }}
        >
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-lg flex-shrink-0 cursor-pointer"
            style={{ background: 'rgba(200,128,58,0.15)', border: '1px solid #3A2010' }}
            aria-label="Ouvrir le menu"
          >
            <span className="block w-5 h-0.5 rounded" style={{ background: '#C8803A' }} />
            <span className="block w-5 h-0.5 rounded" style={{ background: '#C8803A' }} />
            <span className="block w-5 h-0.5 rounded" style={{ background: '#C8803A' }} />
          </button>
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
              <path d="M50 4 L96 50 L50 96 L4 50 Z" stroke="#C8803A" strokeWidth="5" fill="none" />
              <path d="M50 16 L84 50 L50 84 L16 50 Z" stroke="#C8803A" strokeWidth="2.5" fill="none" />
              <line x1="50" y1="30" x2="50" y2="70" stroke="#F5EDE4" strokeWidth="5" strokeLinecap="round" />
              <line x1="36" y1="30" x2="64" y2="30" stroke="#F5EDE4" strokeWidth="5" strokeLinecap="round" />
              <line x1="36" y1="70" x2="64" y2="70" stroke="#F5EDE4" strokeWidth="5" strokeLinecap="round" />
              <circle cx="50" cy="50" r="5" fill="#C8803A" />
            </svg>
            <span className="font-bold tracking-widest text-lg" style={{ color: '#F5EDE4' }}>INEE</span>
          </div>
        </div>

        {children}
      </main>

    </div>
  );
}
