'use client';
import { useState } from 'react';
import { Modal } from './Modal';
import { T } from './FormField';

export type SendType = 'send' | 'reminder1' | 'reminder2' | 'reminder3';
export type SendLang = 'fr' | 'en';

interface Props {
  open: boolean;
  onClose: () => void;
  onSend: (type: SendType, lang: SendLang) => Promise<void>;
  showTypeSelector?: boolean; // true pour factures
  title?: string;
}

const TYPE_OPTIONS = [
  { value: 'send',     label: '1er envoi',    labelEn: '1st sending'  },
  { value: 'reminder1',label: '1er rappel',   labelEn: '1st reminder' },
  { value: 'reminder2',label: '2ème rappel',  labelEn: '2nd reminder' },
  { value: 'reminder3',label: '3ème rappel',  labelEn: '3rd reminder' },
];

export function SendModal({ open, onClose, onSend, showTypeSelector = false, title = 'Envoyer le document' }: Props) {
  const [lang, setLang] = useState<SendLang>('fr');
  const [type, setType] = useState<SendType>('send');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend(type, lang);
      onClose();
    } catch (e: any) {
      alert(e.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal title={title} open={open} onClose={onClose}>
      <div className="space-y-4">

        {/* Langue */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: T.muted }}>Langue / Language</p>
          <div className="flex gap-2">
            {(['fr', 'en'] as SendLang[]).map(l => (
              <button key={l} type="button" onClick={() => setLang(l)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all"
                style={lang === l ? { background: T.copper, color: '#FFF' } : { background: T.head, color: T.muted, border: `1px solid ${T.border}` }}>
                {l === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
              </button>
            ))}
          </div>
        </div>

        {/* Type (factures uniquement) */}
        {showTypeSelector && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: T.muted }}>Type d'envoi</p>
            <div className="space-y-1.5">
              {TYPE_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setType(opt.value as SendType)}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
                  style={{
                    background: type === opt.value ? T.copper + '18' : T.head,
                    color: type === opt.value ? T.copper : T.dark,
                    border: `1px solid ${type === opt.value ? T.copper + '60' : T.border}`,
                    fontWeight: type === opt.value ? '600' : '400',
                  }}>
                  {opt.value === 'send' ? '📤' : '🔔'} {lang === 'fr' ? opt.label : opt.labelEn}
                  {opt.value !== 'send' && <span className="ml-2 text-xs" style={{ color: T.muted }}>
                    {opt.value === 'reminder3' ? '⚠️ Mise en demeure' : ''}
                  </span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Aperçu expéditeur */}
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: T.head, border: `1px solid ${T.border}` }}>
          <span style={{ color: T.muted }}>Expéditeur : </span>
          <span style={{ color: T.dark }}>{showTypeSelector ? 'invoices@inee.lu' : 'contact@inee.lu'}</span>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} type="button"
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
            style={{ border: `1px solid ${T.border}`, color: T.muted, background: 'transparent' }}>
            Annuler
          </button>
          <button onClick={handleSend} disabled={sending}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer"
            style={{ background: T.copper, color: '#FFF', opacity: sending ? 0.7 : 1 }}>
            {sending ? 'Envoi en cours…' : '📧 Envoyer'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
