import { Injectable, BadRequestException } from '@nestjs/common';
import {
  REFERENTIELS,
  FRANCHISE_UE,
  Pays,
  CategorieTaille,
  TypeEntite,
  RegimeComptable,
  SeuilCategorie,
  ReferentielPays,
} from './data/referentiels';

export interface CritereEvaluation {
  critere: 'bilan' | 'ca' | 'effectif';
  valeur: number;
  seuil: number | null;
  depasse: boolean;
}

export interface ResultatClassification {
  pays: Pays;
  categorie: CategorieTaille;
  libelleCategorie: string;
  criteres: CritereEvaluation[];
  /** Règle « 2 des 3 » : une catégorie est retenue si au plus 1 critère est dépassé. */
  regle: string;
  /** Si figures N-1 fournies : la catégorie N-1 et si le changement est confirmé. */
  persistance?: {
    categoriePrecedente: CategorieTaille;
    changementConfirme: boolean;
    note: string;
  };
}

const LIBELLES: Record<CategorieTaille, string> = {
  micro: 'Micro-entreprise',
  petite: 'Petite entreprise',
  moyenne: 'Moyenne entreprise',
  grande: 'Grande entreprise',
};

@Injectable()
export class ComptabiliteService {
  private ref(pays: Pays): ReferentielPays {
    const r = REFERENTIELS[pays];
    if (!r) throw new BadRequestException(`Pays non supporté : ${pays}`);
    return r;
  }

  /** Liste des référentiels (pour alimenter le frontend). */
  referentiels() {
    return REFERENTIELS;
  }

  // ─── 1. Classification de taille ───────────────────────────────────────────

  private exceedsCount(seuils: SeuilCategorie, bilan: number, ca: number, effectif: number): number {
    let n = 0;
    if (seuils.bilanMax !== null && bilan > seuils.bilanMax) n++;
    if (seuils.caMax !== null && ca > seuils.caMax) n++;
    if (seuils.effectifMax !== null && effectif > seuils.effectifMax) n++;
    return n;
  }

  /**
   * Détermine la catégorie de taille selon la règle UE « ne dépasse pas plus
   * d'un des trois critères ». On retient la plus petite catégorie dont au plus
   * un critère est dépassé ; sinon « grande ».
   */
  private categorieBrute(pays: Pays, bilan: number, ca: number, effectif: number): CategorieTaille {
    const ref = this.ref(pays);
    for (const { cle, seuils } of ref.categories) {
      if (this.exceedsCount(seuils, bilan, ca, effectif) <= 1) return cle;
    }
    return 'grande';
  }

  classifierTaille(input: {
    pays: Pays;
    bilan: number;
    ca: number;
    effectif: number;
    bilanPrecedent?: number;
    caPrecedent?: number;
    effectifPrecedent?: number;
  }): ResultatClassification {
    const { pays, bilan, ca, effectif } = input;
    const ref = this.ref(pays);
    const categorie = this.categorieBrute(pays, bilan, ca, effectif);

    // Détail critère par critère, en se référant aux seuils de la catégorie « petite »
    // (seuil de référence usuel des allègements). Pour « grande », on prend la plus haute.
    const refSeuils =
      ref.categories.find((c) => c.cle === categorie)?.seuils ??
      ref.categories[ref.categories.length - 1].seuils;

    const criteres: CritereEvaluation[] = [
      { critere: 'bilan', valeur: bilan, seuil: refSeuils.bilanMax, depasse: refSeuils.bilanMax !== null && bilan > refSeuils.bilanMax },
      { critere: 'ca', valeur: ca, seuil: refSeuils.caMax, depasse: refSeuils.caMax !== null && ca > refSeuils.caMax },
      { critere: 'effectif', valeur: effectif, seuil: refSeuils.effectifMax, depasse: refSeuils.effectifMax !== null && effectif > refSeuils.effectifMax },
    ];

    const result: ResultatClassification = {
      pays,
      categorie,
      libelleCategorie: LIBELLES[categorie],
      criteres,
      regle: 'Une catégorie est retenue si au plus 1 des 3 critères (bilan, CA, effectif) est dépassé.',
    };

    if (input.bilanPrecedent !== undefined && input.caPrecedent !== undefined && input.effectifPrecedent !== undefined) {
      const categoriePrecedente = this.categorieBrute(pays, input.bilanPrecedent, input.caPrecedent, input.effectifPrecedent);
      const stable = categoriePrecedente === categorie;
      result.persistance = {
        categoriePrecedente,
        // Un changement de catégorie n'est juridiquement effectif que s'il est
        // constaté sur 2 exercices consécutifs. S'il diffère de N-1, il n'est
        // donc pas encore confirmé par ce seul exercice.
        changementConfirme: false,
        note: stable
          ? `Catégorie stable sur les deux exercices (${LIBELLES[categorie]}).`
          : `Catégorie différente de l'exercice précédent (${LIBELLES[categoriePrecedente]} → ${LIBELLES[categorie]}). Le changement ne devient effectif que s'il est confirmé sur 2 exercices consécutifs (règle des « deux années »).`,
      };
    }

    return result;
  }

