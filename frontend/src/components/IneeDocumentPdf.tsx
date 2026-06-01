'use client';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Line, Circle } from '@react-pdf/renderer';
import { INEE } from '@/lib/inee-brand';

// ── Couleurs INEE ─────────────────────────────────────────────────────────────
const COPPER   = '#C8803A';
const DARK     = '#1A1008';
const CREAM    = '#F5EDE4';
const LIGHT    = '#FAF6F1';
const GRAY     = '#7A6050';
const WHITE    = '#FFFFFF';
const BORDER   = '#E0C8B0';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-LU', { style: 'currency', currency: 'EUR' }).format(n ?? 0);

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page:         { fontFamily: 'Helvetica', fontSize: 9, color: DARK, backgroundColor: WHITE, paddingTop: 0, paddingBottom: 50, paddingLeft: 0, paddingRight: 0 },

  // Header bande sombre
  headerBand:   { backgroundColor: DARK, paddingTop: 18, paddingBottom: 18, paddingLeft: 30, paddingRight: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoArea:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoName:     { fontSize: 20, fontWeight: 'bold', letterSpacing: 4, color: WHITE },
  companyRight: { textAlign: 'right' },
  companyName:  { fontSize: 11, fontWeight: 'bold', color: COPPER, marginBottom: 2 },
  companyLine:  { fontSize: 7.5, color: CREAM, lineHeight: 1.5 },

  // Zone contenu
  content:      { paddingLeft: 30, paddingRight: 30 },

  // Titre document
  docTitleRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  docTitleBox:  { borderLeftWidth: 3, borderLeftColor: COPPER, borderLeftStyle: 'solid', paddingLeft: 10 },
  docType:      { fontSize: 18, fontWeight: 'bold', color: DARK, letterSpacing: 1 },
  docNumber:    { fontSize: 10, color: COPPER, fontWeight: 'bold', marginTop: 2 },
  docMetaBox:   { textAlign: 'right', fontSize: 8.5 },
  docMetaLabel: { color: GRAY },
  docMetaValue: { fontWeight: 'bold', color: DARK },

  // Divider
  divider:      { height: 1, backgroundColor: COPPER, marginBottom: 16, opacity: 0.4 },

  // Blocs côte à côte
  infoRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  clientBox:    { width: '48%' },
  paymentBox:   { width: '48%', backgroundColor: LIGHT, borderRadius: 4, padding: 10 },
  boxTitle:     { fontSize: 7, fontWeight: 'bold', color: COPPER, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  clientName:   { fontSize: 10, fontWeight: 'bold', color: DARK, marginBottom: 2 },
  clientDetail: { fontSize: 8.5, color: GRAY, lineHeight: 1.5 },
  payRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  payLabel:     { fontSize: 8, color: GRAY },
  payValue:     { fontSize: 8, fontWeight: 'bold', color: DARK },

  // Message intro
  message:      { backgroundColor: CREAM, borderRadius: 4, paddingTop: 10, paddingBottom: 10, paddingLeft: 14, paddingRight: 14, marginBottom: 16 },
  messageText:  { fontSize: 8.5, color: DARK, lineHeight: 1.6 },

  // Tableau
  tableHeader:  { flexDirection: 'row', backgroundColor: DARK, paddingTop: 7, paddingBottom: 7, paddingLeft: 8, paddingRight: 8 },
  tableRow:     { flexDirection: 'row', paddingTop: 6, paddingBottom: 6, paddingLeft: 8, paddingRight: 8, borderBottomWidth: 0.5, borderBottomColor: BORDER, borderBottomStyle: 'solid' },
  tableRowAlt:  { backgroundColor: LIGHT },
  thCell:       { color: WHITE, fontWeight: 'bold', fontSize: 7.5 },
  tdCell:       { fontSize: 8, color: DARK },

  // Colonnes tableau
  cDesc: { flex: 1 },
  cQty:  { width: 35, textAlign: 'center' },
  cPU:   { width: 65, textAlign: 'right' },
  cVAT:  { width: 40, textAlign: 'center' },
  cTot:  { width: 70, textAlign: 'right' },

  // Totaux
  totalsSection: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, marginBottom: 16 },
  totalsBox:     { width: 210 },
  totalRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 4, borderBottomWidth: 0.5, borderBottomColor: BORDER, borderBottomStyle: 'solid' },
  totalLabel:    { fontSize: 8.5, color: GRAY },
  totalValue:    { fontSize: 8.5, fontWeight: 'bold', color: DARK },
  grandBox:      { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COPPER, paddingTop: 7, paddingBottom: 7, paddingLeft: 10, paddingRight: 10, borderRadius: 4, marginTop: 4 },
  grandLabel:    { fontSize: 10, fontWeight: 'bold', color: WHITE },
  grandValue:    { fontSize: 10, fontWeight: 'bold', color: WHITE },

  // Mention TVA
  vatBox:        { backgroundColor: '#FFF9E6', borderRadius: 4, paddingTop: 6, paddingBottom: 6, paddingLeft: 10, paddingRight: 10, marginBottom: 10, borderWidth: 0.5, borderColor: COPPER, borderStyle: 'solid', borderLeftWidth: 3, borderLeftColor: COPPER },
  vatText:       { fontSize: 8, color: DARK },

  // Notes
  notesBox:      { marginBottom: 12 },
  notesLabel:    { fontSize: 7, fontWeight: 'bold', color: COPPER, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 },
  notesText:     { fontSize: 8.5, color: GRAY, lineHeight: 1.5 },

  // Footer
  footer:        { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: DARK, paddingTop: 10, paddingBottom: 10, paddingLeft: 30, paddingRight: 30 },
  footerRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText:    { fontSize: 7, color: CREAM },
  footerCopper:  { fontSize: 7, color: COPPER, fontWeight: 'bold' },
  pageNum:       { fontSize: 7, color: GRAY },
});

