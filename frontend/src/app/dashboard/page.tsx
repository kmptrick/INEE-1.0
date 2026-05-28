'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { deals, commissions, invoicing, PipelineStats, CommissionStats, InvoicingStats } from '@/lib/api';

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);
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
  const wonDeals = pipeline.find(p => p.status === 'WON');
  const paidInvoices = invStats?.invoiceStats.find((s: any) => s.status === 'PAID');
  const draftInvoices = invStats?.invoiceStats.find((s: any) => s.status === 'DRAFT');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Bonjour, {user?.firstName} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Voici un aperçu de votre activité</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <StatCard
          label="Deals ouverts"
          value={String(openDeals?._count ?? 0)}
          sub={openDeals ? fmt(openDeals._sum?.value ?? 0) : '—'}
          color="text-blue-600"
        />
        <StatCard
          label="Deals gagnés"
          value={String(wonDeals?._count ?? 0)}
          sub={wonDeals ? fmt(wonDeals._sum?.value ?? 0) : '—'}
          color="text-green-600"
        />
        <StatCard
          label="Commissions en attente"
          value={comStats ? fmt(comStats.pendingAmount) : '—'}
          sub={`${comStats?.totalCount ?? 0} au total`}
          color="text-orange-600"
        />
        <StatCard
          label="Factures payées"
          value={paidInvoices ? fmt(paidInvoices._sum?.total ?? 0) : '—'}
          sub={`${paidInvoices?._count ?? 0} factures`}
          color="text-emerald-600"
        />
      </div>

      {/* Pipeline & Commissions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium text-gray-900 mb-4">Pipeline deals</h2>
          <div className="space-y-3">
            {pipeline.length === 0 && <p className="text-sm text-gray-400">Aucun deal</p>}
            {pipeline.map(p => (
              <div key={p.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    p.status === 'OPEN' ? 'bg-blue-500' : p.status === 'WON' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-700">{p.status}</span>
                  <span className="text-xs text-gray-400">({p._count})</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{fmt(p._sum?.value ?? 0)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium text-gray-900 mb-4">Commissions</h2>
          {comStats ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total affaires</span>
                <span className="font-medium">{fmt(comStats.totalDeals)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total commissions</span>
                <span className="font-medium text-blue-600">{fmt(comStats.totalCommissions)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">En attente</span>
                <span className="font-medium text-orange-600">{fmt(comStats.pendingAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payées</span>
                <span className="font-medium text-green-600">{fmt(comStats.paidAmount)}</span>
              </div>
            </div>
          ) : <p className="text-sm text-gray-400">Chargement...</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
          <h2 className="font-medium text-gray-900 mb-4">Facturation</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {invStats?.invoiceStats.map((s: any) => (
              <div key={s.status} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">{s.status}</p>
                <p className="font-semibold text-gray-900">{fmt(s._sum?.total ?? 0)}</p>
                <p className="text-xs text-gray-400">{s._count} facture(s)</p>
              </div>
            ))}
            {(!invStats || invStats.invoiceStats.length === 0) && (
              <p className="text-sm text-gray-400 col-span-4">Aucune facture</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