  // ─── 2. TVA ────────────────────────────────────────────────────────────────

  calculerTva(input: { pays: Pays; montantHT: number; taux?: number }) {
    const ref = this.ref(input.pays);
    const taux = input.taux ?? ref.tva.normal;
    const montantTva = Math.round(input.montantHT * taux) / 100;
    const montantTTC = Math.round((input.montantHT + montantTva) * 100) / 100;
    return {
      pays: input.pays,
      montantHT: input.montantHT,
      taux,
      tauxParDefaut: input.taux === undefined,
      montantTva: Math.round(montantTva * 100) / 100,
      montantTTC,
      tauxDisponibles: ref.tva,
    };
  }

  eligibiliteFranchise(input: { pays: Pays; ca: number; typeActivite?: 'VENTE' | 'SERVICES' }) {
    const ref = this.ref(input.pays);
    const tva = ref.tva;

    let seuil: number;
    let detail: string;

    if (input.pays === 'FR' && tva.franchiseFr) {
      const f = tva.franchiseFr;
      if (input.typeActivite === 'SERVICES') {
        seuil = f.servicesMax;
        detail = `Services / BNC : franchise jusqu'à ${f.servicesMax} € (seuil majoré ${f.servicesMajoreMax} €).`;
      } else {
        seuil = f.venteMax;
        detail = `Vente de marchandises : franchise jusqu'à ${f.venteMax} € (seuil majoré ${f.venteMajoreMax} €).`;
      }
    } else {
      seuil = tva.franchiseMax ?? 0;
      detail = `Franchise nationale jusqu'à ${seuil} € de CA HT.`;
    }

    return {
      pays: input.pays,
      ca: input.ca,
      seuil,
      eligible: input.ca <= seuil,
      detail,
      regimeUe: {
        ...FRANCHISE_UE,
        eligibleUe: input.ca <= FRANCHISE_UE.seuilCaUeMax,
      },
    };
  }

  // ─── 3. Audit légal ──────────────────────────────────────────────────────────

  determinerAudit(input: {
    pays: Pays;
    bilan: number;
    ca: number;
    effectif: number;
    auditToujoursObligatoire?: boolean;
  }) {
    const ref = this.ref(input.pays);
    const audit = ref.audit;

    if (input.auditToujoursObligatoire) {
      return {
        pays: input.pays,
        obligatoire: true,
        auditeur: audit.auditeur,
        raison: 'Audit toujours obligatoire (groupe consolidé, entité d’intérêt public ou société cotée).',
      };
    }

    if (audit.mode === 'CRITERES_DEDIES' && audit.criteres) {
      // France : 2 des 3 seuils CAC dédiés.
      const c = audit.criteres;
      let depasses = 0;
      const detail: string[] = [];
      if (input.bilan > c.bilan) { depasses++; detail.push(`bilan > ${c.bilan} €`); }
      if (input.ca > c.ca) { depasses++; detail.push(`CA > ${c.ca} €`); }
      if (input.effectif > c.effectif) { depasses++; detail.push(`effectif > ${c.effectif}`); }
      const obligatoire = depasses >= 2;
      return {
        pays: input.pays,
        obligatoire,
        auditeur: audit.auditeur,
        seuils: c,
        criteresDepasses: detail,
        raison: obligatoire
          ? `Au moins 2 des 3 seuils CAC dépassés (${detail.join(', ')}).`
          : 'Moins de 2 des 3 seuils CAC dépassés.',
      };
    }

    // LU / BE / DE : audit selon la catégorie de taille.
    const categorie = this.categorieBrute(input.pays, input.bilan, input.ca, input.effectif);
    const obligatoire = (audit.categoriesAuditees ?? []).includes(categorie);
    return {
      pays: input.pays,
      obligatoire,
      auditeur: audit.auditeur,
      categorie,
      categoriesAuditees: audit.categoriesAuditees,
      raison: obligatoire
        ? `Catégorie « ${LIBELLES[categorie]} » soumise à l'audit légal.`
        : `Catégorie « ${LIBELLES[categorie]} » dispensée d'audit légal.`,
    };
  }

  // ─── 4. Régime comptable ─────────────────────────────────────────────────────

