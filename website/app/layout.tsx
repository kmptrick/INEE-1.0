import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'INEE — Services aux Entreprises | Luxembourg & Grande Région',
  description:
    'INEE accompagne les entrepreneurs et PME au Luxembourg et dans la Grande Région. Comptabilité, fiscalité, RH, administratif, conseil stratégique et communication digitale. Mamer, Luxembourg.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
