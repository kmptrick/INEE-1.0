# Recherche — Tenue comptable LU / BE / FR / DE (pour INEE 2.0)

Étude comparative de la tenue comptable au **Luxembourg**, en **Belgique**, en **France** et
en **Allemagne**, couvrant tous les types d'entités (indépendants, personnes physiques, petites
et grandes sociétés, groupes, associations), destinée à la spécification d'INEE 2.0.

## Contenu du dossier

| Fichier | Description |
|---------|-------------|
| [`00-tenue-comptable-LU-BE-FR-DE.md`](./00-tenue-comptable-LU-BE-FR-DE.md) | **Rapport complet** — 4 dimensions, traitement par type d'entité, implications produit. |
| [`seuils-taille.json`](./seuils-taille.json) | Seuils de taille (micro/petite/moyenne/grande) par pays, avec dates d'effet. |
| [`taux-tva.json`](./taux-tva.json) | Taux de TVA, franchises, régime UE, périodicité des déclarations. |
| [`plans-comptables.json`](./plans-comptables.json) | Structure des plans comptables (PCG, PCMN, PCN, SKR03/04) et livres obligatoires. |
| [`audit-depot.json`](./audit-depot.json) | Seuils d'audit légal, destinataires et délais de dépôt. |
| [`sources.md`](./sources.md) | Liste des sources officielles consultées (URL). |

## Les 4 dimensions couvertes

1. **Obligations & seuils légaux** — qui doit tenir une compta, régime simplifié vs partie double, seuils de taille.
2. **Plans comptables & écritures** — structure des plans nationaux, numérotation, livres obligatoires.
3. **TVA & déclarations** — taux, franchises, périodicité, déclarations intracommunautaires.
4. **Reporting & dépôt** — états financiers par taille, registres, formats électroniques, audit.

## À retenir pour la conception

- Architecture UE commune (« 2 des 3 critères sur 2 exercices ») mais **montants divergents** :
  LU/FR/DE convergent (7,5M / 15M / 50 pour « petite ») ; **la Belgique diffère** (6M / 11,25M / 50,
  pas de catégorie « moyenne »).
- **Versionner les seuils et taux dans le temps** (révisions par décret / loi de finances).
- **Plans comptables paramétrables**, dont **PCG < 2025 vs ≥ 2025** (réforme ANC 2022‑06) et
  **SKR 03 vs SKR 04** au choix pour l'Allemagne.
- Modéliser à part les régimes **non‑partie‑double** : EÜR (DE), trésorerie BNC (FR),
  3 journaux (BE), livre des recettes (FR micro).

> ⚠️ Synthèse documentaire de cadrage, **pas un conseil juridique/fiscal**. Reconfirmer chaque
> chiffre sur la source officielle avant production (surtout TVA et franchises, révisées chaque année).

*Situation : 2025‑2026. Intègre les relèvements de seuils 2024 (directive déléguée UE 2023/2775).*
