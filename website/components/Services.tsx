'use client'

import { useEffect, useRef } from 'react'

const services = [
  {
    num: '01',
    title: 'Comptabilité & Finances',
    description: 'Tenue comptable mensuelle, comptabilité générale, analyse financière ponctuelle, revue et dépôt des comptes annuels. Un suivi rigoureux de votre santé financière.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="20" height="24" rx="2"/>
        <line x1="9" y1="9" x2="19" y2="9"/>
        <line x1="9" y1="14" x2="19" y2="14"/>
        <line x1="9" y1="19" x2="15" y2="19"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Fiscalité & Déclarations',
    description: 'Déclarations TVA mensuelles, trimestrielles et annuelles. Déclarations fiscales PM et PP. Optimisation fiscale et revue de vos obligations envers l\'Administration fiscale luxembourgeoise.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="4"/>
        <circle cx="18" cy="18" r="4"/>
        <line x1="7" y1="21" x2="21" y2="7"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'RH & Gestion du personnel',
    description: 'Gestion des salaires, onboarding et offboarding des employés, gestion RH complète en forfait mensuel. Conformité totale avec le droit du travail et la CCSS luxembourgeoise.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="8" r="3"/>
        <circle cx="18" cy="8" r="3"/>
        <path d="M4 22c0-4 2.7-7 6-7"/>
        <path d="M24 22c0-4-2.7-7-6-7"/>
        <path d="M10 15c1.3-.7 2.7-.7 4 0"/>
        <path d="M8 22c0-3 1.8-5.5 4-5.5s4 2.5 4 5.5"/>
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Administratif & Secrétariat',
    description: 'Secrétariat ponctuel ou en forfait mensuel, facturation client, accompagnement au recouvrement de dettes. Libérez-vous des tâches administratives pour vous concentrer sur votre cœur de métier.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="22" height="20" rx="2"/>
        <line x1="8" y1="10" x2="20" y2="10"/>
        <line x1="8" y1="15" x2="20" y2="15"/>
        <line x1="8" y1="20" x2="14" y2="20"/>
        <path d="M18 2v4M10 2v4"/>
      </svg>
    ),
  },
  {
    num: '05',
    title: 'Création & Structuration d\'entreprise',
    description: 'Constitution complète de société (SARL, SA, SAS…), rédaction de business plan, accompagnement à la création et mise en place de nouveaux process opérationnels.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="12" width="22" height="13" rx="1"/>
        <path d="M8 12V9a6 6 0 0 1 12 0v3"/>
        <circle cx="14" cy="18" r="2"/>
        <line x1="14" y1="20" x2="14" y2="23"/>
      </svg>
    ),
  },
  {
    num: '06',
    title: 'Conseil & Accompagnement stratégique',
    description: 'Consultations conseil, interprétation des résultats financiers, stratégie d\'entreprise et optimisation des processus comptables. Un regard expert pour vos décisions clés.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 20 9 14 14 17 20 8 24 12"/>
        <line x1="4" y1="24" x2="24" y2="24"/>
      </svg>
    ),
  },
  {
    num: '07',
    title: 'Formation',
    description: 'Formation TVA (demi-journée), formation comptabilité de base, sessions sur mesure (journée complète) et e-learning en ligne. Montez en compétence à votre rythme.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3L2 9l12 6 12-6-12-6z"/>
        <path d="M2 9v8c3 3 7 4.5 12 4.5S23 20 26 17V9"/>
        <line x1="26" y1="9" x2="26" y2="18"/>
      </svg>
    ),
  },
  {
    num: '08',
    title: 'Communication & Marketing',
    description: 'Gestion des réseaux sociaux, création de contenu, newsletter mensuelle, organisation d\'événements, création de sites internet et production vidéo/photo. Votre image, notre expertise.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="14" r="11"/>
        <path d="M14 3c0 0-5 4-5 11s5 11 5 11"/>
        <path d="M14 3c0 0 5 4 5 11s-5 11-5 11"/>
        <line x1="3" y1="14" x2="25" y2="14"/>
        <line x1="4" y1="9" x2="24" y2="9"/>
        <line x1="4" y1="19" x2="24" y2="19"/>
      </svg>
    ),
  },
]

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="services" ref={sectionRef} style={{ background: 'var(--bg-white)', padding: '112px 0' }}>
      <div className="container">
        {/* Header */}
        <div className="reveal" style={{ maxWidth: '640px', marginBottom: '72px' }}>
          <p className="section-label">Nos domaines d&apos;expertise</p>
          <h2 className="section-title">Des solutions <em>complètes</em><br />pour votre entreprise</h2>
          <p style={{ fontSize: '16px', color: 'var(--text-medium)', lineHeight: 1.8, marginTop: '8px' }}>
            De la comptabilité à la communication digitale, INEE vous accompagne sur l&apos;ensemble de vos besoins administratifs, fiscaux et stratégiques au Luxembourg.
          </p>
        </div>

        {/* Grid 4×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0' }} className="services-grid">
          {services.map((s, i) => (
            <div
              key={s.num}
              className="reveal"
              style={{
                padding: '40px 32px',
                border: '1px solid var(--border-light)',
                position: 'relative',
                transition: 'border-color 0.3s, background 0.3s',
                cursor: 'default',
                transitionDelay: `${i * 60}ms`,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = 'var(--copper)'
                el.style.background = 'var(--bg-cream)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = 'var(--border-light)'
                el.style.background = 'var(--bg-white)'
              }}
            >
              {/* Number */}
              <span style={{
                position: 'absolute', top: '20px', right: '24px',
                fontFamily: "'Montserrat', sans-serif", fontSize: '11px', fontWeight: 600,
                letterSpacing: '2px', color: 'var(--border)',
              }}>{s.num}</span>

              {/* Icon */}
              <div style={{ marginBottom: '24px' }}>{s.icon}</div>

              {/* Title */}
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500,
                color: 'var(--text-dark)', marginBottom: '14px', lineHeight: 1.2,
              }}>{s.title}</h3>

              {/* Description */}
              <p style={{ fontSize: '13px', color: 'var(--text-medium)', lineHeight: 1.75 }}>
                {s.description}
              </p>

              {/* CTA */}
              <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--copper)', letterSpacing: '0.3px', cursor: 'pointer' }}>
                En savoir plus →
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) { .services-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .services-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
