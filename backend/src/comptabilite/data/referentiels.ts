/**
 * Référentiels comptables LU / BE / FR / DE — situation 2025-2026.
 *
 * Source : étude `docs/recherche-comptable/`. Les montants intègrent les
 * relèvements de seuils 2024 (transposition de la directive déléguée UE 2023/2775).
 *
 * ⚠️ Données de cadrage — à reconfirmer sur source officielle avant usage légal.
 * Les taux de TVA et seuils de franchise évoluent en loi de finances annuelle.
 * Chaque bloc porte une `dateEffet` pour faciliter le versionnement futur.
 */

export type Pays = 'LU' | 'BE' | 'FR' | 'DE';
export const PAYS_SUPPORTES: Pays[] = ['LU', 'BE', 'FR', 'DE'];

export type CategorieTaille = 'micro' | 'petite' | 'moyenne' | 'grande';

export type TypeEntite =
  | 'SOCIETE_CAPITAUX' // SARL/Sàrl/SRL/GmbH/UG, SA/NV/AG, SAS... → partie double systématique
  | 'SOCIETE_PERSONNES' // SENC/SNC, SCS...
  | 'PERSONNE_PHYSIQUE' // indépendant, entreprise individuelle, commerçant
  | 'PROFESSION_LIBERALE'
  | 'ASSOCIATION'; // ASBL, association, Verein, fondation

export type RegimeComptable =
  | 'PARTIE_DOUBLE'
  | 'SIMPLIFIEE' // BE : 3 journaux (financier / achats / ventes)
  | 'TRESORERIE' // FR : BNC déclaration contrôlée (encaissements/décaissements)
  | 'MICRO' // FR : livre des recettes (régime micro-fiscal)
  | 'EUR' // DE : Einnahmenüberschussrechnung (recettes-dépenses)
  | 'ALLEGEE'; // LU : personnes physiques / sociétés de personnes < 100 000 €

export interface SeuilCategorie {
  /** Total du bilan, en EUR. null = pas de plafond (catégorie « grande »). */
  bilanMax: number | null;
  /** Chiffre d'affaires net HT, en EUR. */
  caMax: number | null;
  /** Effectif moyen annuel. */
  effectifMax: number | null;
}

export interface ReferentielTva {
  normal: number;
  intermediaire: number | null;
  reduit: number | null;
  superReduit: number | null;
  /** Seuil de franchise national (CA HT). Pour FR, voir `franchiseFr`. */
  franchiseMax: number | null;
  /** France : seuils différenciés vente / services. */
  franchiseFr?: {
    venteMax: number;
    servicesMax: number;
    venteMajoreMax: number;
    servicesMajoreMax: number;
  };
  numTvaFormat: string;
}

export interface SeuilsAudit {
  /** Mode de déclenchement de l'audit légal. */
  mode: 'CRITERES_DEDIES' | 'CATEGORIE';
  /** Si mode = CRITERES_DEDIES (France) : 2 des 3 critères. */
  criteres?: { bilan: number; ca: number; effectif: number };
  /** Si mode = CATEGORIE : catégories déclenchant l'audit. */
  categoriesAuditees?: CategorieTaille[];
  auditeur: string;
}

export interface ObligationsDepot {
  destinataire: string;
  formatElectronique: string;
  delai: string;
}

export interface ReferentielPays {
  pays: Pays;
  libelle: string;
  baseLegale: string;
  dateEffet: string;
  /** Catégories de la plus petite à la plus grande (sans « grande »). */
  categories: { cle: CategorieTaille; seuils: SeuilCategorie }[];
  tva: ReferentielTva;
  audit: SeuilsAudit;
  depot: ObligationsDepot;
  /** Paramètres déterminant le régime comptable des entités non « capitaux ». */
  regimeAllege: {
    /** CA HT en dessous duquel une personne physique / société de personnes est allégée. */
    caMaxPersonnePhysique: number | null;
    /** DE : plafond de bénéfice annuel (§ 241a HGB). */
    beneficeMaxPersonnePhysique?: number | null;
    /** Régime applicable sous le seuil. */
    regimeSousSeuil: RegimeComptable;
  };
}

const LU: ReferentielPays = {
  pays: 'LU',
  libelle: 'Luxembourg',
  baseLegale: 'Loi du 19/12/2002 (art. 35/47 LRCS) ; règl. g.-d. du 25/10/2024',
  dateEffet: '2024-01-01',
  categories: [
    { cle: 'micro', seuils: { bilanMax: 450_000, caMax: 900_000, effectifMax: 10 } },
    { cle: 'petite', seuils: { bilanMax: 7_500_000, caMax: 15_000_000, effectifMax: 50 } },
    { cle: 'moyenne', seuils: { bilanMax: 25_000_000, caMax: 50_000_000, effectifMax: 250 } },
  ],
  tva: {
    normal: 17,
    intermediaire: 14,
    reduit: 8,
    superReduit: 3,
    franchiseMax: 50_000,
    numTvaFormat: 'LU + 8 chiffres',
  },
  audit: {
    mode: 'CATEGORIE',
    categoriesAuditees: ['moyenne', 'grande'],
    auditeur: "Réviseur d'entreprises agréé",
  },
  depot: {
    destinataire: 'RCS Luxembourg (publication RESA)',
    formatElectronique: 'eCDF (liasse structurée alignée sur le PCN)',
    delai: '7 mois après la clôture',
  },
  regimeAllege: {
    caMaxPersonnePhysique: 100_000,
    regimeSousSeuil: 'ALLEGEE',
  },
};