  determinerRegime(input: {
    pays: Pays;
    typeEntite: TypeEntite;
    ca?: number;
    beneficeAnnuel?: number;
  }): {
    pays: Pays;
    typeEntite: TypeEntite;
    regime: RegimeComptable;
    partieDouble: boolean;
    raison: string;
  } {
    const ref = this.ref(input.pays);
    const ca = input.ca ?? 0;

    // Sociétés de capitaux : partie double systématique, quelle que soit la taille.
    if (input.typeEntite === 'SOCIETE_CAPITAUX') {
      return {
        pays: input.pays, typeEntite: input.typeEntite, regime: 'PARTIE_DOUBLE', partieDouble: true,
        raison: 'Société de capitaux : comptabilité en partie double obligatoire, quel que soit le CA.',
      };
    }

    // Associations : dépend de la taille (simplifié pour petites, partie double sinon) — défaut prudent.
    if (input.typeEntite === 'ASSOCIATION') {
      const grande = ref.categories[0] && ca > (ref.categories[0].seuils.caMax ?? 0);
      return {
        pays: input.pays, typeEntite: input.typeEntite,
        regime: grande ? 'PARTIE_DOUBLE' : 'SIMPLIFIEE', partieDouble: grande,
        raison: grande
          ? 'Grande association/ASBL : partie double (régime « moyenne/grande entreprise »).'
          : 'Petite association/ASBL : comptabilité simplifiée possible.',
      };
    }

    const allege = ref.regimeAllege;

    // Allemagne : test § 241a (CA ET bénéfice) pour les personnes physiques / commerçants.
    if (input.pays === 'DE') {
      if (input.typeEntite === 'PROFESSION_LIBERALE') {
        return { pays: input.pays, typeEntite: input.typeEntite, regime: 'EUR', partieDouble: false,
          raison: 'Freiberufler : Einnahmenüberschussrechnung (EÜR), pas de partie double.' };
      }
      const benef = input.beneficeAnnuel ?? 0;
      const sousSeuil = ca <= (allege.caMaxPersonnePhysique ?? 0) && benef <= (allege.beneficeMaxPersonnePhysique ?? 0);
      return {
        pays: input.pays, typeEntite: input.typeEntite,
        regime: sousSeuil ? 'EUR' : 'PARTIE_DOUBLE', partieDouble: !sousSeuil,
        raison: sousSeuil
          ? `Sous les seuils § 241a HGB (CA ≤ ${allege.caMaxPersonnePhysique} € et bénéfice ≤ ${allege.beneficeMaxPersonnePhysique} €) : EÜR.`
          : 'Au-delà des seuils § 241a HGB : comptabilité commerciale (partie double).',
      };
    }

    // France : profession libérale / personne physique au régime micro ou trésorerie.
    if (input.pays === 'FR') {
      if (input.typeEntite === 'PROFESSION_LIBERALE') {
        return { pays: input.pays, typeEntite: input.typeEntite, regime: 'TRESORERIE', partieDouble: false,
          raison: 'BNC (profession libérale) : comptabilité de trésorerie (encaissements/décaissements).' };
      }
      return { pays: input.pays, typeEntite: input.typeEntite, regime: 'MICRO', partieDouble: false,
        raison: 'Régime micro-fiscal : livre des recettes (et registre des achats pour la vente).' };
    }

    // LU / BE : seuil de CA pour personnes physiques et sociétés de personnes.
    const seuil = allege.caMaxPersonnePhysique ?? 0;
    const sousSeuil = ca <= seuil;
    return {
      pays: input.pays, typeEntite: input.typeEntite,
      regime: sousSeuil ? allege.regimeSousSeuil : 'PARTIE_DOUBLE', partieDouble: !sousSeuil,
      raison: sousSeuil
        ? `CA ≤ ${seuil} € : ${allege.regimeSousSeuil === 'SIMPLIFIEE' ? 'comptabilité simplifiée (3 journaux)' : 'comptabilité allégée'}.`
        : `CA > ${seuil} € : comptabilité en partie double obligatoire.`,
    };
  }

  // ─── 5. Obligations de dépôt ─────────────────────────────────────────────────

  obligationsDepot(input: {
    pays: Pays;
    categorie?: CategorieTaille;
    bilan?: number;
    ca?: number;
    effectif?: number;
  }) {
    const ref = this.ref(input.pays);
    let categorie = input.categorie;
    if (!categorie && input.bilan !== undefined && input.ca !== undefined && input.effectif !== undefined) {
      categorie = this.categorieBrute(input.pays, input.bilan, input.ca, input.effectif);
    }

    const schemaParCategorie: Record<CategorieTaille, string> = {
      micro: 'Bilan super-abrégé + compte de résultat abrégé ; annexe quasi supprimée.',
      petite: 'Bilan & compte de résultat abrégés + annexe abrégée.',
      moyenne: 'Schéma complet (aménagé) + annexe + rapport de gestion.',
      grande: 'Schéma complet + annexe complète + rapport de gestion + audit + consolidation si groupe.',
    };

    return {
      pays: input.pays,
      categorie: categorie ?? null,
      destinataire: ref.depot.destinataire,
      formatElectronique: ref.depot.formatElectronique,
      delai: ref.depot.delai,
      schema: categorie ? schemaParCategorie[categorie] : null,
    };
  }
}
