import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'INEE — Accounting & Business Services | Luxembourg',
  description: 'Accounting firm and fiduciary in Mamer, Luxembourg. Accounting, VAT returns, tax advisory, company formation, payroll, HR management and strategic consulting. INEE supports entrepreneurs and SMEs in Luxembourg and the Greater Region.',
  keywords: 'accountant Luxembourg, accounting firm Luxembourg, fiduciary Luxembourg, VAT Luxembourg, company formation Luxembourg, payroll Luxembourg, tax consultant Luxembourg, business services Luxembourg, Mamer Luxembourg, SME accounting Luxembourg, bookkeeping Luxembourg, annual accounts Luxembourg, balance sheet Luxembourg, profit and loss Luxembourg, VAT return Luxembourg, monthly VAT Luxembourg, quarterly VAT Luxembourg, corporate tax Luxembourg, personal income tax Luxembourg, tax optimisation Luxembourg, Luxembourg tax authority, social security Luxembourg, CCSS Luxembourg, payslip Luxembourg, HR management Luxembourg, employment contract Luxembourg, onboarding Luxembourg, company secretary Luxembourg, client invoicing Luxembourg, debt recovery Luxembourg, SARL formation Luxembourg, SA formation Luxembourg, business plan Luxembourg, company registration Luxembourg, strategic consulting Luxembourg, financial analysis Luxembourg, accounting process Luxembourg, VAT training Luxembourg, accounting training Luxembourg, online training Luxembourg, e-learning Luxembourg, website creation Luxembourg, digital marketing Luxembourg, social media management Luxembourg, content creation Luxembourg, newsletter Luxembourg, event organisation Luxembourg, fiduciary Mamer, cross-border accountant Luxembourg France Belgium Germany, freelancer Luxembourg, self-employed Luxembourg, startup Luxembourg, holding company Luxembourg, domiciliation Luxembourg, cross-border tax Luxembourg, tax refund Luxembourg, VAT refund Luxembourg, international accounting Luxembourg, remote accounting Luxembourg, business consulting Luxembourg, entrepreneur Luxembourg',
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
