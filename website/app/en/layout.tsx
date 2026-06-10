import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'INEE — Accounting & Business Services | Luxembourg',
  description: 'Accounting firm and fiduciary in Mamer, Luxembourg. Accounting, VAT returns, tax advisory, company formation, payroll, HR management and strategic consulting. INEE supports entrepreneurs and SMEs in Luxembourg and the Greater Region.',
  keywords: 'accountant Luxembourg, accounting firm Luxembourg, fiduciary Luxembourg, VAT Luxembourg, company formation Luxembourg, payroll Luxembourg, tax consultant Luxembourg, business services Luxembourg, Mamer Luxembourg, SME accounting Luxembourg',
  openGraph: {
    title: 'INEE — Accounting & Business Services Luxembourg',
    description: 'Your accounting and tax partner in Luxembourg. Accounting, VAT, HR, company formation, strategic consulting and digital marketing in Mamer.',
    url: 'https://inee.lu/en',
    siteName: 'INEE',
    locale: 'en_LU',
    type: 'website',
  },
  alternates: {
    canonical: 'https://inee.lu/en',
    languages: { 'en': 'https://inee.lu/en', 'fr': 'https://inee.lu/fr' },
  },
}

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <div lang="en">{children}</div>
}
