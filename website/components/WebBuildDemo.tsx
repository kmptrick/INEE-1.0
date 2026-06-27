'use client'

import { useEffect, useRef, useState } from 'react'

const STEPS = 4

/**
 * Mini animated mockup of a website assembling itself —
 * a concrete, visual proof of our "création de site internet" know-how,
 * shown alongside the Communication & Marketing service category.
 */
export default function WebBuildDemo({ caption }: { caption: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setStep(STEPS) }),
      { threshold: 0.4 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="browser-mock" style={{ maxWidth: 420 }}>
      <div className="browser-mock__bar">
        <span className="browser-mock__dot" />
        <span className="browser-mock__dot" />
        <span className="browser-mock__dot" />
        <span
          className="mock-fade"
          style={{
            marginLeft: 12,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 10,
            letterSpacing: 1,
            color: 'var(--text-light)',
            animationDelay: '0.1s',
          }}
        >
          votre-entreprise.lu
        </span>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Nav bar */}
        {step >= 1 && (
          <div className="mock-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ width: 64, height: 8, background: 'var(--copper)', borderRadius: 1, display: 'inline-block' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ width: 28, height: 6, background: 'var(--border)', borderRadius: 1, display: 'inline-block' }} />
              <span style={{ width: 28, height: 6, background: 'var(--border)', borderRadius: 1, display: 'inline-block' }} />
              <span style={{ width: 28, height: 6, background: 'var(--border)', borderRadius: 1, display: 'inline-block' }} />
            </div>
          </div>
        )}

        {/* Hero block growing in */}
        {step >= 2 && (
          <>
            <span className="mock-block" style={{ height: 14, background: 'var(--text-dark)', opacity: 0.85, borderRadius: 1, width: '70%', display: 'inline-block', animationDelay: '0.05s' }} />
            <span className="mock-block" style={{ height: 8, background: 'var(--border)', borderRadius: 1, width: '90%', display: 'inline-block', animationDelay: '0.18s' }} />
            <span className="mock-block" style={{ height: 8, background: 'var(--border)', borderRadius: 1, width: '60%', display: 'inline-block', animationDelay: '0.3s' }} />
          </>
        )}

        {/* CTA + cards */}
        {step >= 3 && (
          <div className="mock-fade" style={{ display: 'flex', gap: 8, marginTop: 4 }} >
            <span style={{ padding: '7px 16px', background: 'var(--copper)', borderRadius: 2, fontSize: 9, color: '#fff', fontFamily: "'Montserrat', sans-serif", letterSpacing: 1.5 }}>
              DÉCOUVRIR
            </span>
            <span style={{ padding: '7px 16px', border: '1px solid var(--border)', borderRadius: 2, fontSize: 9, color: 'var(--text-light)', fontFamily: "'Montserrat', sans-serif", letterSpacing: 1.5 }}>
              CONTACT
            </span>
          </div>
        )}

        {step >= 4 && (
          <div className="mock-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: 48,
                  background: 'var(--bg-cream)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 2,
                  animation: 'mock-fade-in 0.5s cubic-bezier(0.4,0,0.2,1) both',
                  animationDelay: `${0.1 * i}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <p
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 10,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'var(--text-light)',
          textAlign: 'center',
          padding: '0 16px 18px',
          margin: 0,
        }}
      >
        {caption}
      </p>
    </div>
  )
}
