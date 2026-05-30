'use client'

import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Notre équipe', href: '#equipe' },
  { label: 'Expertise', href: '#expertise' },
  { label: 'Actualités', href: '#actualites' },
  { label: 'Contact', href: '#contact' },
]

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

export default function Nav() {
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
          <a
            href="#"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 28,
              fontWeight: 600,
              color: 'var(--copper)',
              letterSpacing: 6,
              textDecoration: 'none',
            }}
          >
            <DiamondIcon />
            INEE
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
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a
              href="#contact"
              className="btn-primary nav-cta"
              style={{ padding: '12px 24px', fontSize: 11 }}
            >
              Prendre rendez-vous
            </a>

            {/* Hamburger — mobile */}
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
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
        {NAV_LINKS.map((link, i) => (
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
          Prendre rendez-vous
        </a>
      </div>

      <style>{`
        @media (max-width: 899px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-cta { display: none !important; }
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