// ── Logo SVG ──────────────────────────────────────────────────────────────────
function LogoSvg() {
  return (
    <Svg width={32} height={32} viewBox="0 0 100 100">
      <Path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke={COPPER} strokeWidth="5" />
      <Path d="M50 16 L84 50 L50 84 L16 50 Z" fill="none" stroke={COPPER} strokeWidth="2.5" />
      <Line x1="50" y1="28" x2="50" y2="72" stroke={WHITE} strokeWidth="5" strokeLinecap="round" />
      <Line x1="36" y1="28" x2="64" y2="28" stroke={WHITE} strokeWidth="5" strokeLinecap="round" />
      <Line x1="36" y1="72" x2="64" y2="72" stroke={WHITE} strokeWidth="5" strokeLinecap="round" />
      <Circle cx="50" cy="50" r="5" fill={COPPER} />
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
  customTitle?: string; // ex: "RAPPEL N°1 / REMINDER N°1"
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

// ── Message intro selon type ───────────────────────────────────────────────────
function getIntroMessage(type: string, company?: { name: string }): string {
  const client = company?.name ? `à l'attention de ${company.name}` : '';
  switch (type) {
    case 'FACTURE':       return `Madame, Monsieur,\n\nVeuillez trouver ci-joint notre facture ${client}. Nous vous remercions de votre confiance et restons disponibles pour toute question.`;
    case 'DEVIS':         return `Madame, Monsieur,\n\nNous avons le plaisir de vous soumettre notre devis ${client}. Ce document est valable 14 jours à compter de sa date d'émission.`;
    case 'NOTE DE CRÉDIT':return `Madame, Monsieur,\n\nVeuillez trouver ci-joint notre note de crédit ${client}.`;
    default:              return `Madame, Monsieur,\n\nVeuillez trouver ci-joint ce document ${client}.`;
  }
}

// ── Composant principal ────────────────────────────────────────────────────────
export function IneeDocumentPdf({
  type, customTitle, number, date, dueDate, company, lines,
  subtotal, vatRate, vatAmount, total, vatMention, notes, paymentTerms,
}: IneeDocumentProps) {
  const displayType = customTitle ?? type;

  // Grouper TVA par taux
  const vatGroups: Record<string, number> = {};
  lines.forEach(l => {
    const rate = String(l.vatRate ?? vatRate ?? 17);
    const lineHT = Math.round(l.quantity * l.unitPrice * (1 - (l.discountRate ?? 0) / 100) * 100) / 100;
    vatGroups[rate] = (vatGroups[rate] || 0) + lineHT;
  });

  const introMsg = getIntroMessage(customTitle ?? type, company);

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Bande header sombre ── */}
        <View style={s.headerBand}>
          <View style={s.logoArea}>
            <LogoSvg />
            <Text style={s.logoName}>INEE</Text>
          </View>
          <View style={s.companyRight}>
            <Text style={s.companyName}>INEE Sàrl</Text>
            <Text style={s.companyLine}>{INEE.address}, {INEE.postalCity}</Text>
            <Text style={s.companyLine}>{INEE.email}  |  N° TVA : {INEE.vat}</Text>
          </View>
        </View>

        <View style={s.content}>

          {/* ── Titre + méta ── */}
          <View style={s.docTitleRow}>
            <View style={s.docTitleBox}>
              <Text style={s.docType}>{displayType}</Text>
              <Text style={s.docNumber}>N° {number}</Text>
            </View>
            <View style={s.docMetaBox}>
              <Text style={s.docMetaLabel}>Date : <Text style={s.docMetaValue}>{date}</Text></Text>
              {dueDate && <Text style={[s.docMetaLabel, { marginTop: 3 }]}>Échéance : <Text style={s.docMetaValue}>{dueDate}</Text></Text>}
              {paymentTerms && <Text style={[s.docMetaLabel, { marginTop: 3 }]}>Paiement : <Text style={s.docMetaValue}>{paymentTerms}</Text></Text>}
            </View>
          </View>

          <View style={s.divider} />

          {/* ── Client + conditions ── */}
          <View style={s.infoRow}>
            <View style={s.clientBox}>
              <Text style={s.boxTitle}>Client</Text>
              {company ? (
                <>
                  <Text style={s.clientName}>{company.name}</Text>
                  {company.address && <Text style={s.clientDetail}>{company.address}</Text>}
                  {(company.postalCode || company.city) && <Text style={s.clientDetail}>{[company.postalCode, company.city].filter(Boolean).join(' ')}</Text>}
                  {company.country && company.country !== 'LU' && <Text style={s.clientDetail}>{company.country}</Text>}
                  {company.vatNumber && <Text style={s.clientDetail}>TVA : {company.vatNumber}</Text>}
                </>
              ) : <Text style={s.clientDetail}>—</Text>}
            </View>
            <View style={s.paymentBox}>
              <Text style={s.boxTitle}>Informations de paiement</Text>
              <View style={s.payRow}><Text style={s.payLabel}>Banque</Text><Text style={s.payValue}>{INEE.bank}</Text></View>
              <View style={s.payRow}><Text style={s.payLabel}>IBAN</Text><Text style={s.payValue}>{INEE.iban}</Text></View>
              <View style={s.payRow}><Text style={s.payLabel}>BIC/SWIFT</Text><Text style={s.payValue}>{INEE.bic}</Text></View>
              {paymentTerms && <View style={[s.payRow, { marginTop: 4 }]}><Text style={s.payLabel}>Conditions</Text><Text style={s.payValue}>{paymentTerms}</Text></View>}
            </View>
          </View>

          {/* ── Message intro ── */}
          <View style={s.message}>
            <Text style={s.messageText}>{introMsg}</Text>
          </View>

          {/* ── Tableau ── */}
          <View style={s.tableHeader}>
            <Text style={[s.thCell, s.cDesc]}>Description</Text>
            <Text style={[s.thCell, s.cQty]}>Qté</Text>
            <Text style={[s.thCell, s.cPU]}>Prix HT</Text>
            <Text style={[s.thCell, s.cVAT]}>TVA</Text>
            <Text style={[s.thCell, s.cTot]}>Total HT</Text>
          </View>
          {lines.map((l, i) => {
            const disc = l.discountRate ?? 0;
            const lineHT = Math.round(l.quantity * l.unitPrice * (1 - disc / 100) * 100) / 100;
            const lineRate = l.vatRate ?? vatRate ?? 17;
            return (
              <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                <Text style={[s.tdCell, s.cDesc]}>
                  {l.description}{disc > 0 ? ` (−${disc}%)` : ''}
                  {l.period ? `\n${l.period}` : ''}
                </Text>
                <Text style={[s.tdCell, s.cQty]}>{l.quantity}</Text>
                <Text style={[s.tdCell, s.cPU]}>{fmt(l.unitPrice)}</Text>
                <Text style={[s.tdCell, s.cVAT]}>{lineRate}%</Text>
                <Text style={[s.tdCell, s.cTot]}>{fmt(lineHT)}</Text>
              </View>
            );
          })}

          {/* ── Totaux ── */}
          <View style={s.totalsSection}>
            <View style={s.totalsBox}>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Total HT</Text>
                <Text style={s.totalValue}>{fmt(subtotal)}</Text>
              </View>
              {Object.entries(vatGroups).sort((a, b) => Number(a[0]) - Number(b[0])).map(([rate, base]) => {
                const tva = Math.round(base * Number(rate) / 100 * 100) / 100;
                return (
                  <View key={rate} style={s.totalRow}>
                    <Text style={s.totalLabel}>TVA {rate}%</Text>
                    <Text style={s.totalValue}>{fmt(tva)}</Text>
                  </View>
                );
              })}
              <View style={s.grandBox}>
                <Text style={s.grandLabel}>TOTAL TTC</Text>
                <Text style={s.grandValue}>{fmt(total)}</Text>
              </View>
            </View>
          </View>

          {/* ── Mention TVA ── */}
          {vatMention && (
            <View style={s.vatBox}>
              <Text style={s.vatText}>{vatMention}</Text>
            </View>
          )}

          {/* ── Notes ── */}
          {notes && (
            <View style={s.notesBox}>
              <Text style={s.notesLabel}>Notes</Text>
              <Text style={s.notesText}>{notes}</Text>
            </View>
          )}

        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <View style={s.footerRow}>
            <Text style={s.footerCopper}>INEE Sàrl</Text>
            <Text style={s.footerText}>{INEE.address} — {INEE.postalCity}</Text>
            <Text style={s.footerText}>TVA : {INEE.vat}  |  {INEE.email}</Text>
            <Text
              style={s.pageNum}
              render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}`}
            />
          </View>
        </View>

      </Page>
      <CGVPage />
    </Document>
  );
}

// ── Page CGV — 2 colonnes ─────────────────────────────────────────────────────

const cgvStyles = StyleSheet.create({
  page:    { fontFamily: 'Helvetica', fontSize: 6, color: '#1A1A1A', backgroundColor: '#FFFFFF', paddingTop: 0, paddingBottom: 28, paddingLeft: 0, paddingRight: 0 },
  hband:   { backgroundColor: '#1A1008', paddingTop: 8, paddingBottom: 8, paddingLeft: 20, paddingRight: 20, marginBottom: 10 },
  htitle:  { fontSize: 9, fontWeight: 'bold', color: '#C8803A', letterSpacing: 1 },
  hsub:    { fontSize: 6.5, color: '#F5EDE4', marginTop: 2 },
  cols:    { flexDirection: 'row', paddingLeft: 16, paddingRight: 16, gap: 14, flex: 1 },
  col:     { flex: 1 },
  artTitle:{ fontSize: 6.5, fontWeight: 'bold', color: '#C8803A', marginBottom: 1.5, marginTop: 6 },
  artBody: { lineHeight: 1.35, color: '#1A1A1A' },
  divider: { height: 0.5, backgroundColor: '#E0C8B0', marginTop: 6, marginBottom: 2 },
  footer:  { position: 'absolute', bottom: 8, left: 16, right: 16, borderTopWidth: 0.5, borderTopColor: '#C8803A', borderTopStyle: 'solid', paddingTop: 3 },
  footT:   { fontSize: 5.5, color: '#7A6050', textAlign: 'center' },
});

function CGVPage() {
  return (
    <Page size="A4" style={cgvStyles.page}>
      <View style={cgvStyles.hband}>
        <Text style={cgvStyles.htitle}>CONDITIONS GÉNÉRALES DE VENTE — INEE</Text>
        <Text style={cgvStyles.hsub}>INEE S.à r.l. — 37, Rue du Baumbusch — L-8213 Mamer — Grand-Duché de Luxembourg — N° TVA : LU36332830</Text>
      </View>
      <View style={cgvStyles.cols}>

        {/* Colonne 1 — Art. 1 à 8 */}
        <View style={cgvStyles.col}>
          <Text style={cgvStyles.artTitle}>Art. 1. Définitions</Text>
          <Text style={cgvStyles.artBody}>"INEE" : INEE S.à r.l., société de conseil établie au Luxembourg, 37 Rue du Baumbusch, L-8213 Mamer, TVA LU36332830. "Client" : personne physique ou morale ayant conclu un contrat avec INEE. "Prestation" : service de conseil, d'assistance, de gestion de projet ou prestation intellectuelle fournie par INEE. "Contrat" : bon de commande, devis accepté, lettre de mission ou accord écrit. "Données Personnelles" : données au sens du RGPD communiquées à INEE. "nous/notre" = INEE. "vous/votre" = Client.</Text>

          <Text style={cgvStyles.artTitle}>Art. 2. Champ d'application</Text>
          <Text style={cgvStyles.artBody}>Les CGV s'appliquent à toutes les prestations d'INEE, sauf dérogation expresse écrite. Toute commande implique l'adhésion pleine aux présentes CGV. INEE peut les modifier ; les nouvelles conditions s'appliquent aux missions conclues postérieurement.</Text>

          <Text style={cgvStyles.artTitle}>Art. 3. Offres et commandes</Text>
          <Text style={cgvStyles.artBody}>Offres et devis valables 30 jours calendaires. INEE peut adapter son offre si des prestations complémentaires s'avèrent nécessaires. Toute commande acceptée constitue un engagement ferme et définitif.</Text>

          <Text style={cgvStyles.artTitle}>Art. 4. Tarifs et révision</Text>
          <Text style={cgvStyles.artBody}>Tarifs exprimés hors TVA luxembourgeoise. Révision annuelle possible au 1er janvier sur base de l'IPCN, avec préavis de 30 jours.</Text>

          <Text style={cgvStyles.artTitle}>Art. 5. Facturation et paiement</Text>
          <Text style={cgvStyles.artBody}>I. Factures payables sous 30 jours. II. Retard : intérêts de 8 %/an de plein droit. III. Après 3 relances : indemnité forfaitaire de 150 EUR + suspension possible. IV. Factures non contestées dans les 8 jours sont réputées acceptées. V. Honoraires payables nets ; toute retenue à la source est répercutée sur la facture.</Text>

          <Text style={cgvStyles.artTitle}>Art. 6. Annulation et résiliation</Text>
          <Text style={cgvStyles.artBody}>I. Résiliation écrite avec préavis de 30 jours ; prestations réalisées facturées intégralement. II. Annulation avant démarrage : indemnité de 20 % du devis, min. 250 EUR. III. INEE peut résilier immédiatement (non-paiement, conflit d'intérêts, demande illégale). IV. Tous frais engagés restent dus.</Text>

          <Text style={cgvStyles.artTitle}>Art. 7. Exécution des prestations</Text>
          <Text style={cgvStyles.artBody}>I. Obligation de moyens. II. Délais indicatifs, sans pénalité en cas de dépassement sauf faute manifeste. III. Pas d'obligation de mise à jour des conseils après délivrance. IV. INEE ne fournit pas de conseils juridiques/fiscaux formels.</Text>

          <Text style={cgvStyles.artTitle}>Art. 8. Responsabilité</Text>
          <Text style={cgvStyles.artBody}>I. Responsabilité limitée au montant total facturé et payé pour la mission. II. Aucune responsabilité pour dommages indirects (perte de CA, données, réputation). III. Aucune responsabilité en cas de force majeure.</Text>
        </View>

        {/* Colonne 2 — Art. 9 à 15 + infos */}
        <View style={cgvStyles.col}>
          <Text style={cgvStyles.artTitle}>Art. 9. Propriété intellectuelle</Text>
          <Text style={cgvStyles.artBody}>I. INEE conserve tous droits sur ses méthodes, outils et savoir-faire. II. Livrables cédés pour usage interne exclusif une fois la facture réglée. III. Toute reproduction ou diffusion commerciale sans accord écrit est interdite.</Text>

          <Text style={cgvStyles.artTitle}>Art. 10. Confidentialité</Text>
          <Text style={cgvStyles.artBody}>I. Confidentialité mutuelle de toute information non publique ; pas de divulgation sans accord écrit. II. Divulgation possible aux autorités si la loi l'exige. III. Obligation survivant 5 ans après la mission.</Text>

          <Text style={cgvStyles.artTitle}>Art. 11. Protection des données (RGPD)</Text>
          <Text style={cgvStyles.artBody}>I. INEE agit en sous-traitant RGPD pour les Données Personnelles du Client. II. Le Client garantit les autorisations nécessaires. III. INEE : traitement limité à la mission, confidentialité, sécurité, notification de violation sous 48h. IV. Conservation pour durée légale puis suppression. V. Pas de transfert hors EEE sans accord écrit.</Text>

          <Text style={cgvStyles.artTitle}>Art. 12. Lutte contre le blanchiment</Text>
          <Text style={cgvStyles.artBody}>INEE est soumise aux obligations AML/CFT luxembourgeoises et peut solliciter des justificatifs KYC. Elle peut mettre fin immédiatement à une mission impliquant une violation de sanctions internationales.</Text>

          <Text style={cgvStyles.artTitle}>Art. 13. Communications électroniques</Text>
          <Text style={cgvStyles.artBody}>Les parties acceptent les échanges électroniques. Tout document transmis électroniquement et accepté a la même valeur qu'un document papier signé. INEE n'est pas responsable des risques de transmission électronique.</Text>

          <Text style={cgvStyles.artTitle}>Art. 14. Droit applicable et juridiction</Text>
          <Text style={cgvStyles.artBody}>Droit luxembourgeois applicable. Tout litige est soumis à la compétence exclusive des tribunaux du district de Luxembourg-Ville.</Text>

          <Text style={cgvStyles.artTitle}>Art. 15. Divisibilité et intégralité</Text>
          <Text style={cgvStyles.artBody}>Si une clause est déclarée nulle, les autres restent en vigueur. Les CGV constituent l'intégralité de l'accord et remplacent tout accord antérieur.</Text>

          <View style={cgvStyles.divider} />
          <Text style={[cgvStyles.artTitle, { color: DARK, marginTop: 4 }]}>Coordonnées bancaires</Text>
          <Text style={cgvStyles.artBody}>Banque : {INEE.bank}  |  IBAN : {INEE.iban}  |  BIC : {INEE.bic}{'\n'}Email facturation : invoices@inee.lu</Text>

          <View style={cgvStyles.divider} />
          <Text style={[cgvStyles.artTitle, { color: DARK, marginTop: 4 }]}>Réclamations</Text>
          <Text style={cgvStyles.artBody}>Adresser toute réclamation par courrier recommandé à INEE S.à r.l., 37, Rue du Baumbusch, L-8213 Mamer, ou à invoices@inee.lu, dans les 30 jours suivant la réception du document contesté.</Text>
        </View>

      </View>

      <View style={cgvStyles.footer}>
        <Text style={cgvStyles.footT}>Dernière mise à jour : juin 2026 — INEE S.à r.l., 37, Rue du Baumbusch, L-8213 Mamer, Luxembourg — N° TVA : LU36332830</Text>
      </View>
    </Page>
  );
}
