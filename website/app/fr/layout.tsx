import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'INEE — Cabinet Comptable & Fiduciaire | Luxembourg, Mamer',
  description: 'Cabinet comptable et fiduciaire à Mamer, Luxembourg. Comptabilité, déclaration TVA, fiscalité, création de société, gestion RH et salaires, conseil stratégique. INEE accompagne les entrepreneurs et PME au Luxembourg et dans la Grande Région.',
  keywords: 'comptable Luxembourg, fiduciaire Luxembourg, cabinet comptable Mamer, déclaration TVA Luxembourg, création société Luxembourg, expert comptable Luxembourg, gestion salaires Luxembourg, SARL Luxembourg, comptabilité PME Luxembourg, conseil fiscal Luxembourg, tenue comptable Luxembourg, bilan comptable Luxembourg, compte de résultat Luxembourg, dépôt comptes annuels Luxembourg, déclaration fiscale Luxembourg, optimisation fiscale Luxembourg, impôt société Luxembourg, impôt personne physique Luxembourg, TVA mensuelle Luxembourg, TVA trimestrielle Luxembourg, TVA annuelle Luxembourg, administration fiscale Luxembourg, CCSS Luxembourg, fiche de salaire Luxembourg, gestion RH Luxembourg, contrat de travail Luxembourg, onboarding Luxembourg, offboarding Luxembourg, secrétariat entreprise Luxembourg, facturation client Luxembourg, recouvrement de dettes Luxembourg, création SARL Luxembourg, création SA Luxembourg, création SAS Luxembourg, business plan Luxembourg, accompagnement création entreprise Luxembourg, stratégie entreprise Luxembourg, analyse financière Luxembourg, processus comptables Luxembourg, formation TVA Luxembourg, formation comptabilité Luxembourg, formation en ligne Luxembourg, e-learning comptable Luxembourg, site internet entreprise Luxembourg, marketing digital Luxembourg, réseaux sociaux entreprise Luxembourg, création contenu Luxembourg, newsletter entreprise Luxembourg, organisation événement Luxembourg, fiduciaire Mamer, expert-comptable Grande Région, comptable frontalier Luxembourg France Belgique Allemagne, indépendant Luxembourg, auto-entrepreneur Luxembourg, PME Luxembourg, startup Luxembourg, holding Luxembourg, société de domiciliation Luxembourg, fiscalité transfrontalière Luxembourg, déclaration revenus Luxembourg, remboursement TVA Luxembourg',
  openGraph: {
    title: 'INEE — Cabinet Comptable & Fiduciaire Luxembourg',
    description: 'Votre partenaire comptable et fiscal au Luxembourg. Comptabilité, TVA, RH, création d\'entreprise, conseil stratégique et communication digitale à Mamer.',
    url: 'https://inee.lu/fr',
    siteName: 'INEE',
    locale: 'fr_LU',
    type: 'website',
  },
  alternates: {
    canonical: 'https://inee.lu/fr',
    languages: { 'en': 'https://inee.lu/en', 'fr': 'https://inee.lu/fr' },
  },
}

export default function FrLayout({ children }: { children: React.ReactNode }) {
  return <div lang="fr">{children}</div>
}
