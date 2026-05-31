'use client';
import {
  Document, Page, Text, View, StyleSheet, Font, Svg,
  Path, Line, Circle,
} from '@react-pdf/renderer';
import { INEE } from '@/lib/inee-brand';

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
});

// ── Couleurs ──────────────────────────────────────────────────────────────────
const BLUE      = '#1565C0';
const BLUE_LIGHT = '#EBF5FB';
const BLUE_MID  = '#D6EAF8';
const WHITE     = '#FFFFFF';
const DARK      = '#1A1A1A';
const GRAY      = '#555555';
const BORDER    = '#CCCCCC';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n ?? 0);

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page:        { fontFamily: 'Helvetica', fontSize: 8.5, color: DARK, backgroundColor: WHITE, padding: '20 30 30 30' },

  // Header
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  logoBox:     { width: 80, alignItems: 'center', border: '1 solid #DDDDDD', padding: 6, borderRadius: 4 },
  logoName:    { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, marginTop: 4, color: DARK },
  companyBlock:{ textAlign: 'right', lineHeight: 1.6 },
  companyName: { fontSize: 13, fontWeight: 'bold', marginBottom: 2, color: DARK },
  companyLine: { color: GRAY, fontSize: 8 },

  // Title
  titleBanner: { backgroundColor: BLUE, borderRadius: 2, padding: '8 16', marginBottom: 4, alignItems: 'center' },
  titleText:   { color: WHITE, fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  dateRow:     { flexDirection: 'row', gap: 20, marginBottom: 14, fontSize: 8.5, color: GRAY },

  // Client
  clientLabelRow: { backgroundColor: BLUE_MID, padding: '4 8', marginBottom: 4, borderRadius: 2 },
  clientLabelText:{ fontWeight: 'bold', color: BLUE, fontSize: 8.5 },
  clientInfo:  { fontSize: 8.5, lineHeight: 1.5, color: DARK, marginBottom: 14, paddingLeft: 2 },

  // Table
  table:       { marginBottom: 12 },
  tableHeader: { flexDirection: 'row', backgroundColor: BLUE, padding: '5 4' },
  tableRow:    { flexDirection: 'row', padding: '4 4', borderBottom: `0.5 solid ${BORDER}` },
  tableRowAlt: { backgroundColor: BLUE_LIGHT },
  thCell:      { color: WHITE, fontWeight: 'bold', fontSize: 7.5 },
  tdCell:      { fontSize: 7.5, color: DARK },

  // Column widths
  colNum:  { width: '4%' },
  colDesc: { width: '28%' },
  colPer:  { width: '10%' },
  colQty:  { width: '5%', textAlign: 'center' },
  colRem:  { width: '7%', textAlign: 'center' },
  colPU:   { width: '10%', textAlign: 'right' },
  colHT:   { width: '10%', textAlign: 'right' },
  colTVAp: { width: '7%', textAlign: 'center' },
  colTVAe: { width: '9%', textAlign: 'right' },
  colTTC:  { width: '10%', textAlign: 'right' },

  // Totals
  totalsBox:   { alignSelf: 'flex-end', width: 200, marginBottom: 16 },
  totalRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottom: `0.5 solid ${BORDER}` },
  totalLabel:  { color: GRAY, fontSize: 8.5 },
  totalValue:  { fontWeight: 'bold', fontSize: 8.5 },
  grandRow:    { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: BLUE, padding: '5 6', borderRadius: 2, marginTop: 3 },
  grandLabel:  { color: WHITE, fontWeight: 'bold', fontSize: 9 },
  grandValue:  { color: WHITE, fontWeight: 'bold', fontSize: 9 },

  // VAT mention
  vatMentionBox: { backgroundColor: '#FFFDE7', borderRadius: 2, padding: '4 8', marginBottom: 10, border: `0.5 solid #F9A825` },
  vatMentionText:{ fontSize: 7.5, color: '#5D4037' },

  // Footer
  footer:      { position: 'absolute', bottom: 20, left: 30, right: 30, borderTop: `0.5 solid ${BORDER}`, paddingTop: 5 },
  footerRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  footerText:  { fontSize: 7, color: GRAY },
  footerItalic:{ fontSize: 7, color: GRAY },
});

