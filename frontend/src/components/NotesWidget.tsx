'use client';
import { useState, useRef, useEffect } from 'react';
import { T } from './FormField';

interface NotesWidgetProps {
  value: string;
  onChange: (v: string) => void;
  onSave?: () => void;
  saving?: boolean;
}

export function NotesWidget({ value, onChange, onSave, saving }: NotesWidgetProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && textRef.current) textRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-resize textarea
  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.max(80, Math.min(300, el.scrollHeight)) + 'px';
  };

  const hasNote = value && value.trim().length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title={hasNote ? 'Remarque (contenu)' : 'Ajouter une remarque'}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
        style={{
          background: hasNote ? '#FFFBEB' : '#F5F5F5',
          border: `1px solid ${hasNote ? '#FDE68A' : T.border}`,
          color: hasNote ? '#92400E' : T.muted,
        }}>
        📝 <span>Remarque</span>
        {hasNote && <span className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />}
      </button>

      {open && (
        <div className="absolute top-9 right-0 z-50 w-72 rounded-xl shadow-xl overflow-hidden"
          style={{ background: '#FFFDE7', border: '1px solid #FDE68A' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2"
            style={{ background: '#FFF9C4', borderBottom: '1px solid #FDE68A' }}>
            <span className="text-xs font-bold" style={{ color: '#92400E' }}>📝 Remarque</span>
            <button onClick={() => setOpen(false)} className="text-xs cursor-pointer" style={{ color: '#B45309' }}>✕</button>
          </div>
          {/* Textarea */}
          <div className="p-3">
            <textarea
              ref={textRef}
              value={value}
              onChange={e => { onChange(e.target.value); autoResize(e.target); }}
              onFocus={e => autoResize(e.target)}
              placeholder="Ajouter une remarque..."
              className="w-full resize-none outline-none text-xs leading-relaxed"
              style={{
                background: 'transparent',
                color: '#1A1008',
                minHeight: 80,
                fontFamily: 'inherit',
              }}
            />
          </div>
          {/* Footer */}
          {onSave && (
            <div className="flex justify-end px-3 pb-3">
              <button
                type="button"
                onClick={() => { onSave(); setOpen(false); }}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                style={{ background: '#D9924E', color: '#FFF', opacity: saving ? 0.6 : 1 }}>
                {saving ? '…' : 'Enregistrer'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
