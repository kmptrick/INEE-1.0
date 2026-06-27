'use client';
import { useState, useRef, useEffect } from 'react';
import { T, inputClass } from './FormField';

export interface ComboOption {
  value: string;
  label: string;
}

interface ComboSelectProps {
  options: ComboOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Select avec champ de recherche intégré — remplace les <select> natifs
 * pour les listes longues (clients, contacts…).
 */
export function ComboSelect({
  options,
  value,
  onChange,
  placeholder = '— Choisir —',
  emptyLabel = '— Aucun —',
  required = false,
  disabled = false,
}: ComboSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);

  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Ferme en cliquant à l'extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className="w-full text-left px-3 py-2.5 rounded-lg text-sm outline-none transition-all flex items-center justify-between gap-2"
        style={{
          background: '#FFF',
          border: `1.5px solid ${open ? T.copper : T.border}`,
          color: selected ? T.dark : T.muted,
          boxShadow: open ? `0 0 0 3px rgba(200,128,58,0.1)` : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <span style={{ color: T.muted, fontSize: 10, flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 z-50 rounded-xl shadow-xl mt-1 overflow-hidden"
          style={{ background: '#FFF', border: `1px solid ${T.border}` }}
        >
          {/* Champ de recherche */}
          <div className="p-2" style={{ borderBottom: `1px solid ${T.border}` }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: '#F8F5F2',
                border: `1.5px solid ${T.copper}`,
                color: T.dark,
              }}
            />
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto">
            {/* Option vide */}
            {!required && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                style={{
                  color: T.muted,
                  background: value === '' ? T.copperBg : 'transparent',
                  fontStyle: 'italic',
                }}
                onMouseEnter={e => { if (value !== '') (e.currentTarget as HTMLElement).style.background = '#F8F5F2'; }}
                onMouseLeave={e => { if (value !== '') (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {emptyLabel}
              </button>
            )}

            {filtered.length === 0 ? (
              <p className="px-4 py-4 text-sm text-center" style={{ color: T.muted }}>
                Aucun résultat
              </p>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                  style={{
                    color: opt.value === value ? T.copper : T.dark,
                    fontWeight: opt.value === value ? 600 : 400,
                    background: opt.value === value ? T.copperBg : 'transparent',
                  }}
                  onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = '#F8F5F2'; }}
                  onMouseLeave={e => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = opt.value === value ? T.copperBg : 'transparent'; }}
                >
                  {opt.label}
                  {opt.value === value && <span className="ml-2 text-xs">✓</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
