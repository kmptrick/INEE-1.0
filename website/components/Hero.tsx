'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import ImmersiveBackground from './ImmersiveBackground'
import type { SiteContent } from '@/lib/fr'

/* ---- Magnetic button: drifts toward the cursor on hover ---- */
function MagneticButton({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 250, damping: 18 })
  const sy = useSpring(y, { stiffness: 250, damping: 18 })

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      style={{ x: sx, y: sy }}
      data-cursor
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        x.set((e.clientX - (r.left + r.width / 2)) * 0.35)
        y.set((e.clientY - (r.top + r.height / 2)) * 0.45)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.a>
  )
}

export default function Hero({ content }: { content: SiteContent['hero'] }) {
  // Reveal is opt-IN: content is visible by default (CSS). We only add the
  // `hero-reveal` class once the tab is actually visible, so a backgrounded
  // tab (where animations are frozen) never shows an empty hero.
  const [reveal, setReveal] = useState(false)
  useEffect(() => {
    if (document.visibilityState === 'visible') {
      setReveal(true)
      return
    }
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        setReveal(true)
        document.removeEventListener('visibilitychange', onVis)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Avoid the legacy content duplication (last title line == accent)
  const leadLines = content.title.filter((l) => l !== content.titleAccent)
  const allLines = [...leadLines, content.titleAccent]

  let i = 0
  const delay = () => `${0.25 + i++ * 0.12}s`

  return (
    <section
      className={reveal ? 'hero hero-reveal' : 'hero'}
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        background:
          'radial-gradient(130% 130% at 72% 18%, #2A1608 0%, #1A0E05 42%, #0E0703 100%)',
        paddingTop: 72,
      }}
    >
      <ImmersiveBackground />

      {/* Central warm light */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '8%',
          right: '6%',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(221,160,90,0.34) 0%, rgba(200,128,58,0.10) 38%, rgba(200,128,58,0) 68%)',
          filter: 'blur(8px)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-14%',
          left: '-8%',
          width: 540,
          height: 540,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(154,94,30,0.30) 0%, rgba(154,94,30,0) 66%)',
          filter: 'blur(22px)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
        animate={{ x: [0, -26, 18, 0], y: [0, -34, -8, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Vignette for nav + base legibility */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(8,4,1,0.5) 0%, rgba(8,4,1,0) 20%, rgba(8,4,1,0) 76%, rgba(8,4,1,0.45) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Left scrim — lifts text contrast over the particle field */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(95deg, rgba(8,4,1,0.72) 0%, rgba(8,4,1,0.4) 32%, rgba(8,4,1,0) 62%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Bottom fade — smooth hand-off into the light Services section */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 200,
          background:
            'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 62%, #FFFFFF 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Eyebrow */}
        <div className="r-fade" style={{ animationDelay: delay(), marginBottom: 28 }}>
          <span className="section-label" style={{ color: 'var(--copper-light)' }}>
            {content.label}
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(48px, 8.4vw, 128px)',
            fontWeight: 300,
            lineHeight: 0.98,
            letterSpacing: '-0.02em',
            margin: 0,
            maxWidth: 1100,
          }}
        >
          {allLines.map((line, idx) => {
            const accent = line === content.titleAccent
            return (
              <span
                key={idx}
                className="r-line"
                style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}
              >
                <span
                  className="r-line-inner"
                  style={{
                    display: 'block',
                    animationDelay: delay(),
                    fontStyle: accent ? 'italic' : 'normal',
                    color: accent ? 'var(--copper-light)' : '#F6EEE3',
                  }}
                >
                  {line}
                </span>
              </span>
            )
          })}
        </h1>

        {/* Copper rule */}
        <div
          className="r-rule"
          style={{
            animationDelay: delay(),
            width: 90,
            height: 2,
            background:
              'linear-gradient(90deg, var(--copper) 0%, var(--copper-light) 100%)',
            margin: '36px 0 28px',
          }}
        />

        {/* Paragraph */}
        <p
          className="r-fade"
          style={{
            animationDelay: delay(),
            fontFamily: "'Inter', sans-serif",
            fontSize: 18,
            color: 'rgba(246,238,227,0.74)',
            maxWidth: 540,
            lineHeight: 1.85,
            margin: 0,
          }}
        >
          {content.subtitle}
        </p>

        {/* CTAs */}
        <div
          className="r-fade"
          style={{ animationDelay: delay(), display: 'flex', gap: 18, marginTop: 44, flexWrap: 'wrap' }}
        >
          <MagneticButton href="#contact" className="btn-primary btn-glow">
            {content.cta1}
          </MagneticButton>
          <MagneticButton href="#services" className="btn-ghost">
            {content.cta2}
          </MagneticButton>
        </div>

        {/* Credential chips */}
        <ul
          className="r-fade"
          style={{
            animationDelay: delay(),
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            listStyle: 'none',
            padding: 0,
            margin: '52px 0 0',
          }}
        >
          {content.credentials.map((item) => (
            <li
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '9px 16px',
                borderRadius: 999,
                border: '1px solid rgba(200,128,58,0.3)',
                background: 'rgba(200,128,58,0.07)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                color: 'rgba(246,238,227,0.88)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 5,
                  height: 5,
                  background: 'var(--copper-light)',
                  transform: 'rotate(45deg)',
                  flexShrink: 0,
                }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Scroll cue */}
      <div
        className="r-fade"
        style={{
          animationDelay: '1.4s',
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 9,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'var(--copper)',
          }}
        >
          Scroll
        </span>
        <div style={{ width: 1, height: 46, overflow: 'hidden', background: 'rgba(200,128,58,0.25)' }}>
          <motion.div
            style={{ width: '100%', height: 18, background: 'var(--copper)' }}
            animate={{ y: [-18, 46] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </section>
  )
}
