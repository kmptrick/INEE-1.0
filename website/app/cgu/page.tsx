'use client'

const articles = [
  {
    title: 'Article 1. Définitions',
    content: `Sauf contexte contraire :

"INEE" désigne INEE S.à r.l.-S., société de conseil et de services établie au Luxembourg, dont le siège social est situé au 37, Rue du Baumbusch, L-8213 Mamer, immatriculée au Registre de Commerce et des Sociétés du Luxembourg sous le numéro TVA LU36332830.

"Client" désigne toute personne physique ou morale, entité ou groupe d'entités ayant conclu un contrat de prestation de services avec INEE.

"Prestation" désigne tout service de conseil, d'assistance, de gestion de projet, de suivi commercial, de facturation ou toute autre prestation intellectuelle fournie par INEE dans le cadre de son activité.

"Contrat" désigne tout bon de commande, devis accepté, lettre de mission ou accord écrit conclu entre INEE et le Client.

"Données Personnelles" désigne toutes les données à caractère personnel au sens du Règlement (UE) 2016/679 du 27 avril 2016 (le "RGPD") communiquées à INEE dans le cadre de son engagement avec le Client.

"Législation sur la Protection des Données" désigne le RGPD ainsi que toute législation nationale ou européenne applicable au traitement des données personnelles et à la vie privée.

"nous", "notre" renvoient à INEE fournissant des services dans le cadre d'une mission donnée.

"vous", "votre" renvoient au Client bénéficiaire des services.`,
  },
  {
    title: 'Article 2. Champ d\'application et opposabilité',
    content: `Les présentes Conditions Générales d'Utilisation (CGU) s'appliquent à toutes les prestations fournies par INEE, sauf dérogation expresse convenue par écrit entre les parties. Elles prévalent sur toute condition générale d'achat ou tout autre document émanant du Client, à moins qu'INEE n'ait expressément et par écrit accepté d'y déroger.

Toute commande ou acceptation de devis implique l'adhésion pleine et entière du Client aux présentes CGU. INEE se réserve le droit de modifier les présentes conditions à tout moment ; les nouvelles conditions s'appliquent aux missions conclues postérieurement à leur entrée en vigueur.`,
  },
  {
    title: 'Article 3. Offres et commandes',
    content: `Les offres et devis émis par INEE sont valables 30 jours calendaires à compter de leur date d'émission, sauf mention contraire. Ils sont établis sur la base des informations communiquées par le Client, qui est seul responsable de leur exactitude et de leur exhaustivité.

INEE se réserve le droit d'adapter son offre et ses tarifs si des prestations complémentaires, non expressément visées dans la demande initiale, s'avéraient nécessaires à la bonne réalisation de la mission.

Toute commande acceptée par le Client constitue un engagement ferme et définitif.`,
  },
  {
    title: 'Article 4. Tarifs et révision des prix',
    content: `Les tarifs d'INEE sont exprimés hors TVA, sauf mention contraire. La TVA applicable est celle en vigueur au Luxembourg au moment de la facturation, conformément aux règles fiscales applicables (cf. régime TVA luxembourgeois pour les prestations de services).

Les tarifs horaires, forfaits et frais divers peuvent être révisés annuellement au 1er janvier, sur la base de l'indice officiel des prix à la consommation du Luxembourg (IPCN). INEE informera le Client de toute révision tarifaire avec un préavis de 30 jours.`,
  },
  {
    title: 'Article 5. Facturation et conditions de paiement',
    content: `I. Les factures d'INEE sont émises selon la périodicité convenue dans le Contrat (mensuelle par défaut). Elles sont payables dans un délai de 30 jours à compter de leur date d'émission, sauf stipulation contraire.

II. Toute facture impayée à son échéance portera, de plein droit et sans mise en demeure préalable, un intérêt de retard au taux de 8 % l'an, calculé à compter du jour suivant la date d'échéance.

III. En cas de non-paiement persistant après 3 relances, INEE se réserve le droit d'appliquer une indemnité forfaitaire de recouvrement de 150 EUR, sans préjudice des intérêts de retard et de son droit à suspendre ou résilier la mission.

IV. Les factures non contestées par écrit dans les 8 jours suivant leur réception sont réputées acceptées sans réserve.

V. Les honoraires d'INEE sont payables nets, sans retenue ni déduction d'aucune taxe ou charge. Si le Client est légalement tenu d'opérer une retenue à la source, INEE se réserve le droit de majorer sa facture à due concurrence afin de percevoir le montant net convenu.`,
  },
  {
    title: 'Article 6. Annulation et résiliation',
    content: `I. Le Client peut résilier une mission en cours par écrit avec un préavis de 30 jours calendaires. Toutes les prestations réalisées jusqu'à la date effective de résiliation seront facturées intégralement.

II. En cas d'annulation d'un devis accepté avant le démarrage de la mission, INEE se réserve le droit de facturer une indemnité d'annulation égale à 20 % du montant total du devis, avec un minimum de 250 EUR.

III. INEE peut mettre fin à une mission avec effet immédiat et sans indemnité à la charge d'INEE en cas de : non-paiement répété, conflit d'intérêts, demande contraire aux lois applicables, ou tout autre motif légitime notifié par écrit.

IV. En toutes circonstances, le Client s'acquittera de l'intégralité des frais engagés jusqu'à la date de résiliation.`,
  },
  {
    title: 'Article 7. Exécution des prestations',
    content: `I. INEE s'engage à exécuter ses missions avec le soin et la diligence attendus d'un prestataire professionnel. Sauf accord contraire, INEE n'est tenue qu'à une obligation de moyens.

II. Les délais d'exécution communiqués sont donnés à titre indicatif. Leur dépassement, sauf faute manifeste et exclusive d'INEE, ne pourra donner lieu à aucune pénalité, résiliation ou indemnité de la part du Client.

III. INEE exécute ses prestations sur la base de sa compréhension de la législation et des pratiques en vigueur au moment de la mission. Sauf accord exprès contraire, INEE n'est pas tenue de mettre à jour ses conseils si la législation évolue postérieurement à leur délivrance.

IV. INEE n'est pas responsable de conseils juridiques ou fiscaux dans le cadre de ses prestations. Le Client reste seul juge de l'adéquation des livrables à ses objectifs commerciaux.`,
  },
  {
    title: 'Article 8. Responsabilité',
    content: `I. La responsabilité d'INEE au titre de l'exécution de ses prestations est limitée au montant total effectivement facturé et payé par le Client au titre de la mission concernée.

II. INEE ne saurait être tenue responsable de dommages indirects, immatériels ou consécutifs (perte de chiffre d'affaires, perte de données, atteinte à la réputation, etc.) résultant de l'exécution ou de la non-exécution de ses missions.

III. INEE ne pourra être tenue pour responsable en cas de force majeure, entendue comme tout événement extérieur, imprévisible et irrésistible, notamment : catastrophes naturelles, conflits sociaux, pannes de réseaux, décisions gouvernementales ou toute autre circonstance indépendante de la volonté d'INEE.`,
  },
  {
    title: 'Article 9. Propriété intellectuelle',
    content: `I. INEE conserve l'ensemble des droits de propriété intellectuelle sur les méthodes, outils, modèles, frameworks et savoir-faire utilisés dans le cadre de ses prestations.

II. Les livrables spécifiquement créés pour le Client dans le cadre d'une mission (rapports, analyses, présentations) sont cédés au Client pour un usage interne exclusif, une fois la facture correspondante intégralement réglée.

III. Toute reproduction, diffusion ou utilisation des livrables à des fins commerciales ou à destination de tiers sans accord préalable écrit d'INEE est strictement interdite.`,
  },
  {
    title: 'Article 10. Confidentialité',
    content: `I. Chaque partie s'engage à traiter comme strictement confidentielle toute information de l'autre partie non accessible au public, obtenue dans le cadre de la mission, et à ne pas la divulguer à des tiers sans accord préalable écrit.

II. INEE peut être tenue de divulguer certaines informations à des autorités de régulation ou en application de la loi, sans que cela constitue une violation de la confidentialité.

III. L'obligation de confidentialité survit à la fin de la mission pour une durée de 5 ans.`,
  },
  {
    title: 'Article 11. Protection des données personnelles (RGPD)',
    content: `I. Dans le cadre de ses missions, INEE peut être amenée à traiter des Données Personnelles pour le compte du Client. INEE agit alors en qualité de sous-traitant au sens du RGPD.

II. Le Client garantit qu'il dispose des autorisations nécessaires pour communiquer les Données Personnelles à INEE et que leur traitement est conforme au RGPD.

III. INEE s'engage à : traiter les données uniquement aux fins de l'exécution de la mission ; garantir leur confidentialité ; mettre en place les mesures de sécurité appropriées ; notifier le Client dans un délai de 48 heures en cas de violation de données.

IV. Les données sont conservées pour la durée strictement nécessaire à l'exécution de la mission et aux obligations légales d'archivage, puis supprimées ou restituées au Client.

V. INEE ne procède à aucun transfert de Données Personnelles hors de l'Espace Économique Européen sans accord préalable écrit du Client.`,
  },
  {
    title: 'Article 12. Lutte contre le blanchiment et sanctions',
    content: `I. INEE est soumise aux obligations légales luxembourgeoises en matière de lutte contre le blanchiment de capitaux et le financement du terrorisme. À ce titre, INEE peut être amenée à solliciter des justificatifs d'identité et à effectuer des vérifications de diligence raisonnable (KYC) avant ou pendant la mission.

II. Si INEE estime qu'une mission peut impliquer une violation de sanctions internationales ou de réglementations applicables, elle se réserve le droit de mettre fin immédiatement à son engagement, sans indemnité.`,
  },
  {
    title: 'Article 13. Communications électroniques',
    content: `I. Les parties acceptent de communiquer par voie électronique dans le cadre de leur relation commerciale. INEE ne saurait être tenue responsable des risques inhérents à la transmission électronique (interception, perte, délai, virus).

II. Tout document transmis par voie électronique et accepté par le Client (devis, facture, bon de commande) a la même valeur contractuelle qu'un document papier signé.`,
  },
  {
    title: 'Article 14. Droit applicable et juridiction compétente',
    content: `Le présent contrat et toutes les relations entre INEE et le Client sont régis par le droit luxembourgeois.

Tout litige relatif à l'interprétation, l'exécution ou la résiliation du présent contrat sera soumis à la compétence exclusive des tribunaux du district de Luxembourg-Ville, sauf disposition légale impérative contraire.`,
  },
  {
    title: 'Article 15. Divisibilité et intégralité',
    content: `Si une clause des présentes CGU était déclarée nulle ou inapplicable par une juridiction compétente, les autres clauses resteraient en vigueur et produiraient leur plein effet. Les présentes CGU constituent l'intégralité de l'accord entre les parties sur leur objet et remplacent tout accord antérieur.`,
  },
]

export default function CGU() {
  return (
    <main style={{ background: 'var(--bg-cream)', minHeight: '100vh', paddingTop: '120px', paddingBottom: '112px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>

        <p className="section-label">Informations légales</p>
        <h1 className="section-title" style={{ marginBottom: '8px' }}>
          Conditions Générales <em>d&apos;Utilisation</em>
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>
          Dernière mise à jour : juin 2026
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-medium)', marginBottom: '48px' }}>
          INEE S.à r.l.-S. — 37, Rue du Baumbusch — L-8213 Mamer — Grand-Duché de Luxembourg — N° TVA : LU36332830
        </p>

        <span className="copper-line" />

        {articles.map((article, i) => (
          <div key={i} style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '24px', fontWeight: 500,
              color: 'var(--text-dark)', marginBottom: '16px',
            }}>
              {article.title}
            </h2>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px', color: 'var(--text-medium)',
              lineHeight: 1.85, whiteSpace: 'pre-line',
            }}>
              {article.content}
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
