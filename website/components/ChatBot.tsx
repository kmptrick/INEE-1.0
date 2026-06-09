'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  interimResults: boolean
  continuous: boolean
  start(): void
  stop(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME_FR: Message = {
  role: 'assistant',
  content:
    "Bonjour ! Je suis l'assistant d'INEE 👋\nComment puis-je vous aider aujourd'hui ? Je peux vous renseigner sur nos services comptables, fiscaux, RH, ou toute autre question liée à votre entreprise au Luxembourg.",
}

const WELCOME_EN: Message = {
  role: 'assistant',
  content:
    "Hello! I'm INEE's assistant 👋\nHow can I help you today? I can answer questions about our accounting, tax, HR services, or anything related to your business in Luxembourg.",
}

function getWelcomeMessage(): Message {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/en')) {
    return WELCOME_EN
  }
  return WELCOME_FR
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(false)
  const [listening, setListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const listeningRef = useRef(false)

  const stopMic = useCallback(() => {
    listeningRef.current = false
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListening(false)
  }, [])

  const accumulatedRef = useRef('')

  const startMic = useCallback(() => {
    const SR = (window as unknown as Record<string, unknown>).SpeechRecognition ||
               (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    if (!SR) { alert('Votre navigateur ne supporte pas la reconnaissance vocale.'); return }

    accumulatedRef.current = ''

    const createRec = () => {
      const rec = new (SR as new () => SpeechRecognitionInstance)()
      rec.lang = 'fr-FR'
      rec.interimResults = true
      rec.continuous = false // false + restart manuel = plus stable sur Chrome

      rec.onresult = (e: SpeechRecognitionEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = e.results as any
        // Prendre le dernier résultat (interim ou final)
        const last = results[results.length - 1]
        const transcript = last[0].transcript as string
        // Ajouter au texte accumulé si final, sinon afficher en live
        if (last.isFinal) {
          accumulatedRef.current += transcript + ' '
          setInput(accumulatedRef.current.trim())
        } else {
          setInput((accumulatedRef.current + transcript).trim())
        }
      }

      rec.onend = () => {
        if (listeningRef.current) {
          // Relance automatique pour simuler le mode continu
          try {
            const next = createRec()
            recognitionRef.current = next
            next.start()
          } catch {
            listeningRef.current = false
            setListening(false)
          }
        }
      }

      rec.onerror = () => {
        if (listeningRef.current) {
          try {
            const next = createRec()
            recognitionRef.current = next
            next.start()
          } catch {
            listeningRef.current = false
            setListening(false)
          }
        }
      }

      return rec
    }

    const rec = createRec()
    recognitionRef.current = rec
    listeningRef.current = true
    setListening(true)
    rec.start()
  }, [])

  const toggleMic = useCallback(() => {
    if (listeningRef.current) stopMic()
    else startMic()
  }, [startMic, stopMic])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Mark unread when closed and new assistant message arrives
  useEffect(() => {
    if (!open && messages.length > 0) setUnread(true)
  }, [messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear unread on open; show welcome message if first open
  useEffect(() => {
    if (open) {
      setUnread(false)
      if (messages.length === 0) {
        setMessages([getWelcomeMessage()])
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollH = textareaRef.current.scrollHeight
      const lineH = 20
      const maxH = lineH * 3 + 20
      textareaRef.current.style.height = Math.min(scrollH, maxH) + 'px'
    }
  }, [input])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return
    stopMic()
    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok || !res.body) {
        setLoading(false)
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: "Je suis temporairement indisponible. Contactez-nous directement à contact@inee.lu ou au formulaire de contact ci-dessous.",
        }])
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      setLoading(false)
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantText }
          return updated
        })
      }

      // Détecter tag [RAPPEL: nom=X, tel=X, créneau=X] et envoyer email
      const rappelMatch = assistantText.match(/\[RAPPEL:\s*nom=([^,\]]+),?\s*tel=([^,\]]+),?\s*cr[eé]neau=([^\]]*)\]/i)
      if (rappelMatch) {
        const [, nom, telephone, creneau] = rappelMatch
        const conversation = newMessages
          .map((m) => `${m.role === 'user' ? 'Visiteur' : 'Assistant'} : ${m.content}`)
          .join('\n')
        fetch('/api/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nom: nom.trim(), telephone: telephone.trim(), creneau: creneau.trim(), conversation }),
        }).catch(() => {/* silencieux */})
      }

    } catch {
      setLoading(false)
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: "Je suis temporairement indisponible. Contactez-nous directement à contact@inee.lu ou utilisez le formulaire de contact.",
      }])
    }
  }, [input, loading, messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: 104,
              right: 28,
              width: 380,
              height: 540,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(26,14,6,0.2)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 200,
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'var(--copper)',
                height: 64,
                padding: '0 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              {/* Left: avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Avatar robot */}
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  border: '2px solid rgba(255,255,255,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="32" height="32" viewBox="0 0 44 44" fill="none">
                    <defs>
                      <linearGradient id="bodyRobotH" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="white" stopOpacity="0.75" />
                      </linearGradient>
                    </defs>
                    <line x1="22" y1="2" x2="22" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="22" cy="2" r="2" fill="rgba(255,220,150,1)" />
                    <rect x="11" y="9" width="22" height="16" rx="5" fill="url(#bodyRobotH)" />
                    <circle cx="17.5" cy="17" r="3" fill="rgba(200,128,58,0.9)" />
                    <circle cx="26.5" cy="17" r="3" fill="rgba(200,128,58,0.9)" />
                    <circle cx="18.5" cy="16" r="1" fill="white" opacity="0.8" />
                    <circle cx="27.5" cy="16" r="1" fill="white" opacity="0.8" />
                    <path d="M17 22 Q22 26 27 22" stroke="rgba(200,128,58,0.9)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <rect x="20" y="25" width="4" height="3" rx="1" fill="white" opacity="0.7" />
                    <rect x="10" y="28" width="24" height="14" rx="5" fill="url(#bodyRobotH)" />
                    <circle cx="22" cy="35" r="3" fill="rgba(200,128,58,0.9)" />
                    <circle cx="22" cy="35" r="1.5" fill="rgba(255,220,150,0.8)" />
                    <rect x="4" y="29" width="5" height="10" rx="2.5" fill="white" opacity="0.75" />
                    <rect x="35" y="29" width="5" height="10" rx="2.5" fill="white" opacity="0.75" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 3,
                      color: 'white',
                      lineHeight: 1.2,
                    }}
                  >
                    INEE
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.7)',
                      lineHeight: 1.2,
                    }}
                  >
                    Assistant
                  </div>
                </div>
              </div>

              {/* Right: online indicator + close */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#4ade80',
                      boxShadow: '0 0 0 2px rgba(74,222,128,0.3)',
                      animation: 'pulse-green 2s infinite',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    En ligne
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: 20,
                    lineHeight: 1,
                    padding: 0,
                    opacity: 1,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                  aria-label="Fermer le chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="chat-messages"
              data-lenis-prevent
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 16px',
                background: 'var(--bg-cream)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <style>{`
                .chat-messages::-webkit-scrollbar { width: 4px; }
                .chat-messages::-webkit-scrollbar-track { background: transparent; }
                .chat-messages::-webkit-scrollbar-thumb { background: var(--copper); border-radius: 2px; }
                @keyframes pulse-green { 0%,100% { box-shadow: 0 0 0 2px rgba(74,222,128,0.3); } 50% { box-shadow: 0 0 0 4px rgba(74,222,128,0.1); } }
                @keyframes dot-bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }
              `}</style>

              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 8,
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: 9,
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        color: 'var(--copper)',
                        marginBottom: 4,
                      }}
                    >
                      INEE
                    </div>
                  )}
                  <div
                    style={{
                      background: msg.role === 'user' ? 'var(--copper)' : 'var(--bg-white, #fff)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-dark)',
                      border: msg.role === 'assistant' ? '1px solid var(--border-light, #e8e0d5)' : 'none',
                      borderRadius:
                        msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      padding: '10px 14px',
                      maxWidth: msg.role === 'user' ? '75%' : '85%',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 14,
                      lineHeight: 1.65,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\[RAPPEL:[^\]]*\]/gi, '')
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>'),
                    }}
                  />
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 9,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      color: 'var(--copper)',
                      marginBottom: 4,
                    }}
                  >
                    INEE
                  </div>
                  <div
                    style={{
                      background: 'var(--bg-white, #fff)',
                      border: '1px solid var(--border-light, #e8e0d5)',
                      borderRadius: '12px 12px 12px 2px',
                      padding: '12px 16px',
                      display: 'flex',
                      gap: 6,
                      alignItems: 'center',
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          display: 'inline-block',
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: 'var(--copper)',
                          animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div
              style={{
                borderTop: '1px solid var(--border-light, #e8e0d5)',
                background: 'var(--bg-white, #fff)',
                padding: '12px 16px',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-end',
                flexShrink: 0,
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez votre message…"
                rows={1}
                style={{
                  flex: 1,
                  resize: 'none',
                  border: '1px solid var(--border, #d4c9b8)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  background: 'var(--bg-cream)',
                  color: 'var(--text-dark)',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                  overflowY: 'hidden',
                  lineHeight: 1.5,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--copper)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border, #d4c9b8)')}
              />
              {/* Mic button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMic}
                title={listening ? 'Arrêter la dictée' : 'Dicter un message'}
                style={{
                  width: 44,
                  height: 44,
                  minWidth: 44,
                  background: listening ? 'rgba(200,128,58,0.15)' : 'transparent',
                  border: `1px solid ${listening ? 'var(--copper)' : 'var(--border, #d4c9b8)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {listening && (
                  <span style={{
                    position: 'absolute',
                    inset: -4,
                    borderRadius: 10,
                    border: '2px solid rgba(200,128,58,0.4)',
                    animation: 'pulse-ring 1.2s ease-out infinite',
                    pointerEvents: 'none',
                  }} />
                )}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="2" width="6" height="11" rx="3"
                    fill={listening ? 'var(--copper)' : 'none'}
                    stroke={listening ? 'var(--copper)' : 'var(--text-medium, #5C4532)'}
                    strokeWidth="2" />
                  <path d="M5 10a7 7 0 0 0 14 0" stroke={listening ? 'var(--copper)' : 'var(--text-medium, #5C4532)'} strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="19" x2="12" y2="22" stroke={listening ? 'var(--copper)' : 'var(--text-medium, #5C4532)'} strokeWidth="2" strokeLinecap="round" />
                  <line x1="9" y1="22" x2="15" y2="22" stroke={listening ? 'var(--copper)' : 'var(--text-medium, #5C4532)'} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={!loading && input.trim() ? { scale: 1.05 } : {}}
                whileTap={!loading && input.trim() ? { scale: 0.95 } : {}}
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  width: 44,
                  height: 44,
                  minWidth: 44,
                  background: 'var(--copper)',
                  border: 'none',
                  borderRadius: 8,
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !input.trim() ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.15s, background 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!loading && input.trim()) {
                    ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--copper-dark, #a86928)'
                  }
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--copper)'
                }}
                aria-label="Envoyer"
              >
                {/* Send icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 200,
          width: 60,
          height: 60,
          borderRadius: 30,
          background: 'var(--copper)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: loading
            ? '0 8px 32px rgba(200,128,58,0.4), 0 0 0 6px rgba(200,128,58,0.15)'
            : '0 8px 32px rgba(200,128,58,0.4)',
          transition: 'box-shadow 0.3s',
        }}
        aria-label={open ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        {/* Pulsing ring when loading */}
        {loading && (
          <span
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: '2px solid rgba(200,128,58,0.4)',
              animation: 'pulse-ring 1.5s ease-out infinite',
            }}
          />
        )}
        <style>{`
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.4); opacity: 0; }
          }
          @media (max-width: 480px) {
            .chatbot-panel {
              width: calc(100vw - 32px) !important;
              right: 16px !important;
              bottom: 96px !important;
            }
          }
        `}</style>

        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </motion.svg>
          ) : (
            <motion.svg
              key="avatar"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.15 }}
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
            >
              <defs>
                <linearGradient id="bodyRobot" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="white" stopOpacity="0.75" />
                </linearGradient>
              </defs>

              {/* Antenne */}
              <line x1="22" y1="2" x2="22" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="22" cy="2" r="2" fill="rgba(255,220,150,1)" />

              {/* Tête */}
              <rect x="11" y="9" width="22" height="16" rx="5" fill="url(#bodyRobot)" />

              {/* Yeux */}
              <circle cx="17.5" cy="17" r="3" fill="var(--copper)" />
              <circle cx="26.5" cy="17" r="3" fill="var(--copper)" />
              {/* Reflets yeux */}
              <circle cx="18.5" cy="16" r="1" fill="white" opacity="0.8" />
              <circle cx="27.5" cy="16" r="1" fill="white" opacity="0.8" />

              {/* Sourire */}
              <path d="M17 22 Q22 26 27 22" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" fill="none" />

              {/* Cou */}
              <rect x="20" y="25" width="4" height="3" rx="1" fill="white" opacity="0.7" />

              {/* Corps */}
              <rect x="10" y="28" width="24" height="14" rx="5" fill="url(#bodyRobot)" />

              {/* Bouton chest cuivré */}
              <circle cx="22" cy="35" r="3" fill="rgba(200,128,58,0.9)" />
              <circle cx="22" cy="35" r="1.5" fill="rgba(255,220,150,0.8)" />

              {/* Bras gauche */}
              <rect x="4" y="29" width="5" height="10" rx="2.5" fill="white" opacity="0.75" />
              {/* Bras droit */}
              <rect x="35" y="29" width="5" height="10" rx="2.5" fill="white" opacity="0.75" />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {unread && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid white',
              }}
            />
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}
