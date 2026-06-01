'use client'

import { useEffect, useRef } from 'react'
import type { SiteContent } from '@/lib/fr'

export default function Events({ content }: { content: SiteContent['events'] }) {
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
        <p className="section-label">{content.label}</p>
        <h2 className="section-title">
          {content.title}<em>{content.titleAccent}</em>
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
          {content.items.map((article, i) => (
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
                {article.details && article.details.length > 0 && (
                  <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {article.details.map((detail, j) => (
                      <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '13px' }}>{detail.icon}</span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--text-light)', lineHeight: 1.5 }}>{detail.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                <a
                  href={article.link}
                  target={article.link.startsWith('http') ? '_blank' : undefined}
                  rel={article.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  style={{
                    display: 'inline-block',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    color: 'var(--copper)',
                    marginTop: '20px',
                    textDecoration: 'none',
                    transition: 'text-decoration 0.2s',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none')
                  }
                >
                  {article.cta}
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
