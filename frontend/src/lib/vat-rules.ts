export const EU_COUNTRIES = [
  'AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI','FR','GR','HR',
  'HU','IE','IT','LT','LV','MT','NL','PL','PT','RO','SE','SI','SK',
];

export const LU_VAT_RATES = [
  { value: 0,  label: '0% — Exonéré' },
  { value: 3,  label: '3% — Super réduit (médicaments, livres, aliments)' },
  { value: 8,  label: '8% — Réduit intermédiaire (gaz, électricité, restauration)' },
  { value: 14, label: '14% — Réduit (vins, certains imprimés)' },
  { value: 17, label: '17% — Normal' },
];

export type VatRegime = 'LU' | 'EU_B2B' | 'EU_B2C' | 'HORS_UE_B2B' | 'HORS_UE_B2C';

export interface VatResult {
  regime: VatRegime;
  rate: number;
  mention?: string;
  label: string;
}

export function computeVat(
  client: { country?: string; clientType: 'SOCIETE' | 'PARTICULIER'; vatNumber?: string } | null,
  serviceVatRate: number,
): VatResult {
  if (!client) return { regime: 'LU', rate: serviceVatRate, label: `TVA LU ${serviceVatRate}%` };

  const country = (client.country || 'LU').toUpperCase().trim();

  if (country === 'LU' || country === 'LUXEMBOURG') {
    return { regime: 'LU', rate: serviceVatRate, label: `TVA LU ${serviceVatRate}%` };
  }

  const isEU = EU_COUNTRIES.includes(country);
  const isBusiness = client.clientType === 'SOCIETE' && !!client.vatNumber;

  if (isEU) {
    if (isBusiness) {
      return {
        regime: 'EU_B2B', rate: 0,
        mention: 'Autoliquidation — Art. 44 Dir. 2006/112/CE',
        label: 'UE B2B — 0% (autoliquidation)',
      };
    }
    return { regime: 'EU_B2C', rate: 17, label: 'UE B2C — TVA LU 17%' };
  }

  if (isBusiness) {
    return {
      regime: 'HORS_UE_B2B', rate: 0,
      mention: 'Hors champ TVA — Art. 45 loi TVA LU',
      label: 'Hors UE B2B — 0% (hors champ)',
    };
  }
  return {
    regime: 'HORS_UE_B2C', rate: 0,
    mention: 'Hors champ TVA',
    label: 'Hors UE B2C — 0% (hors champ)',
  };
}
