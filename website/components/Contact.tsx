'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import type { SiteContent } from '@/lib/fr'

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

const SUBJECT_VALUES = [
  'comptabilite', 'fiscalite', 'administratif', 'legal',
  'formation', 'communication', 'rh', 'conseil', 'autre',
]

export default function Contact({ content }: { content: SiteContent['contact'] }) {
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
      alert(content.form.consent)
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
          <p className="section-label" style={{ color: 'var(--copper)' }}>{content.label}</p>
          <h2 className="section-title" style={{ color: 'var(--bg-cream)' }}>
            {content.title} <em>{content.titleAccent}</em>
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(250,246,241,0.55)', maxWidth: '520px', lineHeight: 1.75 }}>
            {content.subtitle}
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
                  {content.form.successTitle}
                </h3>
                <p style={{ color: 'rgba(250,246,241,0.55)', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px', whiteSpace: 'pre-line' }}>
                  {content.form.successText}
                </p>
                <button onClick={resetForm} className="btn-secondary" style={{ border: '1px solid rgba(250,246,241,0.2)', color: 'rgba(250,246,241,0.6)', cursor: 'pointer', fontSize: '11px' }}>
                  {content.form.newRequest}
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color: 'var(--bg-cream)', marginBottom: '8px' }}>
                  {content.form.title}
                </h3>
                <span className="copper-line" style={{ marginTop: '16px', marginBottom: '32px' }} />

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: 0 }}>
                    <input type="text" placeholder={content.form.firstname} value={prenom} onChange={e => setPrenom(e.target.value)} onFocus={() => setFocused('prenom')} onBlur={() => setFocused(null)} required style={{ ...inputBase, ...fi('prenom') }} />
                    <input type="text" placeholder={content.form.lastname} value={nom} onChange={e => setNom(e.target.value)} onFocus={() => setFocused('nom')} onBlur={() => setFocused(null)} required style={{ ...inputBase, ...fi('nom') }} />
                  </div>
                  <input type="text" placeholder={content.form.company} value={societe} onChange={e => setSociete(e.target.value)} onFocus={() => setFocused('societe')} onBlur={() => setFocused(null)} style={{ ...inputBase, ...fi('societe') }} />
                  <input type="email" placeholder={content.form.email} value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} required style={{ ...inputBase, ...fi('email') }} />
                  <input type="tel" placeholder={content.form.phone} value={telephone} onChange={e => setTelephone(e.target.value)} onFocus={() => setFocused('tel')} onBlur={() => setFocused(null)} style={{ ...inputBase, ...fi('tel') }} />

                  <select value={objet} onChange={e => setObjet(e.target.value)} onFocus={() => setFocused('objet')} onBlur={() => setFocused(null)} style={{ ...inputBase, ...fi('objet'), cursor: 'pointer' }}>
                    <option value="" style={{ background: '#1A0E06' }}>{content.form.subject}</option>
                    {content.form.subjects.map((s, i) => (
                      <option key={i} value={SUBJECT_VALUES[i] ?? s.toLowerCase()} style={{ background: '#1A0E06' }}>{s}</option>
                    ))}
                  </select>

                  <textarea placeholder={content.form.message} value={message} onChange={e => setMessage(e.target.value)} onFocus={() => setFocused('message')} onBlur={() => setFocused(null)} required style={{ ...inputBase, ...fi('message'), height: '100px', resize: 'vertical' }} />

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
                      {content.form.consent}{' '}
                      <a href={content.form.privacyHref} style={{ color: 'var(--copper)', textDecoration: 'none' }}>{content.form.privacyLink}</a>
                      {' & '}
                      <a href={content.form.cguHref} style={{ color: 'var(--copper)', textDecoration: 'none' }}>{content.form.cguLink}</a>
                    </span>
                  </label>

                  {erreur && (
                    <p style={{ color: '#C0392B', fontSize: '13px', marginBottom: '12px', fontFamily: "'Inter', sans-serif" }}>
                      {content.form.error}
                    </p>
                  )}
                  <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: '11px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? content.form.sending : content.form.submit}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* RIGHT — Infos */}
          <div className="reveal">
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '20px', color: 'rgba(250,246,241,0.6)', lineHeight: 1.7, marginBottom: '40px' }}>
              &ldquo;{content.quote}&rdquo;
            </p>
            <span className="copper-line" />

            <button
              onClick={openNavigation}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <InfoBlock label={content.info.addressLabel} value={content.info.addressValue} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} />
            </button>
            <a href={`mailto:${content.info.emailValue}`} style={{ textDecoration: 'none' }}>
              <InfoBlock label={content.info.emailLabel} value={content.info.emailValue} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} />
            </a>
            <a href="https://wa.me/352661185049" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <InfoBlock label={content.info.phoneLabel} value={content.info.phoneValue} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>} />
            </a>

            <InfoBlock label={content.info.hoursLabel} value={content.info.hoursValue} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />

            <div style={{ height: '1px', background: 'rgba(250,246,241,0.08)', margin: '16px 0 32px' }} />
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(250,246,241,0.3)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {content.info.footer}
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
