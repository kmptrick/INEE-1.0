'use client'

import { useState, useEffect, useRef, FormEvent, useCallback } from 'react'

const MAPS_QUERY = '37+Rue+du+Baumbusch,+8213+Mamer,+Luxembourg'

function openNavigation() {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isAndroid = /Android/.test(ua)
  if (isAndroid) {
    window.open(`geo:0,0?q=${MAPS_QUERY}`, '_blank')
  } else if (isIOS) {
    window.open(`maps://?q=${MAPS_QUERY}`, '_blank')
  } else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`, '_blank')
  }
}

function InfoBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '32px' }}>
      <div style={{
        width: '44px', height: '44px', flexShrink: 0,
        border: '1px solid rgba(200,128,58,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--copper)',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(250,246,241,0.4)', marginBottom: '6px' }}>{label}</p>
        <p style={{ fontSize: '14px', color: 'rgba(250,246,241,0.85)', margin: 0, lineHeight: 1.6 }}>{value}</p>
      </div>
    </div>
  )
}

export default function Contact() {
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [societe, setSociete] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [objet, setObjet] = useState('')
  const [message, setMessage] = useState('')
  const [accepte, setAccepte] = useState(false)
  const [envoye, setEnvoye] = useState(false)
  const [erreur, setErreur] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  function resetForm() {
    setPrenom(''); setNom(''); setSociete(''); setEmail('')
    setTelephone(''); setObjet(''); setMessage('')
    setAccepte(false); setEnvoye(false); setErreur(false)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href="#contact"]')
      if (link) resetForm()
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!accepte) {
      alert('Veuillez accepter la politique de confidentialité.')
      return
    }
    setLoading(true)
    setErreur(false)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, nom, societe, email, telephone, objet, message }),
      })
      if (res.ok) {
        setEnvoye(true)
      } else {
        setErreur(true)
      }
    } catch {
      setErreur(true)
    } finally {
      setLoading(false)
    }
  }

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '14px 18px', marginBottom: '14px',
    background: 'rgba(250,246,241,0.05)', border: '1px solid rgba(250,246,241,0.1)',
    borderRadius: '2px', color: 'rgba(250,246,241,0.9)',
    fontFamily: "'Inter', sans-serif", fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  }

  function fi(field: string): React.CSSProperties {
    return focused === field ? { borderColor: 'var(--copper)' } : {}
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{ background: 'var(--bg-dark)', padding: '112px 0', position: 'relative' }}
    >
      <div className="container">
        {/* Header */}
        <div className="reveal" style={{ marginBottom: '72px' }}>
          <p className="section-label" style={{ color: 'var(--copper)' }}>Nous contacter</p>
          <h2 className="section-title" style={{ color: 'var(--bg-cream)' }}>
            Prenons <em>rendez-vous</em>
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(250,246,241,0.55)', maxWidth: '520px', lineHeight: 1.75 }}>
            Une question, un projet, une urgence comptable ? Notre équipe vous répond sous 24h.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }} className="contact-grid">

          {/* LEFT — Formulaire */}
          <div className="reveal" style={{
            background: 'rgba(250,246,241,0.04)', border: '1px solid rgba(250,246,241,0.08)',
            padding: '48px', borderRadius: '2px',
          }}>
            {envoye ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{
                  width: '64px', height: '64px', border: '1px solid var(--copper)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 28px', color: 'var(--copper)', fontSize: '28px',
                }}>✓</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, color: 'var(--bg-cream)', marginBottom: '12px' }}>
                  Demande envoyée
                </h3>
                <p style={{ color: 'rgba(250,246,241,0.55)', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
                  Nous vous recontacterons dans les 24h ouvrables.<br />Merci de votre confiance.
                </p>
                <button onClick={resetForm} className="btn-secondary" style={{ border: '1px solid rgba(250,246,241,0.2)', color: 'rgba(250,246,241,0.6)', cursor: 'pointer', fontSize: '11px' }}>
                  Nouvelle demande
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color: 'var(--bg-cream)', marginBottom: '8px' }}>
                  Demande de rendez-vous
                </h3>
                <span className="copper-line" style={{ marginTop: '16px', marginBottom: '32px' }} />

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: 0 }}>
                    <input type="text" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} onFocus={() => setFocused('prenom')} onBlur={() => setFocused(null)} required style={{ ...inputBase, ...fi('prenom') }} />
                    <input type="text" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} onFocus={() => setFocused('nom')} onBlur={() => setFocused(null)} required style={{ ...inputBase, ...fi('nom') }} />
                  </div>
                  <input type="text" placeholder="Société / Organisation" value={societe} onChange={e => setSociete(e.target.value)} onFocus={() => setFocused('societe')} onBlur={() => setFocused(null)} style={{ ...inputBase, ...fi('societe') }} />
                  <input type="email" placeholder="Email professionnel" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} required style={{ ...inputBase, ...fi('email') }} />
                  <input type="tel" placeholder="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} onFocus={() => setFocused('tel')} onBlur={() => setFocused(null)} style={{ ...inputBase, ...fi('tel') }} />

                  <select value={objet} onChange={e => setObjet(e.target.value)} onFocus={() => setFocused('objet')} onBlur={() => setFocused(null)} style={{ ...inputBase, ...fi('objet'), cursor: 'pointer' }}>
                    <option value="" style={{ background: '#1A0E06' }}>Objet de la demande…</option>
                    <option value="comptabilite" style={{ background: '#1A0E06' }}>Comptabilité</option>
                    <option value="fiscalite" style={{ background: '#1A0E06' }}>Fiscalité & Déclarations</option>
                    <option value="administratif" style={{ background: '#1A0E06' }}>Administratif & Secrétariat</option>
                    <option value="legal" style={{ background: '#1A0E06' }}>Legal & Création d&apos;entreprise</option>
                    <option value="formation" style={{ background: '#1A0E06' }}>Formation</option>
                    <option value="communication" style={{ background: '#1A0E06' }}>Communication & Marketing</option>
                    <option value="rh" style={{ background: '#1A0E06' }}>RH & Gestion des salaires</option>
                    <option value="conseil" style={{ background: '#1A0E06' }}>Conseil & Stratégie</option>
                    <option value="autre" style={{ background: '#1A0E06' }}>Autre</option>
                  </select>

                  <textarea placeholder="Votre message ou question" value={message} onChange={e => setMessage(e.target.value)} onFocus={() => setFocused('message')} onBlur={() => setFocused(null)} required style={{ ...inputBase, ...fi('message'), height: '100px', resize: 'vertical' }} />

                  {/* Checkbox */}
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '28px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={accepte}
                      onChange={e => setAccepte(e.target.checked)}
                      style={{
                        appearance: 'none', WebkitAppearance: 'none',
                        width: '18px', height: '18px', flexShrink: 0, marginTop: '2px',
                        border: `1.5px solid ${accepte ? 'var(--copper)' : 'rgba(250,246,241,0.25)'}`,
                        background: accepte ? `rgba(200,128,58,0.2) url("data:image/svg+xml,%3Csvg width='10' height='8' viewBox='0 0 10 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 4l3 3 5-6' stroke='%23C8803A' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/10px no-repeat` : 'transparent',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    />
                    <span style={{ fontSize: '13px', color: 'rgba(250,246,241,0.45)', lineHeight: 1.6 }}>
                      Je consens au traitement de mes données personnelles conformément à la{' '}
                      <a href="/confidentialite" style={{ color: 'var(--copper)', textDecoration: 'none' }}>politique de confidentialité</a>
                    </span>
                  </label>

                  {erreur && (
                    <p style={{ color: '#C0392B', fontSize: '13px', marginBottom: '12px', fontFamily: "'Inter', sans-serif" }}>
                      Une erreur s&apos;est produite. Veuillez réessayer ou nous contacter directement à contact@inee.lu
                    </p>
                  )}
                  <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: '11px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Envoi en cours…' : 'Envoyer ma demande'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* RIGHT — Infos */}
          <div className="reveal">
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '20px', color: 'rgba(250,246,241,0.6)', lineHeight: 1.7, marginBottom: '40px' }}>
              &ldquo;Disponibles du lundi au vendredi, de 8h30 à 18h00, pour répondre à toutes vos questions.&rdquo;
            </p>
            <span className="copper-line" />

            <button
              onClick={openNavigation}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <InfoBlock label="Adresse — Ouvrir la navigation" value={"37, Rue du Baumbusch\n8213 Mamer — Luxembourg"} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} />
            </button>
            <a href="mailto:contact@inee.lu" style={{ textDecoration: 'none' }}>
              <InfoBlock label="Email — Écrire un message" value="contact@inee.lu" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} />
            </a>
            <InfoBlock label="N° TVA" value="LU36332830" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>} />
            <InfoBlock label="Horaires" value="Lun–Ven, 8h30–18h00" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />

            <div style={{ height: '1px', background: 'rgba(250,246,241,0.08)', margin: '16px 0 32px' }} />
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(250,246,241,0.3)', lineHeight: 1.7 }}>
              Société de services aux entreprises<br />basée à Mamer, Grand-Duché de Luxembourg
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
        textarea { font-family: 'Inter', sans-serif !important; }
        select option { color: rgba(250,246,241,0.9); }
      `}</style>
    </section>
  )
}