// ── Logo SVG ──────────────────────────────────────────────────────────────────
function LogoSvg() {
  return (
    <Svg width={44} height={44} viewBox="0 0 100 100">
      <Path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="#C8803A" strokeWidth="4" />
      <Path d="M50 16 L84 50 L50 84 L16 50 Z" fill="none" stroke="#C8803A" strokeWidth="2" />
      <Line x1="50" y1="28" x2="50" y2="72" stroke={DARK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="36" y1="28" x2="64" y2="28" stroke={DARK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="36" y1="72" x2="64" y2="72" stroke={DARK} strokeWidth="4" strokeLinecap="round" />
      <Circle cx="50" cy="50" r="4" fill="#C8803A" />
    </Svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface DocLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  vatRate?: number;
  discountRate?: number;
  period?: string;
}

export interface IneeDocumentProps {
  type: 'DEVIS' | 'FACTURE' | 'NOTE DE CRÉDIT' | 'SOUSCRIPTION';
  number: string;
  date: string;
  dueDate?: string;
  status: string;
  company?: { name: string; address?: string; postalCode?: string; city?: string; country?: string; vatNumber?: string };
  lines: DocLine[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  vatMention?: string;
  notes?: string;
  paymentTerms?: string;
}

// ── Composant principal ────────────────────────────────────────────────────────
export function IneeDocumentPdf({
  type, number, date, dueDate, company, lines,
  subtotal, vatRate, vatAmount, total, vatMention, notes, paymentTerms,
}: IneeDocumentProps) {

  // Calcul TVA groupée par taux
  const vatGroups: Record<string, number> = {};
  lines.forEach(l => {
    const rate = String(l.vatRate ?? vatRate ?? 17);
    const lineHT = Math.round(l.quantity * l.unitPrice * (1 - (l.discountRate ?? 0) / 100) * 100) / 100;
    vatGroups[rate] = (vatGroups[rate] || 0) + lineHT;
  });

  const typeLabel = type === 'FACTURE' ? 'FACTURE' : type === 'DEVIS' ? 'DEVIS' : type === 'NOTE DE CRÉDIT' ? 'NOTE DE CRÉDIT' : 'SOUSCRIPTION';
  const footerNote = type === 'DEVIS'
    ? 'Ce devis est valable 14 jours à compter de sa date d\'émission.'
    : type === 'FACTURE'
    ? `Paiement à réception. Tout retard de paiement entraîne des pénalités légales.`
    : '';

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── En-tête ── */}
        <View style={s.headerRow}>
          <View style={s.logoBox}>
            <LogoSvg />
            <Text style={s.logoName}>INEE</Text>
          </View>
          <View style={s.companyBlock}>
            <Text style={s.companyName}>INEE Sàrl</Text>
            <Text style={s.companyLine}>{INEE.address}, {INEE.postalCity}</Text>
            <Text style={s.companyLine}>Email : {INEE.email}</Text>
            <Text style={s.companyLine}>N° TVA : {INEE.vat}</Text>
          </View>
        </View>

        {/* ── Titre ── */}
        <View style={s.titleBanner}>
          <Text style={s.titleText}>{typeLabel} N° {number}</Text>
        </View>
        <View style={s.dateRow}>
          <Text>Date : {date}</Text>
          {dueDate && <Text>Échéance : {dueDate}</Text>}
          {paymentTerms && <Text>Conditions de paiement : {paymentTerms}</Text>}
        </View>

        {/* ── Client ── */}
        {company && (
          <>
            <View style={s.clientLabelRow}><Text style={s.clientLabelText}>Client :</Text></View>
            <View style={s.clientInfo}>
              <Text style={{ fontWeight: 'bold' }}>{company.name}</Text>
              {company.address && <Text>{company.address}</Text>}
              {(company.postalCode || company.city) && <Text>{[company.postalCode, company.city].filter(Boolean).join(' ')}</Text>}
              {company.country && company.country !== 'LU' && <Text>{company.country}</Text>}
              {company.vatNumber && <Text>TVA : {company.vatNumber}</Text>}
            </View>
          </>
        )}

        {/* ── Tableau des lignes ── */}
        <View style={s.table}>
          {/* En-tête du tableau */}
          <View style={s.tableHeader}>
            <Text style={[s.thCell, s.colNum]}>N°</Text>
            <Text style={[s.thCell, s.colDesc]}>Description</Text>
            <Text style={[s.thCell, s.colPer]}>Période</Text>
            <Text style={[s.thCell, s.colQty]}>Qté</Text>
            <Text style={[s.thCell, s.colRem]}>Remise</Text>
            <Text style={[s.thCell, s.colPU]}>PU HT</Text>
            <Text style={[s.thCell, s.colHT]}>Total HT</Text>
            <Text style={[s.thCell, s.colTVAp]}>TVA %</Text>
            <Text style={[s.thCell, s.colTVAe]}>TVA €</Text>
            <Text style={[s.thCell, s.colTTC]}>TTC</Text>
          </View>

          {/* Lignes */}
          {lines.map((l, i) => {
            const lineRate = l.vatRate ?? vatRate ?? 17;
            const disc = l.discountRate ?? 0;
            const lineHT = Math.round(l.quantity * l.unitPrice * (1 - disc / 100) * 100) / 100;
            const lineTVA = Math.round(lineHT * lineRate / 100 * 100) / 100;
            const lineTTC = Math.round((lineHT + lineTVA) * 100) / 100;
            return (
              <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                <Text style={[s.tdCell, s.colNum]}>{i + 1}</Text>
                <Text style={[s.tdCell, s.colDesc]}>{l.description}</Text>
                <Text style={[s.tdCell, s.colPer]}>{l.period ?? ''}</Text>
                <Text style={[s.tdCell, s.colQty]}>{l.quantity}</Text>
                <Text style={[s.tdCell, s.colRem]}>{disc > 0 ? `${disc}%` : '0%'}</Text>
                <Text style={[s.tdCell, s.colPU]}>{fmt(l.unitPrice)}</Text>
                <Text style={[s.tdCell, s.colHT]}>{fmt(lineHT)}</Text>
                <Text style={[s.tdCell, s.colTVAp]}>{lineRate}%</Text>
                <Text style={[s.tdCell, s.colTVAe]}>{fmt(lineTVA)}</Text>
                <Text style={[s.tdCell, s.colTTC]}>{fmt(lineTTC)}</Text>
              </View>
            );
          })}
        </View>

        {/* ── Totaux ── */}
        <View style={s.totalsBox}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total HT</Text>
            <Text style={s.totalValue}>{fmt(subtotal)}</Text>
          </View>
          {Object.entries(vatGroups).sort((a, b) => Number(a[0]) - Number(b[0])).map(([rate, base]) => {
            const tvaAmt = Math.round(base * Number(rate) / 100 * 100) / 100;
            return (
              <View key={rate} style={s.totalRow}>
                <Text style={s.totalLabel}>Total TVA {rate}%</Text>
                <Text style={s.totalValue}>{fmt(tvaAmt)}</Text>
              </View>
            );
          })}
          <View style={s.grandRow}>
            <Text style={s.grandLabel}>TOTAL TTC</Text>
            <Text style={s.grandValue}>{fmt(total)}</Text>
          </View>
        </View>

        {/* ── Mention TVA ── */}
        {vatMention && (
          <View style={s.vatMentionBox}>
            <Text style={s.vatMentionText}>Mention TVA : {vatMention}</Text>
          </View>
        )}

        {/* ── Notes ── */}
        {notes && <Text style={{ fontSize: 8, color: GRAY, marginBottom: 8, fontStyle: 'italic' }}>{notes}</Text>}

        {/* ── Footer ── */}
        <View style={s.footer}>
          <View style={s.footerRow}>
            <Text style={s.footerText}>inee.lu</Text>
            {paymentTerms && <Text style={s.footerText}>Conditions de paiement : {paymentTerms}</Text>}
            <Text style={s.footerText}>Banque : {INEE.bank} | IBAN : {INEE.iban} | BIC : {INEE.bic}</Text>
          </View>
          {footerNote ? <Text style={[s.footerItalic, { marginTop: 3 }]}>{footerNote}</Text> : null}
        </View>

      </Page>
    </Document>
  );
}
