'use client';
import { useState, useEffect, useRef } from 'react';
import { services, Service } from '@/lib/api';
import { T } from './FormField';

interface Props {
  onSelect: (s: Service) => void;
}

export function ServicePicker({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = setTimeout(() => {
      services.list(query || undefined).then(setResults).finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const fmt = (n: number) => new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => { setOpen(o => !o); setQuery(''); }}
        className="text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all flex items-center gap-1"
        style={{ color: T.copper, borderColor: T.copper, background: open ? T.copperBg : 'transparent' }}
        title="Sélectionner une prestation du catalogue">
        📋
      </button>

      {open && (
        <div className="absolute z-50 mt-1 right-0 rounded-xl shadow-xl overflow-hidden"
          style={{ width: '480px', background: '#FFF', border: `1px solid ${T.border}`, boxShadow: '0 8px 32px rgba(26,16,8,0.15)' }}>
          <div className="p-3" style={{ borderBottom: `1px solid ${T.border}` }}>
            <input autoFocus type="text" placeholder="Rechercher ID, description, catégorie..."
              value={query} onChange={e => setQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#F8F5F2', border: `1px solid ${T.border}`, color: T.dark }} />
          </div>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {loading && <div className="p-4 text-center text-sm" style={{ color: T.muted }}>Recherche...</div>}
            {!loading && results.length === 0 && <div className="p-4 text-center text-sm" style={{ color: T.muted }}>Aucune prestation trouvée</div>}
            {!loading && results.map(s => (
              <button key={s.id} type="button"
                onClick={() => { onSelect(s); setOpen(false); }}
                className="w-full text-left px-4 py-3 transition-colors flex items-start gap-3"
                style={{ borderBottom: `1px solid ${T.rowDiv}` }}
                onMouseEnter={e => (e.currentTarget.style.background = T.copperBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div className="font-mono text-xs font-bold pt-0.5 flex-shrink-0 w-20" style={{ color: T.copper }}>{s.idPrestation}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: T.dark }}>{s.description}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.muted }}>{s.categorie}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold" style={{ color: T.dark }}>{fmt(s.prixHT)}</div>
                  {s.unite && <div className="text-xs" style={{ color: T.muted }}>{s.unite}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
