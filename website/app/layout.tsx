import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'INEE — Cabinet Comptable & Conseil | Luxembourg',
  description:
    'Cabinet comptable et de conseil aux entreprises basé à Mamer, Luxembourg. Expertise en comptabilité, fiscalité, audit et conseil aux PME depuis 2020.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
