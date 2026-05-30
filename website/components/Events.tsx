'use client'

import { useEffect, useRef } from 'react'

interface Article {
  date: string
  category: string
  title: string
  summary: string
}

const articles: Article[] = [
  {
    date: '15 Juin 2026',
    category: 'FISCALITÉ',
    title: 'Nouvelles modalités TVA Luxembourg 2026 : ce qui change pour votre entreprise',
    summary:
      "L'Administration fiscale a publié ses nouvelles directives TVA pour 2026. Notre analyse détaille les impacts pour les PME et les mesures à prendre avant le 31 juillet.",
  },
  {
    date: '03 Juillet 2026',
    category: 'ÉVÉNEMENT',
    title: 'Atelier : Optimiser la structure juridique de votre société',
    summary:
      'INEE organise un atelier pratique sur les structures juridiques adaptées aux PME luxembourgeoises. Places limitées à 12 participants. Présentiel à Mamer.',
  },
  {
    date: '20 Septembre 2026',
    category: 'CONSEIL',
    title: 'Télétravail transfrontalier : nouvelles règles de fiscalité sociale en Grande Région',
    summary:
      'Les accords bilatéraux France-Luxembourg et Belgique-Luxembourg ont été actualisés. Comprendre les nouvelles limites de jours et leurs implications pour vos salariés frontaliers.',
  },
]

export default function Events() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="actualites"
      ref={sectionRef}
      style={{ background: 'var(--bg-cream)', padding: '120px 0' }}
    >
      <div className="container">
        <p className="section-label">Actualités &amp; Événements</p>
        <h2 className="section-title">
          Restez informé des <em>nouveautés fiscales</em>
        </h2>

        <div
          className="events-grid reveal"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '28px',
            marginTop: '56px',
          }}
        >
          {articles.map((article, i) => (
            <article
              key={i}
              className="card"
              style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}
            >
              {/* Header copper */}
              <div style={{ background: 'var(--copper)', padding: '28px 32px' }}>
                <p
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '10px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '12px',
                    marginTop: 0,
                  }}
                >
                  {article.date}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '4px 12px',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '9px',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: '#fff',
                  }}
                >
                  {article.category}
                </span>
              </div>

              {/* Body */}
              <div
                style={{
                  padding: '32px',
                  background: 'var(--bg-white)',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '24px',
                    fontWeight: 500,
                    color: 'var(--text-dark)',
                    marginTop: 0,
                    marginBottom: '12px',
                    lineHeight: 1.3,
                  }}
                >
                  {article.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: 'var(--text-medium)',
                    lineHeight: 1.7,
                    flex: 1,
                    marginTop: 0,
                    marginBottom: 0,
                  }}
                >
                  {article.summary}
                </p>
                <a
                  href="#"
                  style={{
                    display: 'inline-block',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    color: 'var(--copper)',
                    marginTop: '20px',
                    textDecoration: 'none',
                    transition: 'text-decoration 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none')
                  }
                >
                  Lire la suite →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .events-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
