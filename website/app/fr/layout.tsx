import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'INEE — Cabinet Comptable & Fiduciaire | Luxembourg, Mamer',
  description: 'Cabinet comptable et fiduciaire à Mamer, Luxembourg. Comptabilité, déclaration TVA, fiscalité, création de société, gestion RH et salaires, conseil stratégique. INEE accompagne les entrepreneurs et PME au Luxembourg et dans la Grande Région.',
  keywords: 'comptable Luxembourg, fiduciaire Luxembourg, cabinet comptable Mamer, déclaration TVA Luxembourg, création société Luxembourg, expert comptable Luxembourg, gestion salaires Luxembourg, SARL Luxembourg, comptabilité PME Luxembourg, conseil fiscal Luxembourg',
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
