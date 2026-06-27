import { ComptabiliteService } from './comptabilite.service';

describe('ComptabiliteService', () => {
  const svc = new ComptabiliteService();

  // ─── Classification de taille ──────────────────────────────────────────────
  describe('classifierTaille', () => {
    it('classe une grande société luxembourgeoise', () => {
      const r = svc.classifierTaille({ pays: 'LU', bilan: 30_000_000, ca: 60_000_000, effectif: 300 });
      expect(r.categorie).toBe('grande');
    });

    it('classe une micro-entreprise (1 seul critère dépassé toléré)', () => {
      // CA dépasse le seuil micro mais bilan et effectif non → reste micro (≤ 1 dépassement).
      const r = svc.classifierTaille({ pays: 'FR', bilan: 200_000, ca: 950_000, effectif: 5 });
      expect(r.categorie).toBe('micro');
    });

    it('bascule en petite quand 2 critères micro sont dépassés', () => {
      const r = svc.classifierTaille({ pays: 'FR', bilan: 600_000, ca: 1_200_000, effectif: 5 });
      expect(r.categorie).toBe('petite');
    });

    it('Belgique : pas de catégorie moyenne, passe de petite à grande', () => {
      const r = svc.classifierTaille({ pays: 'BE', bilan: 8_000_000, ca: 13_000_000, effectif: 60 });
      expect(r.categorie).toBe('grande');
    });

    it('signale la stabilité sur 2 exercices', () => {
      const r = svc.classifierTaille({
        pays: 'LU', bilan: 100_000, ca: 200_000, effectif: 3,
        bilanPrecedent: 90_000, caPrecedent: 180_000, effectifPrecedent: 3,
      });
      expect(r.categorie).toBe('micro');
      expect(r.persistance?.categoriePrecedente).toBe('micro');
      expect(r.persistance?.changementConfirme).toBe(false);
    });
  });

  // ─── TVA ───────────────────────────────────────────────────────────────────
  describe('calculerTva', () => {
    it('applique le taux normal LU (17%) par défaut', () => {
      const r = svc.calculerTva({ pays: 'LU', montantHT: 1000 });
      expect(r.taux).toBe(17);
      expect(r.montantTva).toBe(170);
      expect(r.montantTTC).toBe(1170);
    });

    it('applique le taux normal FR (20%)', () => {
      const r = svc.calculerTva({ pays: 'FR', montantHT: 250 });
      expect(r.taux).toBe(20);
      expect(r.montantTva).toBe(50);
      expect(r.montantTTC).toBe(300);
    });

    it('accepte un taux forcé', () => {
      const r = svc.calculerTva({ pays: 'BE', montantHT: 100, taux: 6 });
      expect(r.taux).toBe(6);
      expect(r.tauxParDefaut).toBe(false);
      expect(r.montantTTC).toBe(106);
    });
  });

  // ─── Franchise ───────────────────────────────────────────────────────────────
  describe('eligibiliteFranchise', () => {
    it('LU : éligible sous 50 000 €', () => {
      expect(svc.eligibiliteFranchise({ pays: 'LU', ca: 40_000 }).eligible).toBe(true);
      expect(svc.eligibiliteFranchise({ pays: 'LU', ca: 60_000 }).eligible).toBe(false);
    });

    it('FR : seuils différenciés vente / services', () => {
      expect(svc.eligibiliteFranchise({ pays: 'FR', ca: 80_000, typeActivite: 'VENTE' }).eligible).toBe(true);
      expect(svc.eligibiliteFranchise({ pays: 'FR', ca: 80_000, typeActivite: 'SERVICES' }).eligible).toBe(false);
    });

    it('signale l’éligibilité au régime UE (100 000 €)', () => {
      const r = svc.eligibiliteFranchise({ pays: 'BE', ca: 90_000 });
      expect(r.regimeUe.eligibleUe).toBe(true);
    });
  });

  // ─── Audit ───────────────────────────────────────────────────────────────────
  describe('determinerAudit', () => {
    it('France : audit obligatoire si 2 des 3 seuils CAC dépassés', () => {
      const r = svc.determinerAudit({ pays: 'FR', bilan: 6_000_000, ca: 11_000_000, effectif: 40 });
      expect(r.obligatoire).toBe(true);
    });

    it('France : pas d’audit si 1 seul seuil dépassé', () => {
      const r = svc.determinerAudit({ pays: 'FR', bilan: 6_000_000, ca: 8_000_000, effectif: 40 });
      expect(r.obligatoire).toBe(false);
    });

    it('Luxembourg : audit si moyenne/grande', () => {
      expect(svc.determinerAudit({ pays: 'LU', bilan: 10_000_000, ca: 20_000_000, effectif: 100 }).obligatoire).toBe(true);
      expect(svc.determinerAudit({ pays: 'LU', bilan: 1_000_000, ca: 2_000_000, effectif: 10 }).obligatoire).toBe(false);
    });

    it('Belgique : audit seulement si grande', () => {
      expect(svc.determinerAudit({ pays: 'BE', bilan: 1_000_000, ca: 2_000_000, effectif: 20 }).obligatoire).toBe(false);
      expect(svc.determinerAudit({ pays: 'BE', bilan: 8_000_000, ca: 13_000_000, effectif: 60 }).obligatoire).toBe(true);
    });

    it('audit toujours obligatoire (groupe consolidé)', () => {
      const r = svc.determinerAudit({ pays: 'DE', bilan: 100, ca: 100, effectif: 1, auditToujoursObligatoire: true });
      expect(r.obligatoire).toBe(true);
    });
  });

  // ─── Régime comptable ─────────────────────────────────────────────────────────
  describe('determinerRegime', () => {
    it('société de capitaux : partie double quel que soit le CA', () => {
      const r = svc.determinerRegime({ pays: 'LU', typeEntite: 'SOCIETE_CAPITAUX', ca: 1000 });
      expect(r.regime).toBe('PARTIE_DOUBLE');
      expect(r.partieDouble).toBe(true);
    });

    it('Belgique indépendant : simplifiée sous 500 000 €, partie double au-delà', () => {
      expect(svc.determinerRegime({ pays: 'BE', typeEntite: 'PERSONNE_PHYSIQUE', ca: 300_000 }).regime).toBe('SIMPLIFIEE');
      expect(svc.determinerRegime({ pays: 'BE', typeEntite: 'PERSONNE_PHYSIQUE', ca: 600_000 }).regime).toBe('PARTIE_DOUBLE');
    });

    it('Allemagne Einzelkaufmann : EÜR sous les seuils § 241a, sinon partie double', () => {
      expect(svc.determinerRegime({ pays: 'DE', typeEntite: 'PERSONNE_PHYSIQUE', ca: 500_000, beneficeAnnuel: 50_000 }).regime).toBe('EUR');
      expect(svc.determinerRegime({ pays: 'DE', typeEntite: 'PERSONNE_PHYSIQUE', ca: 900_000, beneficeAnnuel: 50_000 }).regime).toBe('PARTIE_DOUBLE');
    });

    it('France profession libérale : trésorerie', () => {
      expect(svc.determinerRegime({ pays: 'FR', typeEntite: 'PROFESSION_LIBERALE' }).regime).toBe('TRESORERIE');
    });

    it('Luxembourg personne physique : allégée sous 100 000 €', () => {
      expect(svc.determinerRegime({ pays: 'LU', typeEntite: 'PERSONNE_PHYSIQUE', ca: 50_000 }).regime).toBe('ALLEGEE');
      expect(svc.determinerRegime({ pays: 'LU', typeEntite: 'PERSONNE_PHYSIQUE', ca: 150_000 }).regime).toBe('PARTIE_DOUBLE');
    });
  });

  // ─── Dépôt ─────────────────────────────────────────────────────────────────────
  describe('obligationsDepot', () => {
    it('déduit la catégorie depuis les chiffres et renvoie le destinataire', () => {
      const r = svc.obligationsDepot({ pays: 'BE', bilan: 300_000, ca: 500_000, effectif: 4 });
      expect(r.categorie).toBe('micro');
      expect(r.destinataire).toContain('Banque Nationale');
      expect(r.schema).toBeTruthy();
    });
  });
});
