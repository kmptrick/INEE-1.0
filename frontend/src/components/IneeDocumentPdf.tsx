'use client';
import {
  Document, Page, Text, View, StyleSheet, Font, Svg,
  Path, Rect, Line, Circle, G,
} from '@react-pdf/renderer';
import { INEE, COLORS } from '@/lib/inee-brand';

Font.register({
  family: 'Helvetica',
  fonts: [{ src: 'Helvetica' }, { src: 'Helvetica-Bold', fontWeight: 'bold' }],
});

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: COLORS.dark, backgroundColor: '#FFFFFF', paddingTop: 40, paddingBottom: 60, paddingHorizontal: 45 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  logoArea: { width: 80 },
  logoText: { fontSize: 18, fontWeight: 'bold', letterSpacing: 4, color: COLORS.dark, marginTop: 6 },
  logoE: { color: COLORS.copper },
  addressBlock: { textAlign: 'right', lineHeight: 1.5, color: COLORS.gray },
  divider: { height: 1.5, backgroundColor: COLORS.copper, marginBottom: 20 },
  docTitleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  docTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.copper },
  docMeta: { textAlign: 'right', lineHeight: 1.6, color: COLORS.gray },
  docMetaValue: { color: COLORS.dark, fontWeight: 'bold' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  billTo: { width: '48%' },
  billToLabel: { fontSize: 7, fontWeight: 'bold', color: COLORS.copper, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  billToName: { fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
  billToDetail: { lineHeight: 1.5, color: COLORS.gray },
  bankBox: { width: '48%', backgroundColor: COLORS.light, borderRadius: 4, padding: 10 },
  bankLabel: { fontSize: 7, fontWeight: 'bold', color: COLORS.copper, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  bankKey: { color: COLORS.gray },
  bankVal: { fontWeight: 'bold' },
  table: { marginBottom: 16 },
  tableHeader: { flexDirection: 'row', backgroundColor: COLORS.dark, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 2 },
  tableHeaderCell: { color: '#FFFFFF', fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  tableRowAlt: { backgroundColor: COLORS.light },
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: 'center' },
  colPrice: { width: 70, textAlign: 'right' },
  colTotal: { width: 75, textAlign: 'right' },
  totalsBox: { alignSelf: 'flex-end', width: 220, marginBottom: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  totalLabel: { color: COLORS.gray },
  totalValue: {},
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, backgroundColor: COLORS.copper, paddingHorizontal: 8, borderRadius: 2, marginTop: 4 },
  grandLabel: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 10 },
  grandValue: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 10 },
  notesLabel: { fontSize: 7, fontWeight: 'bold', color: COLORS.copper, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  notesText: { color: COLORS.gray, lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 30, left: 45, right: 45, borderTopWidth: 0.5, borderTopColor: COLORS.border, paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: COLORS.gray },
  statusBadge: { fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
});

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n);

// Inline SVG logo
function LogoSvg() {
  return (
    <Svg width="60" height="60" viewBox="0 0 100 100">
      {/* outer diamond */}
      <Path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke={COLORS.copper} strokeWidth="3" />
      {/* inner diamond */}
      <Path d="M50 14 L86 50 L50 86 L14 50 Z" fill="none" stroke={COLORS.copper} strokeWidth="1.5" />
      {/* I letter */}
      <Line x1="50" y1="28" x2="50" y2="72" stroke={COLORS.dark} strokeWidth="3" />
      <Line x1="38" y1="28" x2="62" y2="28" stroke={COLORS.dark} strokeWidth="3" />
      <Line x1="38" y1="72" x2="62" y2="72" stroke={COLORS.dark} strokeWidth="3" />
      {/* copper dot */}
      <Circle cx="50" cy="50" r="3" fill={COLORS.copper} />
    </Svg>
  );
}

export interface DocLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IneeDocumentProps {
  type: 'DEVIS' | 'FACTURE';
  number: string;
  date: string;
  dueDate?: string;
  status: string;
  company?: { name: string; address?: string; city?: string; vatNumber?: string };
  lines: DocLine[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes?: string;
}

export function IneeDocumentPdf({
  type, number, date, dueDate, status, company, lines,
  subtotal, vatRate, vatAmount, total, notes,
}: IneeDocumentProps) {
  const statusColor: Record<string, string> = {
    DRAFT: COLORS.gray, SENT: '#1D6FD8', ACCEPTED: '#1A7A3C', PAID: '#1A7A3C',
    REJECTED: '#B91C1C', OVERDUE: '#C2410C', CANCELLED: COLORS.gray,
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerRow}>
          <View style={s.logoArea}>
            <LogoSvg />
            <Text style={s.logoText}>INEE</Text>
          </View>
          <View style={s.addressBlock}>
            <Text style={{ fontWeight: 'bold', fontSize: 10, marginBottom: 3 }}>{INEE.name}</Text>
            <Text>{INEE.address}</Text>
            <Text>{INEE.postalCity} — {INEE.country}</Text>
            <Text>TVA : {INEE.vat}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Doc title + meta */}
        <View style={s.docTitleRow}>
          <View>
            <Text style={s.docTitle}>{type}</Text>
            <Text style={[s.statusBadge, { color: statusColor[status] ?? COLORS.gray, marginTop: 4 }]}>{status}</Text>
          </View>
          <View style={s.docMeta}>
            <Text>N° <Text style={s.docMetaValue}>{number}</Text></Text>
            <Text>Date : <Text style={s.docMetaValue}>{date}</Text></Text>
            {dueDate && <Text>Échéance : <Text style={s.docMetaValue}>{dueDate}</Text></Text>}
          </View>
        </View>

        {/* Client + Bank */}
        <View style={s.sectionRow}>
          <View style={s.billTo}>
            <Text style={s.billToLabel}>Facturé à</Text>
            {company ? (
              <>
                <Text style={s.billToName}>{company.name}</Text>
                {company.address && <Text style={s.billToDetail}>{company.address}</Text>}
                {company.city && <Text style={s.billToDetail}>{company.city}</Text>}
                {company.vatNumber && <Text style={s.billToDetail}>TVA : {company.vatNumber}</Text>}
              </>
            ) : (
              <Text style={s.billToDetail}>—</Text>
            )}
          </View>
          <View style={s.bankBox}>
            <Text style={s.bankLabel}>Coordonnées bancaires</Text>
            <View style={s.bankRow}><Text style={s.bankKey}>Banque</Text><Text style={s.bankVal}>{INEE.bank}</Text></View>
            <View style={s.bankRow}><Text style={s.bankKey}>IBAN</Text><Text style={s.bankVal}>{INEE.iban}</Text></View>
            <View style={s.bankRow}><Text style={s.bankKey}>BIC</Text><Text style={s.bankVal}>{INEE.bic}</Text></View>
          </View>
        </View>

        {/* Table */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, s.colDesc]}>Description</Text>
            <Text style={[s.tableHeaderCell, s.colQty]}>Qté</Text>
            <Text style={[s.tableHeaderCell, s.colPrice]}>Prix HT</Text>
            <Text style={[s.tableHeaderCell, s.colTotal]}>Total HT</Text>
          </View>
          {lines.map((l, i) => (
            <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={s.colDesc}>{l.description}</Text>
              <Text style={s.colQty}>{l.quantity}</Text>
              <Text style={s.colPrice}>{fmt(l.unitPrice)}</Text>
              <Text style={s.colTotal}>{fmt(l.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={s.totalsBox}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Sous-total HT</Text>
            <Text style={s.totalValue}>{fmt(subtotal)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>TVA {vatRate}%</Text>
            <Text style={s.totalValue}>{fmt(vatAmount)}</Text>
          </View>
          <View style={s.grandTotalRow}>
            <Text style={s.grandLabel}>TOTAL TTC</Text>
            <Text style={s.grandValue}>{fmt(total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {notes && (
          <View style={{ marginBottom: 20 }}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{INEE.name} — TVA {INEE.vat}</Text>
          <Text style={s.footerText}>{INEE.address}, {INEE.postalCity}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
