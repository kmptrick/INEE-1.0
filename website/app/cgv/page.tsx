'use client'

export default function CGV() {
  return (
    <main style={{ background: 'var(--bg-cream)', minHeight: '100vh', paddingTop: '120px', paddingBottom: '112px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>

        <p className="section-label">Informations légales</p>
        <h1 className="section-title" style={{ marginBottom: '8px' }}>
          Conditions Générales <em>de Vente</em>
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-light)', marginBottom: '48px' }}>
          Dernière mise à jour : 30 mai 2026
        </p>

        <span className="copper-line" />

        {[
          {
            title: '1. Identification du prestataire',
            content: `INEE S.à r.l.-S.\n37, Rue du Baumbusch — 8213 Mamer, Grand-Duché de Luxembourg\nN° TVA : LU36332830\nEmail : contact@inee.lu\nTéléphone : +352 661 185 049`,
          },
          {
            title: '2. Champ d\'application',
            content: `Les présentes Conditions Générales de Vente (CGV) s'appliquent à toutes les prestations de services proposées par INEE S.à r.l.-S. à ses clients professionnels et particuliers, notamment :\n\n• Comptabilité et tenue de livres\n• Déclarations fiscales et TVA\n• Gestion administrative et secrétariat\n• Prestations juridiques et création d'entreprise\n• Formation\n• Communication et marketing digital\n• Gestion des ressources humaines et salaires\n• Conseil et accompagnement stratégique`,
          },
          {
            title: '3. Devis et commande',
            content: `Toute prestation fait l'objet d'un devis préalable établi par INEE S.à r.l.-S. et transmis au client par email ou en main propre.\n\nLe devis est valable 30 jours à compter de sa date d'émission. La commande est réputée ferme et définitive à réception du devis signé par le client, accompagné le cas échéant d'un acompte.\n\nToute modification de la commande après signature fera l'objet d'un avenant signé des deux parties.`,
          },
          {
            title: '4. Tarifs',
            content: `Les tarifs sont exprimés en euros (€) hors TVA luxembourgeoise applicable. La TVA au taux en vigueur sera ajoutée au montant hors taxes.\n\nINEE S.à r.l.-S. se réserve le droit de modifier ses tarifs à tout moment. Les prestations en cours seront facturées au tarif en vigueur lors de la commande.`,
          },
          {
            title: '5. Modalités de paiement',
            content: `Les factures sont payables à réception, sauf mention contraire indiquée sur le devis ou la facture.\n\nModes de paiement acceptés : virement bancaire, chèque.\n\nCoordonnées bancaires :\nBanque : Revolut\nIBAN : LT07 3250 0544 6550 1204\nBIC : REVOLT21\n\nEn cas de retard de paiement, des pénalités de retard seront appliquées au taux légal luxembourgeois en vigueur, sans qu'un rappel ne soit nécessaire.`,
          },
          {
            title: '6. Obligations du client',
            content: `Le client s'engage à fournir à INEE S.à r.l.-S. tous les documents, informations et accès nécessaires à la bonne exécution des prestations dans les délais convenus.\n\nToute transmission tardive ou incomplète de documents pouvant entraîner un retard dans l'exécution de la mission ne pourra être imputée à INEE S.à r.l.-S.`,
          },
          {
            title: '7. Obligations de INEE S.à r.l.-S.',
            content: `INEE S.à r.l.-S. s'engage à exécuter les prestations commandées avec diligence et professionnalisme, dans le respect des règles applicables au Grand-Duché de Luxembourg.\n\nINEE S.à r.l.-S. est soumise à une obligation de moyens et non de résultat, sauf disposition contraire expressément mentionnée dans le devis.`,
          },
          {
            title: '8. Confidentialité',
            content: `INEE S.à r.l.-S. s'engage à maintenir strictement confidentielles toutes les informations, données et documents communiqués par le client dans le cadre de l'exécution des prestations.\n\nCette obligation de confidentialité se poursuit sans limitation de durée après la fin de la relation commerciale.`,
          },
          {
            title: '9. Propriété des travaux',
            content: `Sauf mention contraire, les livrables produits par INEE S.à r.l.-S. dans le cadre d'une mission (rapports, analyses, supports de formation…) restent la propriété d'INEE S.à r.l.-S. jusqu'au paiement intégral de la facture correspondante.\n\nAprès paiement complet, le client dispose d'un droit d'usage exclusif des livrables pour ses propres besoins.`,
          },
          {
            title: '10. Résiliation',
            content: `Les contrats à durée indéterminée (forfaits mensuels) peuvent être résiliés par chacune des parties avec un préavis d'un mois, notifié par lettre recommandée ou email avec accusé de réception.\n\nEn cas de manquement grave de l'une des parties à ses obligations, l'autre partie pourra résilier le contrat de plein droit après mise en demeure restée sans effet pendant 15 jours.`,
          },
          {
            title: '11. Responsabilité',
            content: `La responsabilité de INEE S.à r.l.-S. est limitée au montant des honoraires perçus au titre de la mission concernée.\n\nINEE S.à r.l.-S. ne pourra être tenue responsable des préjudices indirects, notamment perte de chiffre d'affaires, perte de clientèle ou atteinte à l'image.`,
          },
          {
            title: '12. Droit applicable et litiges',
            content: `Les présentes CGV sont soumises au droit luxembourgeois.\n\nEn cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, le litige sera soumis à la compétence exclusive des tribunaux du Grand-Duché de Luxembourg.`,
          },
          {
            title: '13. Contact',
            content: `Pour toute question relative aux présentes CGV :\n\nINEE S.à r.l.-S.\n37, Rue du Baumbusch — 8213 Mamer, Luxembourg\nEmail : contact@inee.lu`,
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