const BE: ReferentielPays = {
  pays: 'BE',
  libelle: 'Belgique',
  baseLegale: 'Code des sociétés et des associations (art. 1:24 / 1:25)',
  dateEffet: '2024-01-01',
  categories: [
    { cle: 'micro', seuils: { bilanMax: 450_000, caMax: 900_000, effectifMax: 10 } },
    { cle: 'petite', seuils: { bilanMax: 6_000_000, caMax: 11_250_000, effectifMax: 50 } },
    // Pas de catégorie « moyenne » en droit belge.
  ],
  tva: {
    normal: 21,
    intermediaire: 12,
    reduit: 6,
    superReduit: 0,
    franchiseMax: 25_000,
    numTvaFormat: 'BE0 + 9 chiffres',
  },
  audit: {
    mode: 'CATEGORIE',
    categoriesAuditees: ['grande'],
    auditeur: 'Commissaire (réviseur IRE)',
  },
  depot: {
    destinataire: 'Banque Nationale de Belgique — Centrale des bilans',
    formatElectronique: 'XBRL (schémas micro / abrégé / complet)',
    delai: "30 jours après l'AG, au plus tard 7 mois après la clôture",
  },
  regimeAllege: {
    caMaxPersonnePhysique: 500_000,
    regimeSousSeuil: 'SIMPLIFIEE',
  },
};

const FR: ReferentielPays = {
  pays: 'FR',
  libelle: 'France',
  baseLegale: 'Code de commerce (art. D.230-1) ; décret n° 2024-152 du 28/02/2024',
  dateEffet: '2024-01-01',
  categories: [
    { cle: 'micro', seuils: { bilanMax: 450_000, caMax: 900_000, effectifMax: 10 } },
    { cle: 'petite', seuils: { bilanMax: 7_500_000, caMax: 15_000_000, effectifMax: 50 } },
    { cle: 'moyenne', seuils: { bilanMax: 25_000_000, caMax: 50_000_000, effectifMax: 250 } },
  ],
  tva: {
    normal: 20,
    intermediaire: 10,
    reduit: 5.5,
    superReduit: 2.1,
    franchiseMax: null,
    franchiseFr: {
      venteMax: 85_000,
      servicesMax: 37_500,
      venteMajoreMax: 93_500,
      servicesMajoreMax: 41_250,
    },
    numTvaFormat: 'FR + clé 2 car. + SIREN 9 chiffres',
  },
  audit: {
    // France : seuils CAC dédiés, distincts des catégories de taille.
    mode: 'CRITERES_DEDIES',
    criteres: { bilan: 5_000_000, ca: 10_000_000, effectif: 50 },
    auditeur: 'Commissaire aux comptes (CAC)',
  },
  depot: {
    destinataire: 'Guichet unique INPI → RNE + greffe du tribunal de commerce',
    formatElectronique: 'EDI / EFI',
    delai: "AG sous 6 mois ; dépôt sous 1 mois après l'approbation (2 mois si en ligne)",
  },
  regimeAllege: {
    // Pour une personne physique au régime micro-fiscal.
    caMaxPersonnePhysique: null,
    regimeSousSeuil: 'MICRO',
  },
};

const DE: ReferentielPays = {
  pays: 'DE',
  libelle: 'Allemagne',
  baseLegale: 'Handelsgesetzbuch (§ 267 / § 267a / § 241a HGB)',
  dateEffet: '2024-01-01',
  categories: [
    { cle: 'micro', seuils: { bilanMax: 450_000, caMax: 900_000, effectifMax: 10 } },
    { cle: 'petite', seuils: { bilanMax: 7_500_000, caMax: 15_000_000, effectifMax: 50 } },
    { cle: 'moyenne', seuils: { bilanMax: 25_000_000, caMax: 50_000_000, effectifMax: 250 } },
  ],
  tva: {
    normal: 19,
    intermediaire: null,
    reduit: 7,
    superReduit: null,
    franchiseMax: 25_000, // Kleinunternehmer : 25 000 € (N-1) / 100 000 € (année en cours)
    numTvaFormat: 'DE + 9 chiffres',
  },
  audit: {
    mode: 'CATEGORIE',
    categoriesAuditees: ['moyenne', 'grande'],
    auditeur: 'Wirtschaftsprüfer',
  },
  depot: {
    destinataire: 'Bundesanzeiger → Unternehmensregister',
    formatElectronique: 'E-Bilanz (XBRL, § 5b EStG)',
    delai: '12 mois après la clôture',
  },
  regimeAllege: {
    caMaxPersonnePhysique: 800_000, // § 241a HGB
    beneficeMaxPersonnePhysique: 80_000,
    regimeSousSeuil: 'EUR',
  },
};

export const REFERENTIELS: Record<Pays, ReferentielPays> = { LU, BE, FR, DE };

/** Régime UE de franchise transfrontalière (depuis le 1er janvier 2025). */
export const FRANCHISE_UE = {
  enVigueurDepuis: '2025-01-01',
  seuilCaUeMax: 100_000,
  declaration: 'trimestrielle pour les utilisateurs du régime transfrontalier',
};
