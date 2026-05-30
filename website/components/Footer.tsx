'use client'

function FooterLink({ href = '#', children }: { href?: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{ color: 'rgba(250,246,241,0.4)', textDecoration: 'none', display: 'block', marginBottom: '10px', fontSize: '13px', fontFamily: "'Inter', sans-serif", transition: 'color 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(250,246,241,0.9)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,246,241,0.4)')}
    >
      {children}
    </a>
  )
}

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 style={{
      fontFamily: "'Montserrat', sans-serif", fontSize: '10px', fontWeight: 600,
      letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--copper)',
      marginBottom: '24px', marginTop: 0,
    }}>
      {children}
    </h4>
  )
}

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-dark-mid)', padding: '80px 0 40px' }}>
      <div className="container">
        {/* Top grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1.2fr', gap: '56px', marginBottom: '64px' }} className="footer-grid">

          {/* Col 1 — Logo + about */}
          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="9" width="11.31" height="11.31" transform="rotate(-45 1 9)" stroke="var(--copper)" strokeWidth="1.2" />
              </svg>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: 'var(--copper)', letterSpacing: '6px' }}>INEE</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(250,246,241,0.45)', lineHeight: 1.75, marginBottom: '20px' }}>
              Cabinet de services aux entreprises basé à Mamer, Luxembourg. Comptabilité, fiscalité, conseil et communication digitale.
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=37+Rue+du+Baumbusch+8213+Mamer+Luxembourg"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <p style={{ fontSize: '12px', color: 'rgba(250,246,241,0.35)', marginBottom: '2px', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--copper)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,246,241,0.35)')}>
                37, Rue du Baumbusch — 8213 Mamer
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(250,246,241,0.25)', marginBottom: '4px' }}>Grand-Duché de Luxembourg ↗</p>
            </a>
            <p style={{ fontSize: '12px', color: 'rgba(250,246,241,0.2)' }}>TVA : LU36332830</p>
          </div>

          {/* Col 2 — Services */}
          <div>
            <ColTitle>Nos services</ColTitle>
            <FooterLink href="#services">Comptabilité</FooterLink>
            <FooterLink href="#services">Fiscalité & Déclarations</FooterLink>
            <FooterLink href="#services">Administratif</FooterLink>
            <FooterLink href="#services">Legal & Création d&apos;entreprise</FooterLink>
            <FooterLink href="#services">RH & Salaires</FooterLink>
            <FooterLink href="#services">Formation</FooterLink>
            <FooterLink href="#services">Communication & Marketing</FooterLink>
            <FooterLink href="#services">Conseil & Stratégie</FooterLink>
          </div>

          {/* Col 3 — Cabinet */}
          <div>
            <ColTitle>Cabinet</ColTitle>
            <FooterLink href="#equipe">Notre équipe</FooterLink>
            <FooterLink href="#expertise">Nos valeurs</FooterLink>
            <FooterLink href="#actualites">Actualités fiscales</FooterLink>
            <FooterLink href="#actualites">Événements</FooterLink>
            <FooterLink>Carrières</FooterLink>
            <FooterLink>Partenaires</FooterLink>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <ColTitle>Contact</ColTitle>
            <a href="mailto:contact@inee.lu" style={{ color: 'rgba(250,246,241,0.55)', textDecoration: 'none', display: 'block', marginBottom: '8px', fontSize: '13px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--copper)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,246,241,0.55)')}>
              contact@inee.lu
            </a>
            <p style={{ fontSize: '13px', color: 'rgba(250,246,241,0.4)', marginBottom: '28px', lineHeight: 1.6 }}>
              Lun–Ven · 8h30–18h00
            </p>
            <a href="#contact" className="btn-primary" style={{ fontSize: '10px', padding: '12px 20px', textDecoration: 'none', display: 'inline-flex' }}>
              Prendre rendez-vous
            </a>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: '1px', background: 'rgba(250,246,241,0.07)', marginBottom: '32px' }} />

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(250,246,241,0.25)', fontFamily: "'Inter', sans-serif" }}>
            © 2026 INEE S.à r.l.-S. Tous droits réservés.
          </span>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
            { label: 'Politique de confidentialité', href: '/confidentialite' },
            { label: 'Mentions légales', href: '/mentions-legales' },
            { label: 'CGV', href: '/cgv' },
          ].map(({ label, href }) => (
              <a key={label} href={href} style={{ fontSize: '12px', color: 'rgba(250,246,241,0.25)', textDecoration: 'none', fontFamily: "'Inter', sans-serif", transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--copper)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,246,241,0.25)')}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
