'use client';
import { useEffect, useState } from 'react';
import { invoicing, Invoice } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SENT: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);

export default function InvoicesPage() {
  const [list, setList] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (status?: string) => {
    setLoading(true);
    invoicing.invoices.list(status || undefined).then(setList).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Factures</h1>
        <span className="text-sm text-gray-400">{list.length} facture(s)</span>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        {['', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'].map(s => (
          <button
            key={s}
            onClick={() => { setFilter(s); load(s || undefined); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s || 'Toutes'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Chargement...</div>
        ) : list.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Aucune facture</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Numéro</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Société</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">HT</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">TVA</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">TTC</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Payé</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{inv.number}</td>
                  <td className="px-4 py-3 text-gray-500">{inv.company?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmt(inv.subtotal)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{fmt(inv.vatAmount)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(inv.total)}</td>
                  <td className="px-4 py-3 text-right text-green-600">{fmt(inv.paidAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
