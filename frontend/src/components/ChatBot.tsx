'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? '';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  ts: number;
}

export default function ChatBot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const manualStopRef = useRef(false);
  const finalRef = useRef('');

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, msgs]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: Message = { role: 'user', text, ts: Date.now() };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId: user?.id,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Inconnu',
          userEmail: user?.email,
          source: 'inee-app',
        }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        data?.output ?? data?.message ?? data?.text ?? data?.reply ??
        (typeof data === 'string' ? data : 'Réponse reçue.');
      setMsgs(prev => [...prev, { role: 'assistant', text: reply, ts: Date.now() }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', text: "Erreur de connexion à l'assistant.", ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function toggleMic() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("La reconnaissance vocale n'est pas supportée par ce navigateur. Utilisez Chrome ou Edge.");
      return;
    }
    if (listening) {
      // Arrêt demandé par l'utilisateur
      manualStopRef.current = true;
      recognitionRef.current?.stop();
      setListening(false);
      inputRef.current?.focus();
      return;
    }
    manualStopRef.current = false;
    finalRef.current = '';
    setInput('');
    const rec = new SR();
    rec.lang = 'fr-FR';
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalRef.current += t + ' ';
        else interim += t;
      }
      setInput((finalRef.current + interim).trim());
    };
    rec.onerror = (ev: any) => {
      // Erreurs fatales : on coupe vraiment. Les autres (no-speech...) seront relancées par onend.
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        manualStopRef.current = true;
        setListening(false);
      }
    };
    rec.onend = () => {
      // Relance automatique tant que l'utilisateur n'a pas cliqué pour arrêter
      if (!manualStopRef.current) {
        try { rec.start(); } catch { /* déjà relancé */ }
      } else {
        setListening(false);
        inputRef.current?.focus();
      }
    };
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Assistant INEE"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: open ? '#1A1008' : 'linear-gradient(135deg, #D9924E 0%, #C8803A 100%)',
          border: '2px solid #C8803A',
          boxShadow: '0 4px 20px rgba(200,128,58,0.4)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          color: open ? '#D9924E' : '#fff',
          fontSize: 22,
        }}
      >
        {open ? '✕' : '✦'}
      </button>

      {/* Fenêtre de chat */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 86,
            right: 24,
            width: 360,
            maxWidth: 'calc(100vw - 32px)',
            height: 480,
            maxHeight: 'calc(100vh - 120px)',
            background: '#1A1008',
            border: '1px solid #3A2010',
            borderRadius: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid #2E1E10',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(200,128,58,0.08)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #D9924E, #C8803A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              ✦
            </div>
            <div>
              <p style={{ color: '#F5EDE4', fontWeight: 600, fontSize: 14, margin: 0 }}>Assistant INEE</p>
              <p style={{ color: '#5A4030', fontSize: 11, margin: 0 }}>Propulsé par n8n</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.length === 0 && (
              <div style={{ textAlign: 'center', color: '#5A4030', fontSize: 13, marginTop: 40 }}>
                <p style={{ fontSize: 22, marginBottom: 8 }}>✦</p>
                <p>Bonjour {user?.firstName} !<br />Comment puis-je vous aider ?</p>
              </div>
            )}
            {msgs.map(m => (
              <div
                key={m.ts}
                style={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '9px 13px',
                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: m.role === 'user' ? 'linear-gradient(135deg, #D9924E, #C8803A)' : 'rgba(255,255,255,0.07)',
                    color: m.role === 'user' ? '#fff' : '#D4C4B4',
                    fontSize: 13,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {m.role === 'assistant' ? <span dangerouslySetInnerHTML={{ __html: m.text }} /> : m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '9px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'rgba(255,255,255,0.07)',
                    color: '#5A4030',
                    fontSize: 20,
                    letterSpacing: 4,
                  }}
                >
                  ···
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '10px 12px',
              borderTop: '1px solid #2E1E10',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Votre message… (Entrée pour envoyer)"
              rows={1}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid #3A2010',
                borderRadius: 10,
                color: '#F5EDE4',
                fontSize: 13,
                padding: '8px 12px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                maxHeight: 100,
                overflow: 'auto',
              }}
            />
            <button
              onClick={toggleMic}
              title={listening ? 'Arrêter la dictée' : 'Dicter au micro'}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: listening ? 'linear-gradient(135deg, #E05252, #C83A3A)' : 'rgba(255,255,255,0.06)',
                border: listening ? 'none' : '1px solid #3A2010',
                color: listening ? '#fff' : '#C8803A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              {listening ? '■' : '🎤'}
            </button>
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: input.trim() && !loading ? 'linear-gradient(135deg, #D9924E, #C8803A)' : 'rgba(255,255,255,0.06)',
                border: 'none',
                color: input.trim() && !loading ? '#fff' : '#5A4030',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
