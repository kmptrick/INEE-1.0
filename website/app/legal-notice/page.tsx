'use client'

export default function LegalNotice() {
  return (
    <main style={{ background: 'var(--bg-cream)', minHeight: '100vh', paddingTop: '120px', paddingBottom: '112px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>

        {/* Header */}
        <p className="section-label">Legal information</p>
        <h1 className="section-title" style={{ marginBottom: '8px' }}>
          Legal <em>Notice</em>
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-light)', marginBottom: '48px' }}>
          Last updated: 30 May 2026
        </p>

        <span className="copper-line" />

        {[
          {
            title: '1. Publisher',
            content: `INEE S.à r.l.-S.\n37, Rue du Baumbusch\nL-8213 Mamer\nGrand Duchy of Luxembourg\nVAT: LU36332830\nEmail: contact@inee.lu\nTel: +352 691 845 660`,
          },
          {
            title: '2. Publication director',
            content: `Patrick Dumont, Managing Director — INEE S.à r.l.-S.`,
          },
          {
            title: '3. Hosting',
            content: `Hetzner Online GmbH\nIndustriestr. 25\n91710 Gunzenhausen\nGermany\nwww.hetzner.com`,
          },
          {
            title: '4. Intellectual property',
            content: `All content published on this site — texts, images, graphics, logo, and other elements — is the exclusive property of INEE S.à r.l.-S. or its partners. Any unauthorised reproduction or use is strictly prohibited without the prior written consent of INEE S.à r.l.-S.`,
          },
          {
            title: '5. Hyperlinks',
            content: `The inee.lu website may contain links to third-party websites. INEE S.à r.l.-S. accepts no responsibility for the content, products, services, or data protection practices of those sites.`,
          },
          {
            title: '6. Limitation of liability',
            content: `INEE S.à r.l.-S. endeavours to ensure the accuracy and currency of information published on this site. However, INEE accepts no liability for any inaccuracies, omissions, or results obtained from the use of such information.`,
          },
          {
            title: '7. Applicable law',
            content: `This site and its legal notices are governed by the laws of the Grand Duchy of Luxembourg. Any dispute shall be brought before the competent courts of Luxembourg.`,
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
