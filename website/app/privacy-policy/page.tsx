'use client'

export default function PrivacyPolicy() {
  return (
    <main style={{ background: 'var(--bg-cream)', minHeight: '100vh', paddingTop: '120px', paddingBottom: '112px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>

        {/* Header */}
        <p className="section-label">Legal information</p>
        <h1 className="section-title" style={{ marginBottom: '8px' }}>
          Privacy <em>Policy</em>
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-light)', marginBottom: '48px' }}>
          Last updated: 30 May 2026
        </p>

        <span className="copper-line" />

        {[
          {
            title: '1. Data controller',
            content: `INEE S.à r.l.-S.\n37, Rue du Baumbusch — 8213 Mamer\nGrand Duchy of Luxembourg\nVAT: LU36332830\nEmail: contact@inee.lu`,
          },
          {
            title: '2. Data collected',
            content: `In connection with the use of our website and contact form, we collect the following data:\n\n• Name and first name\n• Professional email address\n• Phone number (optional)\n• Company / Organisation (optional)\n• Subject of request and free message\n\nThis data is collected only with your explicit consent.`,
          },
          {
            title: '3. Purposes of processing',
            content: `The data collected is used exclusively to:\n\n• Respond to your contact or meeting requests\n• Inform you about INEE services\n• Send you communications if you have consented\n\nWe never sell, rent, or transfer your personal data to third parties for commercial purposes.`,
          },
          {
            title: '4. Legal basis',
            content: `The processing of your data is based on:\n\n• Your consent (Art. 6.1.a GDPR) for marketing communications\n• Performance of a contract or pre-contractual measures (Art. 6.1.b GDPR) for service requests\n• Our legitimate interest (Art. 6.1.f GDPR) for customer relationship management`,
          },
          {
            title: '5. Retention',
            content: `Your data is retained for:\n\n• 3 years from the last contact for prospects\n• 10 years for data related to a contractual relationship (legal accounting obligation)`,
          },
          {
            title: '6. Your rights',
            content: `Under the GDPR, you have the following rights:\n\n• Right of access to your personal data\n• Right of rectification\n• Right to erasure ("right to be forgotten")\n• Right to restriction of processing\n• Right to data portability\n• Right to object\n\nTo exercise these rights, contact us at: contact@inee.lu\n\nYou may also file a complaint with the Commission Nationale pour la Protection des Données (CNPD) in Luxembourg: www.cnpd.lu`,
          },
          {
            title: '7. Security',
            content: `INEE implements appropriate technical and organisational measures to protect your data against unauthorised access, modification, disclosure, or destruction. Our site uses HTTPS (SSL/TLS encryption).`,
          },
          {
            title: '8. Cookies',
            content: `This site does not use tracking or advertising cookies. Only strictly necessary technical cookies required for the site to function may be used.`,
          },
          {
            title: '9. Contact',
            content: `For any questions regarding the protection of your personal data:\n\nINEE S.à r.l.-S.\n37, Rue du Baumbusch — 8213 Mamer, Luxembourg\nEmail: contact@inee.lu`,
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
