'use client'

import { useEffect, useRef, useState } from 'react'

const categories = [
  {
    num: '01',
    title: 'Comptabilité',
    services: [
      'Tenue comptable mensuelle',
      'Tenue comptable trimestrielle',
      'Tenue comptable annuelle',
      'Revue des comptes annuels',
    ],
    description: 'Externalisation complète ou partielle de votre comptabilité. Bilan, compte de résultat et reporting adapté à votre rythme.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="20" height="24" rx="2"/>
        <line x1="9" y1="9" x2="19" y2="9"/>
        <line x1="9" y1="14" x2="19" y2="14"/>
        <line x1="9" y1="19" x2="14" y2="19"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Fiscalité',
    services: [
      'Déclaration TVA mensuelle',
      'Déclaration TVA trimestrielle',
      'Déclaration TVA annuelle',
      'Déclaration fiscale société (PM)',
      'Déclaration fiscale personne physique (PP)',
      'Revue déclaration fiscale',
    ],
    description: 'Déclarations TVA et fiscales conformes au droit luxembourgeois. Gestion complète de vos obligations envers l\'Administration fiscale.',
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
    title: 'Administratif',
    services: [
      'Secrétariat',
      'Facturation client',
      'Accompagnement recouvrement de dettes',
      'Dépôt des comptes annuels',
    ],
    description: 'Gestion administrative complète pour particuliers et entreprises. Libérez-vous des tâches administratives et concentrez-vous sur votre activité.',
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
    num: '04',
    title: 'Legal',
    services: [
      'Prestations légales',
      'Constitution de société complète',
      'Business plan',
      'Accompagnement création (conseil)',
    ],
    description: 'Création de sociétés (SARL, SA, SAS…), rédaction de business plan et accompagnement juridique pour structurer et lancer votre activité au Luxembourg.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 4H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-4"/>
        <rect x="9" y="2" width="10" height="4" rx="1"/>
        <path d="M8 14l2.5 2.5L16 10"/>
      </svg>
    ),
  },
  {
    num: '05',
    title: 'Formation',
    services: [
      'Formation TVA',
      'Formation comptable',
      'Formation sur mesure',
      'Formation en ligne (e-learning)',
    ],
    description: 'Formations adaptées à votre niveau et vos besoins : TVA luxembourgeoise, comptabilité de base, sessions sur mesure en présentiel ou en ligne.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3L2 9l12 6 12-6-12-6z"/>
        <path d="M2 9v8c3 3 7 4.5 12 4.5S23 20 26 17V9"/>
        <line x1="26" y1="9" x2="26" y2="18"/>
      </svg>
    ),
  },
  {
    num: '06',
    title: 'Communication & Marketing',
    services: [
      'Création de site internet',
      'Process digital — CRM',
      'Création de contenu',
      'Marketing',
      'Organisation d\'événement',
    ],
    description: 'Présence digitale, réseaux sociaux, création de contenu vidéo et photo, CRM et organisation d\'événements. Votre image, notre expertise.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="14" r="11"/>
        <path d="M14 3c0 0-5 4-5 11s5 11 5 11"/>
        <path d="M14 3c0 0 5 4 5 11s-5 11-5 11"/>
        <line x1="3" y1="14" x2="25" y2="14"/>
        <line x1="4.5" y1="9" x2="23.5" y2="9"/>
        <line x1="4.5" y1="19" x2="23.5" y2="19"/>
      </svg>
    ),
  },
  {
    num: '07',
    title: 'RH',
    services: [
      'Gestion des salaires',
      'Gestion RH complète (contrats, onboarding, offboarding)',
    ],
    description: 'Calcul des fiches de salaire, déclarations CCSS, gestion des contrats et accompagnement RH complet pour vos collaborateurs luxembourgeois.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="8" r="3"/>
        <circle cx="18" cy="8" r="3"/>
        <path d="M4 22c0-3.5 2.7-6 6-6"/>
        <path d="M24 22c0-3.5-2.7-6-6-6"/>
        <path d="M10 16c1.3-.6 2.7-.6 4 0"/>
        <path d="M8 22c0-2.8 2-5 4.5-5h3c2.5 0 4.5 2.2 4.5 5"/>
      </svg>
    ),
  },
  {
    num: '08',
    title: 'Autres prestations',
    services: [
      'Mise en place de nouveaux process',
      'Stratégie d\'entreprise',
      'Optimisation fiscale PP & PM',
      'Optimisation processus comptables',
      'Analyse financière ponctuelle',
      'Consultation conseil',
      'Revue déclaration fiscale',
    ],
    description: 'Conseil stratégique, optimisation fiscale, analyse financière et mise en place de process sur mesure. Un accompagnement global pour votre croissance.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 20 9 13 14 17 20 8 24 12"/>
        <line x1="4" y1="24" x2="24" y2="24"/>
      </svg>
    ),
  },
]

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeTab, setActiveTab] = useState(0)

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
          <p style={{ fontSize: '16px', color: 'var(--text-medium)', lineHeight: 1.8 }}>
            De la comptabilité à la communication digitale, INEE vous accompagne sur l&apos;ensemble de vos besoins administratifs, fiscaux, juridiques et stratégiques au Luxembourg.
          </p>
        </div>

        {/* Tabs navigation */}
        <div className="reveal" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '48px', borderBottom: '1px solid var(--border-light)', paddingBottom: '0' }}>
          {categories.map((cat, i) => (
            <button
              key={cat.num}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '12px 20px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === i ? '2px solid var(--copper)' : '2px solid transparent',
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: activeTab === i ? 'var(--copper)' : 'var(--text-light)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '-1px',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Active tab content */}
        {categories.map((cat, i) => (
          <div
            key={cat.num}
            style={{
              display: activeTab === i ? 'grid' : 'none',
              gridTemplateColumns: '1fr 1fr',
              gap: '64px',
              alignItems: 'start',
            }}
            className="service-detail-grid"
          >
            {/* Left — description */}
            <div>
              <div style={{ marginBottom: '28px' }}>{cat.icon}</div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '36px', fontWeight: 400, color: 'var(--text-dark)',
                marginBottom: '20px', lineHeight: 1.1,
              }}>{cat.title}</h3>
              <p style={{ fontSize: '16px', color: 'var(--text-medium)', lineHeight: 1.8, marginBottom: '36px' }}>
                {cat.description}
              </p>
              <a href="#contact" className="btn-primary">Prendre rendez-vous</a>
            </div>

            {/* Right — services list */}
            <div style={{
              background: 'var(--bg-cream)',
              border: '1px solid var(--border-light)',
              padding: '40px',
              borderRadius: '2px',
            }}>
              <p style={{
                fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 600,
                letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-light)',
                marginBottom: '24px',
              }}>Nos prestations</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {cat.services.map((s, j) => (
                  <li key={j} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '14px 0',
                    borderBottom: j < cat.services.length - 1 ? '1px solid var(--border-light)' : 'none',
                    fontSize: '15px', color: 'var(--text-dark)', lineHeight: 1.5,
                  }}>
                    <span style={{
                      width: '6px', height: '6px', flexShrink: 0,
                      background: 'var(--copper)', transform: 'rotate(45deg)',
                      display: 'inline-block',
                    }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .service-detail-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  )
}
