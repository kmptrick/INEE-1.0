'use client'

import { useEffect, useState } from 'react'
import { LogoInline } from './Logo'
import type { SiteContent } from '@/lib/fr'

function DiamondIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{ transform: 'rotate(45deg)', flexShrink: 0 }}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="8" height="8" stroke="var(--copper)" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export default function Nav({ content }: { content: SiteContent['nav'] }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 900) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 72,
          background: 'rgba(250,246,241,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid var(--border-light)' : '1px solid transparent',
          transition: 'border-color 0.3s ease',
        }}
      >
        <div
          className="container"
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <a href="#" style={{ textDecoration: 'none' }}>
            <LogoInline size={28} textSize={20} />
          </a>

          {/* Center nav — desktop */}
          <nav
            className="nav-desktop"
            style={{
              display: 'flex',
              gap: 40,
              alignItems: 'center',
            }}
          >
            {content.links.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          {/* CTA + lang switch + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a
              href="#contact"
              className="btn-primary nav-cta"
              style={{ padding: '12px 24px', fontSize: 11 }}
            >
              {content.cta}
            </a>

            <a
              href={content.langSwitch.href}
              className="nav-lang"
              style={{
                fontFamily: "'Montserrat', sans-serif", fontSize: '11px', fontWeight: 600,
                letterSpacing: '2px', textTransform: 'uppercase' as const,
                color: 'var(--text-medium)', textDecoration: 'none',
                padding: '8px 12px', border: '1px solid var(--border)',
                borderRadius: '2px', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--copper)'; e.currentTarget.style.borderColor = 'var(--copper)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-medium)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              {content.langSwitch.label}
            </a>

            {/* Hamburger — mobile */}
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              style={{
                display: 'none',
                flexDirection: 'column',
                gap: 5,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: 22,
                    height: 1.5,
                    background: 'var(--copper)',
                    transition: 'transform 0.25s ease, opacity 0.25s ease',
                    transformOrigin: 'center',
                    transform:
                      menuOpen
                        ? i === 0
                          ? 'translateY(6.5px) rotate(45deg)'
                          : i === 2
                          ? 'translateY(-6.5px) rotate(-45deg)'
                          : 'scaleX(0)'
                        : 'none',
                    opacity: menuOpen && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99,
          background: 'rgba(250,246,241,0.98)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          pointerEvents: menuOpen ? 'auto' : 'none',
          opacity: menuOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {content.links.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 36,
              fontWeight: 400,
              color: 'var(--text-dark)',
              textDecoration: 'none',
              letterSpacing: 1,
              transition: 'color 0.2s ease',
              transitionDelay: menuOpen ? `${i * 0.05}s` : '0s',
              transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--copper)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-dark)'
            }}
          >
            {link.label}
          </a>
        ))}
        <a
          href="#contact"
          className="btn-primary"
          onClick={() => setMenuOpen(false)}
          style={{ marginTop: 8 }}
        >
          {content.cta}
        </a>
        <a
          href={content.langSwitch.href}
          onClick={() => setMenuOpen(false)}
          style={{
            fontFamily: "'Montserrat', sans-serif", fontSize: '11px', fontWeight: 600,
            letterSpacing: '2px', textTransform: 'uppercase' as const,
            color: 'var(--text-medium)', textDecoration: 'none',
            padding: '8px 12px', border: '1px solid var(--border)',
            borderRadius: '2px',
          }}
        >
          {content.langSwitch.label}
        </a>
      </div>

      <style>{`
        @media (max-width: 899px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-cta { display: none !important; }
          .nav-lang { display: none !important; }
        }
      `}</style>
    </>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--text-medium)',
        letterSpacing: '0.5px',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--copper)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-medium)'
      }}
    >
      {label}
    </a>
  )
}
