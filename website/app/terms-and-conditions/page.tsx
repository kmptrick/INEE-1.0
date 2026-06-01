'use client'

export default function TermsAndConditions() {
  return (
    <main style={{ background: 'var(--bg-cream)', minHeight: '100vh', paddingTop: '120px', paddingBottom: '112px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>

        {/* Header */}
        <p className="section-label">Legal information</p>
        <h1 className="section-title" style={{ marginBottom: '8px' }}>
          Terms and <em>Conditions</em>
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-light)', marginBottom: '48px' }}>
          Last updated: 30 May 2026
        </p>

        <span className="copper-line" />

        {[
          {
            title: 'Article 1 — Service provider identification',
            content: `INEE S.à r.l.-S.\n37, Rue du Baumbusch — L-8213 Mamer\nGrand Duchy of Luxembourg\nVAT: LU36332830\nEmail: contact@inee.lu\nTel: +352 691 845 660`,
          },
          {
            title: 'Article 2 — Scope of application',
            content: `These General Terms and Conditions (T&Cs) apply to all services provided by INEE S.à r.l.-S. to its clients, including accounting, tax advisory, administrative support, legal services, training, communication & marketing, HR & payroll management, and strategic consulting.\n\nAny order or engagement of INEE's services implies unreserved acceptance of these T&Cs. They prevail over any conflicting document issued by the client, unless expressly agreed otherwise in writing by INEE.`,
          },
          {
            title: 'Article 3 — Quotes and orders',
            content: `Quotes issued by INEE are valid for 30 calendar days from the date of issue. Any engagement of INEE's services must be formalised by the client's written acceptance of the quote (email acceptance is valid).\n\nOnce accepted, the quote constitutes a firm and binding commitment by both parties under the conditions set out therein.`,
          },
          {
            title: 'Article 4 — Pricing',
            content: `All prices are quoted exclusive of VAT and may be revised annually in line with the Luxembourg National Consumer Price Index (IPCN). Clients will be notified of any price revision at least 30 days in advance.\n\nAdditional services not included in the original quote will be subject to a separate quotation.`,
          },
          {
            title: 'Article 5 — Payment terms',
            content: `Invoices are payable within 30 days of the invoice date. In the event of late payment, INEE reserves the right to charge late payment interest at a rate of 8% per annum, calculated from the due date, as well as a fixed recovery fee of €150.\n\nPersistent non-payment may result in suspension of services until the outstanding balance is settled.`,
          },
          {
            title: 'Article 6 — Cancellation',
            content: `Either party may terminate an ongoing service agreement by giving 30 calendar days' written notice.\n\nIn the event of early termination by the client without cause, a cancellation fee of 20% of the remaining contractual value shall apply, with a minimum of €250, to cover administration and redeployment costs.`,
          },
          {
            title: 'Article 7 — Service delivery',
            content: `INEE undertakes a best-efforts obligation in the delivery of its services. Any deadlines indicated are given as estimates only and do not constitute contractual commitments unless expressly agreed in writing.\n\nTimely delivery of services is conditional on the client providing all required information, documents, and access in a complete and timely manner. INEE accepts no liability for delays caused by the client's failure to cooperate.`,
          },
          {
            title: 'Article 8 — Liability',
            content: `INEE's total liability to the client, regardless of the cause or nature of the claim, shall be limited to the total fees paid by the client in the 12 months preceding the event giving rise to the claim.\n\nINEE shall not be liable for any indirect, special, incidental, or consequential damages, including but not limited to loss of profit, revenue, data, or business opportunity, even if advised of the possibility of such damages.`,
          },
          {
            title: 'Article 9 — Intellectual property',
            content: `INEE retains full ownership of all methodologies, tools, and working documents developed in the course of its services. Deliverables produced specifically for the client (reports, analyses, presentations, etc.) are transferred to the client upon full payment of the related invoice.\n\nThe client may not use INEE's name, logo, or materials for commercial or promotional purposes without prior written consent.`,
          },
          {
            title: 'Article 10 — Confidentiality',
            content: `Each party undertakes to keep strictly confidential all information, data, and documents of a confidential nature disclosed by the other party in connection with the performance of the services.\n\nThis obligation of confidentiality applies for a period of 5 years following the end of the contractual relationship, regardless of the reason for termination.`,
          },
          {
            title: 'Article 11 — Data protection',
            content: `In the performance of its services, INEE may process personal data on behalf of the client. In such cases, INEE acts as a data processor within the meaning of the GDPR and undertakes to process such data solely in accordance with the client's documented instructions.\n\nBoth parties undertake to comply with applicable data protection legislation, in particular Regulation (EU) 2016/679 (GDPR) and Luxembourg's Data Protection Act.`,
          },
          {
            title: 'Article 12 — AML / Sanctions',
            content: `INEE is subject to anti-money laundering and counter-terrorism financing obligations under Luxembourg law. In this context, INEE is required to carry out know-your-customer (KYC) procedures and may request identity documents, beneficial ownership information, and other relevant documentation.\n\nINEE reserves the right to refuse or terminate services if a client is subject to international sanctions, or if INEE reasonably suspects money laundering, terrorist financing, or any other illegal activity.`,
          },
          {
            title: 'Article 13 — Applicable law and jurisdiction',
            content: `These General Terms and Conditions are governed by and construed in accordance with the laws of the Grand Duchy of Luxembourg.\n\nAny dispute arising out of or in connection with these T&Cs, including any question regarding their existence, validity, or termination, shall be subject to the exclusive jurisdiction of the courts of Luxembourg-Ville, unless mandatory provisions of law require otherwise.`,
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
            ← Back to site
          </a>
        </div>
      </div>
    </main>
  )
}
