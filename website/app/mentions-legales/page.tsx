'use client'

export default function MentionsLegales() {
  return (
    <main style={{ background: 'var(--bg-cream)', minHeight: '100vh', paddingTop: '120px', paddingBottom: '112px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>

        <p className="section-label">Informations légales</p>
        <h1 className="section-title" style={{ marginBottom: '8px' }}>
          Mentions <em>légales</em>
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-light)', marginBottom: '48px' }}>
          Dernière mise à jour : 30 mai 2026
        </p>

        <span className="copper-line" />

        {[
          {
            title: '1. Éditeur du site',
            content: `Raison sociale : INEE S.à r.l.\nForme juridique : Société à Responsabilité Limitée (S.à r.l.)\nSiège social : 37, Rue du Baumbusch — 8213 Mamer, Grand-Duché de Luxembourg\nN° TVA intracommunautaire : LU36332830\nEmail : contact@inee.lu\nTéléphone : +352 691 845 660`,
          },
          {
            title: '2. Directeur de la publication',
            content: `Patrick Dumont\nGérant — INEE S.à r.l.`,
          },
          {
            title: '3. Hébergement',
            content: `Le site inee.lu est hébergé par :\n\nHetzner Online GmbH\nIndustriestr. 25 — 91710 Gunzenhausen, Allemagne\nSite : www.hetzner.com`,
          },
          {
            title: '4. Propriété intellectuelle',
            content: `L'ensemble du contenu de ce site (textes, images, graphismes, logo, icônes, sons, logiciels…) est la propriété exclusive de INEE S.à r.l. ou de ses partenaires.\n\nToute reproduction, distribution, modification, adaptation, retransmission ou publication de ces différents éléments est strictement interdite sans l'accord exprès par écrit de INEE S.à r.l.\n\nLe logo et la marque INEE sont des marques déposées. Toute utilisation sans autorisation est passible de poursuites.`,
          },
          {
            title: '5. Liens hypertextes',
            content: `Le site inee.lu peut contenir des liens vers des sites tiers. INEE S.à r.l. n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leurs pratiques en matière de protection des données.`,
          },
          {
            title: '6. Limitation de responsabilité',
            content: `INEE S.à r.l. s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, INEE S.à r.l. ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.\n\nINEE S.à r.l. décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site, ainsi que pour tout dommage résultant d'une intrusion frauduleuse d'un tiers.`,
          },
          {
            title: '7. Droit applicable',
            content: `Le présent site et ses mentions légales sont soumis au droit luxembourgeois. Tout litige relatif à l'utilisation du site inee.lu sera soumis à la compétence exclusive des tribunaux luxembourgeois.`,
          },
          {
            title: '8. Contact',
            content: `Pour toute question relative aux présentes mentions légales :\n\nINEE S.à r.l.\n37, Rue du Baumbusch — 8213 Mamer, Luxembourg\nEmail : contact@inee.lu`,
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

        <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid var(--border-light)' }}>
          <a href="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
            ← Retour au site
          </a>
        </div>
      </div>
    </main>
  )
}
