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
      <head>
        <script defer src="https://stats.inee.lu/script.js" data-website-id="eb3067fa-ef36-43f0-ae06-ce07d6169f29" />
      </head>
      <body>{children}</body>
    </html>
  )
}
