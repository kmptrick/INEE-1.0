'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { deals, commissions, invoicing, PipelineStats, CommissionStats, InvoicingStats } from '@/lib/api';

const DEAL_STATUS_FR: Record<string, string> = { OPEN: 'En cours', WON: 'Gagné', LOST: 'Perdu' };
const INV_STATUS_FR: Record<string, string> = { DRAFT: 'Brouillon', SENT: 'Envoyée', PAID: 'Payée', OVERDUE: 'En retard', CANCELLED: 'Annulée' };
const dotColor: Record<string, string> = { OPEN: '#D9924E', WON: '#16A34A', LOST: '#DC2626' };

const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E8DDD5', boxShadow: '0 1px 3px rgba(26,16,8,0.04)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#7A6050' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: accent }}>{value}</p>
      {sub && <p className="text-xs mt-1.5" style={{ color: '#A8988A' }}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [pipeline, setPipeline] = useState<PipelineStats[]>([]);
  const [comStats, setComStats] = useState<CommissionStats | null>(null);
  const [invStats, setInvStats] = useState<InvoicingStats | null>(null);

  useEffect(() => {
    deals.stats().then(setPipeline).catch(() => {});
    commissions.stats().then(setComStats).catch(() => {});
    invoicing.stats().then(setInvStats).catch(() => {});
  }, []);

  const openDeals = pipeline.find(p => p.status === 'OPEN');
  const wonDeals  = pipeline.find(p => p.status === 'WON');
  const paidInv   = invStats?.invoiceStats.find((s: any) => s.status === 'PAID');

  const card = { background: '#FFFFFF', border: '1px solid #E8DDD5', boxShadow: '0 1px 3px rgba(26,16,8,0.04)' };

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1008' }}>
          Bonjour, {user?.firstName} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: '#7A6050' }}>Voici un aperçu de votre activité</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <StatCard label="Affaires en cours" value={String(openDeals?._count ?? 0)}
          sub={openDeals ? fmt(openDeals._sum?.value ?? 0) : undefined} accent="#D9924E" />
        <StatCard label="Affaires gagnées"  value={String(wonDeals?._count ?? 0)}
          sub={wonDeals  ? fmt(wonDeals._sum?.value ?? 0)  : undefined} accent="#16A34A" />
        <StatCard label="Commissions en attente" value={comStats ? fmt(comStats.pendingAmount) : '—'}
          sub={`${comStats?.totalCount ?? 0} au total`} accent="#D97706" />
        <StatCard label="Factures payées" value={paidInv ? fmt(paidInv._sum?.total ?? 0) : '—'}
          sub={`${paidInv?._count ?? 0} facture(s)`} accent="#16A34A" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl p-5" style={card}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#6B4C35' }}>Pipeline affaires</h2>
          <div className="space-y-3">
            {pipeline.length === 0 && <p className="text-sm" style={{ color: '#A8988A' }}>Aucune affaire</p>}
            {pipeline.map(p => (
              <div key={p.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor[p.status] ?? '#999' }} />
                  <span className="text-sm font-medium" style={{ color: '#1A1008' }}>{DEAL_STATUS_FR[p.status] ?? p.status}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#F5EDE4', color: '#7A6050' }}>{p._count}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#1A1008' }}>{fmt(p._sum?.value ?? 0)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-5" style={card}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#6B4C35' }}>Commissions</h2>
          {comStats ? (
            <div className="space-y-3">
              {[
                { label: 'Total affaires',     value: fmt(comStats.totalDeals),       color: '#1A1008' },
                { label: 'Total commissions',  value: fmt(comStats.totalCommissions), color: '#D9924E' },
                { label: 'En attente',         value: fmt(comStats.pendingAmount),    color: '#D97706' },
                { label: 'Payées',             value: fmt(comStats.paidAmount),       color: '#16A34A' },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#7A6050' }}>{r.label}</span>
                  <span className="text-sm font-bold" style={{ color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm" style={{ color: '#A8988A' }}>Chargement...</p>}
        </div>

        <div className="rounded-xl p-5 lg:col-span-2" style={card}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#6B4C35' }}>Facturation</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {invStats?.invoiceStats.map((s: any) => (
              <div key={s.status} className="p-4 rounded-lg" style={{ background: '#F8F5F2', border: '1px solid #E8DDD5' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#7A6050' }}>{INV_STATUS_FR[s.status] ?? s.status}</p>
                <p className="font-bold text-base" style={{ color: '#1A1008' }}>{fmt(s._sum?.total ?? 0)}</p>
                <p className="text-xs mt-0.5" style={{ color: '#A8988A' }}>{s._count} facture(s)</p>
              </div>
            ))}
            {(!invStats || invStats.invoiceStats.length === 0) && (
              <p className="text-sm col-span-4" style={{ color: '#A8988A' }}>Aucune facture</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
