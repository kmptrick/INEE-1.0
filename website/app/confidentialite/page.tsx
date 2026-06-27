'use client'

export default function Confidentialite() {
  return (
    <main style={{ background: 'var(--bg-cream)', minHeight: '100vh', paddingTop: '120px', paddingBottom: '112px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>

        {/* Header */}
        <p className="section-label">Informations légales</p>
        <h1 className="section-title" style={{ marginBottom: '8px' }}>
          Politique de <em>confidentialité</em>
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-light)', marginBottom: '48px' }}>
          Dernière mise à jour : 30 mai 2026
        </p>

        <span className="copper-line" />

        {[
          {
            title: '1. Responsable du traitement',
            content: `INEE S.à r.l.-S.\n37, Rue du Baumbusch — 8213 Mamer\nGrand-Duché de Luxembourg\nN° TVA : LU36332830\nEmail : contact@inee.lu`,
          },
          {
            title: '2. Données collectées',
            content: `Dans le cadre de l'utilisation de notre site et de notre formulaire de contact, nous collectons les données suivantes :\n\n• Nom et prénom\n• Adresse e-mail professionnelle\n• Numéro de téléphone (optionnel)\n• Société / Organisation (optionnel)\n• Objet de la demande et message libre\n\nCes données sont collectées uniquement avec votre consentement explicite.`,
          },
          {
            title: '3. Finalités du traitement',
            content: `Les données collectées sont utilisées exclusivement pour :\n\n• Répondre à vos demandes de contact ou de rendez-vous\n• Vous informer des services proposés par INEE\n• Vous envoyer des communications si vous y avez consenti\n\nNous ne vendons, ne louons et ne transmettons jamais vos données personnelles à des tiers à des fins commerciales.`,
          },
          {
            title: '4. Base légale',
            content: `Le traitement de vos données repose sur :\n\n• Votre consentement (Art. 6.1.a du RGPD) pour les communications marketing\n• L'exécution d'un contrat ou de mesures précontractuelles (Art. 6.1.b du RGPD) pour les demandes de services\n• Notre intérêt légitime (Art. 6.1.f du RGPD) pour la gestion de la relation client`,
          },
          {
            title: '5. Durée de conservation',
            content: `Vos données sont conservées :\n\n• 3 ans à compter du dernier contact pour les prospects\n• 10 ans pour les données liées à une relation contractuelle (obligation légale comptable)`,
          },
          {
            title: '6. Vos droits',
            content: `Conformément au RGPD, vous disposez des droits suivants :\n\n• Droit d'accès à vos données personnelles\n• Droit de rectification\n• Droit à l'effacement ("droit à l'oubli")\n• Droit à la limitation du traitement\n• Droit à la portabilité\n• Droit d'opposition\n\nPour exercer ces droits, contactez-nous à : contact@inee.lu\n\nVous pouvez également introduire une réclamation auprès de la Commission Nationale pour la Protection des Données (CNPD) au Luxembourg : www.cnpd.lu`,
          },
          {
            title: '7. Sécurité des données',
            content: `INEE met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction. Notre site utilise le protocole HTTPS (chiffrement SSL/TLS).`,
          },
          {
            title: '8. Cookies',
            content: `Ce site n'utilise pas de cookies de traçage ou publicitaires. Seuls des cookies techniques strictement nécessaires au bon fonctionnement du site peuvent être utilisés.`,
          },
          {
            title: '9. Contact',
            content: `Pour toute question relative à la protection de vos données personnelles :\n\nINEE S.à r.l.-S.\n37, Rue du Baumbusch — 8213 Mamer, Luxembourg\nEmail : contact@inee.lu`,
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
            ← Retour au site
          </a>
        </div>
      </div>
    </main>
  )
}
