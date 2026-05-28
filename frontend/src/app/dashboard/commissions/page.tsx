'use client';
import { useEffect, useState } from 'react';
import { commissions, Commission } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);

export default function CommissionsPage() {
  const [list, setList] = useState<Commission[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (status?: string) => {
    setLoading(true);
    commissions.list(status || undefined).then(setList).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Commissions</h1>
        <span className="text-sm text-gray-400">{list.length} commission(s)</span>
      </div>

      <div className="mb-4 flex gap-2">
        {['', 'PENDING', 'APPROVED', 'PAID', 'CANCELLED'].map(s => (
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
          <div className="p-8 text-center text-sm text-gray-400">Aucune commission</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Référence</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Apporteur</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Société</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Affaire</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Taux</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Commission</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.reference}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.brokerName}</td>
                  <td className="px-4 py-3 text-gray-500">{c.company?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmt(c.dealValue)}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{c.commissionRate}%</td>
                  <td className="px-4 py-3 text-right font-semibold text-blue-700">{fmt(c.commissionAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                      {c.status}
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
