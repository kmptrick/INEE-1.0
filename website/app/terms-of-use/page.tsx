'use client'

export default function TermsOfUse() {
  return (
    <main style={{ background: 'var(--bg-cream)', minHeight: '100vh', paddingTop: '120px', paddingBottom: '112px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>

        {/* Header */}
        <p className="section-label">Legal information</p>
        <h1 className="section-title" style={{ marginBottom: '8px' }}>
          Terms <em>of Use</em>
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-light)', marginBottom: '48px' }}>
          Last updated: 30 May 2026
        </p>

        <span className="copper-line" />

        {[
          {
            title: '1. Purpose',
            content: `These Terms of Use govern access to and use of the inee.lu website published by INEE S.à r.l.-S., a company incorporated under Luxembourg law.`,
          },
          {
            title: '2. Access',
            content: `The site is freely accessible to all users. INEE reserves the right to restrict, suspend, or interrupt access to the site at any time and without notice, in particular for maintenance, update, or security reasons.`,
          },
          {
            title: '3. Intellectual property',
            content: `All content on this site — including but not limited to texts, images, graphics, and the INEE logo — is the exclusive property of INEE S.à r.l.-S. or its partners. Any reproduction, representation, modification, distribution, or exploitation of this content, in whole or in part, by any means whatsoever, without the prior written consent of INEE, is strictly prohibited.`,
          },
          {
            title: '4. Limitation of liability',
            content: `INEE endeavours to ensure that the information published on this site is accurate and up to date, but cannot guarantee the completeness, accuracy, or currentness of the content. INEE accepts no liability for any indirect, special, or consequential damages arising from or in connection with use of or inability to use this site.`,
          },
          {
            title: '5. Applicable law',
            content: `These Terms of Use are governed by and construed in accordance with the laws of the Grand Duchy of Luxembourg. Any dispute arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the courts of Luxembourg-Ville, unless mandatory legal provisions provide otherwise.`,
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '24px', fontWeight: 500,
              color: 'var(--text-dark)', marginBottom: '16px',
            }}>
              {section.title}
            </h2>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px', color: 'var(--text-medium)',
              lineHeight: 1.85, whiteSpace: 'pre-line',
            }}>
              {section.content}
            </div>
          </div>
        ))}

        {/* Back */}
        <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid var(--border-light)' }}>
          <a href="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
            ← Back to site
          </a>
        </div>
      </div>
    </main>
  )
}
