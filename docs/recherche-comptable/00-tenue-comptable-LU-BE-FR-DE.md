# Tenue comptable comparée — Luxembourg · Belgique · France · Allemagne

> Étude approfondie destinée à la spécification de l'application **INEE 2.0**.
> Couverture : tous types d'entités (indépendants / personnes physiques, petites
> sociétés, grandes sociétés et groupes, associations) sur 4 dimensions :
> **obligations & seuils**, **plans comptables & écritures**, **TVA**, **reporting & dépôt**.
>
> **Situation : 2025‑2026.** Tous les montants chiffrés intègrent les relèvements de seuils
> de 2024 (transposition de la directive déléguée UE 2023/2775 du 17 octobre 2023, qui a
> rehaussé d'environ 25 % les seuils de taille comptables dans toute l'UE).
>
> ⚠️ **Avertissement.** Ce document est une synthèse documentaire à visée de cadrage produit.
> Il ne constitue pas un conseil juridique ou fiscal. Avant mise en production, chaque seuil
> et taux doit être reconfirmé sur la source officielle citée (les valeurs fiscales,
> notamment les taux de TVA et seuils de franchise, évoluent en loi de finances annuelle).

---

## Sommaire

1. [Vue d'ensemble & cadre légal par pays](#1-vue-densemble--cadre-légal-par-pays)
2. [Dimension 1 — Obligations & seuils de taille](#2-dimension-1--obligations--seuils-de-taille)
3. [Dimension 2 — Plans comptables & écritures](#3-dimension-2--plans-comptables--écritures)
4. [Dimension 3 — TVA & déclarations](#4-dimension-3--tva--déclarations)
5. [Dimension 4 — Reporting & dépôt des comptes](#5-dimension-4--reporting--dépôt-des-comptes)
6. [Traitement par type d'entité](#6-traitement-par-type-dentité)
7. [Implications pour INEE 2.0](#7-implications-pour-inee-20)
8. [Sources](#8-sources)

Les données chiffrées de ce rapport sont également fournies sous forme exploitable par
machine dans les fichiers du même dossier :
`seuils-taille.json`, `taux-tva.json`, `plans-comptables.json`, `audit-depot.json`.

---

## 1. Vue d'ensemble & cadre légal par pays

| Pays | Texte comptable de base | Régulateur / normalisateur | Registre de dépôt |
|------|-------------------------|----------------------------|-------------------|
| **Luxembourg** | Loi modifiée du **19 décembre 2002** (registre de commerce + comptabilité et comptes annuels) ; Plan Comptable Normalisé fixé par règlement grand‑ducal du **12 septembre 2019** | Commission des Normes Comptables (**CNC.lu**) ; CSSF pour entités surveillées | **RCS** Luxembourg, via plateforme **eCDF** (collecte standardisée) ; publication au **RESA** |
| **Belgique** | **Code de droit économique (CDE/CDE)**, Livre III ; **Code des sociétés et des associations (CSA)** ; A.R. du **21 octobre 2018** (PCMN) | Commission des Normes Comptables (**CNC/CBN**) ; IRE/IBR pour l'audit | **Banque Nationale de Belgique (BNB)** — Centrale des bilans ; greffe pour micro‑entités sans personnalité morale |
| **France** | **Code de commerce** (art. L.123‑12 s.) ; **Plan Comptable Général** (règlement ANC 2014‑03, refondu par le **règlement ANC 2022‑06 applicable au 1er janvier 2025**) | Autorité des Normes Comptables (**ANC**) ; CNCC/H3C pour l'audit | **Guichet unique INPI** → **RNE** + greffes des tribunaux de commerce |
| **Allemagne** | **Handelsgesetzbuch (HGB)**, §§ 238 et s. ; fiscal : Abgabenordnung (AO) §§ 140‑141 | DRSC ; IDW pour l'audit | **Bundesanzeiger** (transmission) → publication au **Unternehmensregister** |

**Principe commun (cadre UE).** Les quatre pays appliquent la même architecture
directive‑comptable : une entreprise est classée **micro / petite / moyenne / grande** selon
qu'elle dépasse ou non **2 des 3 critères** (total bilan, chiffre d'affaires net, effectif),
appréciés en principe sur **2 exercices consécutifs**. La catégorie conditionne ensuite
le schéma de comptes à publier et l'obligation d'audit. Les montants diffèrent toutefois
d'un pays à l'autre (la directive fixe des fourchettes, chaque État choisit dans la fourchette).

---

## 2. Dimension 1 — Obligations & seuils de taille

### 2.1 Qui doit tenir une comptabilité, et laquelle ?

| Pays | Comptabilité simplifiée / de trésorerie possible | Comptabilité complète (partie double) obligatoire |
|------|--------------------------------------------------|---------------------------------------------------|
| **LU** | Commerçants personnes physiques et sociétés de personnes (SENC, SCS) dont le **CA HT < 100 000 €** : dispensés du PCN ; comptabilité allégée. | Toutes les sociétés de capitaux ; au‑delà de 100 000 € de CA pour les personnes physiques/sociétés de personnes. |
| **BE** | Personnes physiques (indépendants), sociétés simples, SNC et SCS dont le **CA HT ≤ 500 000 €** (porté à **620 000 €** pour le commerce de carburants) : comptabilité **simplifiée** (3 journaux — financier, achats, ventes), art. III.85 CDE. | Au‑delà du seuil ; **toujours** pour SRL/BV, SA/NV, coopératives, quel que soit le CA. |
| **FR** | **Régime micro** (micro‑BIC / micro‑BNC) : pas de comptabilité commerciale, simple **livre des recettes** (+ registre des achats pour les activités de vente). BNC au régime de la déclaration contrôlée : comptabilité de **trésorerie** (encaissements/décaissements). | Commerçants et sociétés au réel : comptabilité d'**engagement** en partie double (livre‑journal, grand‑livre, inventaire). |
| **DE** | **Einzelkaufleute** sous les seuils du **§ 241a HGB** (≤ **800 000 € de CA** ET ≤ **80 000 € de bénéfice annuel**, sur 2 exercices) : dispensés de comptabilité commerciale → **EÜR** (Einnahmenüberschussrechnung, recettes‑dépenses, § 4 al. 3 EStG). Professions libérales (Freiberufler) : EÜR quel que soit le montant. | Tout **Kaufmann** au‑delà des seuils ; **toutes** les sociétés de capitaux (GmbH, UG, AG) par leur forme. |

> **Règle mémo.** Forme sociale « de capitaux » (SARL/Sàrl/SRL/GmbH, SA/NV/AG…) ⇒ partie double
> **systématique**, indépendamment du chiffre d'affaires. Le seuil n'allège la tenue **que** pour
> les personnes physiques et certaines sociétés de personnes.

### 2.2 Seuils de taille des sociétés (2024‑2026) — exprimés « 2 des 3 critères »

Critères : **Bilan** (total) · **CA** (net HT) · **Effectif** (moyen annuel).

#### Luxembourg (art. 35 / 47 LRCS — règlement grand‑ducal du 25 octobre 2024)
| Catégorie | Bilan ≤ | CA net ≤ | Effectif ≤ |
|-----------|---------|----------|------------|
| Micro (art. 35bis) | 450 000 € | 900 000 € | 10 |
| **Petite** (art. 35) | **7 500 000 €** | **15 000 000 €** | **50** |
| **Moyenne** (art. 47) | **25 000 000 €** | **50 000 000 €** | **250** |
| Grande | > seuils moyenne | > seuils moyenne | > 250 |

#### Belgique (art. 1:24 / 1:25 CSA — relèvement applicable aux exercices ouverts dès le 1er janvier 2024)
| Catégorie | Bilan ≤ | CA net ≤ | Effectif ≤ |
|-----------|---------|----------|------------|
| **Micro** (art. 1:25) | **450 000 €** | **900 000 €** | **10** |
| **Petite** (art. 1:24) | **6 000 000 €** | **11 250 000 €** | **50** |
| Grande | > seuils petite | > seuils petite | > 50 |

> ⚠️ La Belgique n'a **pas** de catégorie « moyenne » au sens du CSA : on distingue
> **micro**, **petite**, **grande**. L'effectif (50 / 10) **n'a pas été relevé** en 2024 ;
> seuls les montants l'ont été. La micro‑société ne doit être ni mère ni filiale.

#### France (Code de commerce, art. D.230‑1 — décret n° 2024‑152 du 28 février 2024)
| Catégorie | Bilan ≤ | CA net ≤ | Effectif ≤ |
|-----------|---------|----------|------------|
| **Micro** | **450 000 €** | **900 000 €** | **10** |
| **Petite** | **7 500 000 €** | **15 000 000 €** | **50** |
| **Moyenne** | **25 000 000 €** | **50 000 000 €** | **250** |
| Grande | > seuils moyenne | > seuils moyenne | > 250 |

> Ces seuils « catégorie d'entreprise » (présentation des comptes, allègements de reporting,
> CSRD) sont distincts du **régime micro‑fiscal** (auto‑entrepreneur, cf. §6.3) et des
> **seuils de commissariat aux comptes** (cf. §5.4).

#### Allemagne (§ 267 / § 267a HGB — relèvement en vigueur depuis le 17 avril 2024, exercices ouverts dès le 1er janvier 2024)
| Catégorie | Bilan ≤ | CA (Umsatzerlöse) ≤ | Effectif ≤ |
|-----------|---------|----------------------|------------|
| **Kleinst** / micro (§ 267a) | **450 000 €** | **900 000 €** | **10** |
| **Klein** / petite (§ 267 I) | **7 500 000 €** | **15 000 000 €** | **50** |
| **Mittelgroß** / moyenne (§ 267 II) | **25 000 000 €** | **50 000 000 €** | **250** |
| **Groß** / grande (§ 267 III) | > seuils moyenne | > seuils moyenne | > 250 |

> **Convergence forte.** LU, FR et DE ont retenu **les mêmes montants** (450k/900k/10 ;
> 7,5M/15M/50 ; 25M/50M/250). La Belgique diverge : pas de catégorie « moyenne » et seuil
> petit à **6M / 11,25M / 50**. C'est la principale particularité à modéliser dans INEE 2.0.

---

## 3. Dimension 2 — Plans comptables & écritures

### 3.1 Architecture des plans comptables nationaux

Les quatre plans reposent sur une **codification décimale par classes**, bilan d'abord puis
résultat. La logique de numérotation est identique : 1er chiffre = classe, 2 chiffres = rubrique,
3+ chiffres = compte/sous‑compte.

| Classe | **PCG (France)** | **PCMN (Belgique)** | **PCN (Luxembourg)** | **SKR 04 (Allemagne)** |
|:------:|------------------|---------------------|----------------------|------------------------|
| 1 | Capitaux (capitaux propres, provisions, emprunts) | Fonds propres, provisions, dettes > 1 an | Capitaux, provisions, dettes financières | *(Anlagevermögen — voir 0‑3)* |
| 2 | Immobilisations | Frais d'établissement, actifs immobilisés | Frais d'établissement & actif immobilisé | Anlage‑ & Umlaufvermögen |
| 3 | Stocks | Stocks et commandes en cours | Stocks | Capitaux propres / provisions |
| 4 | Tiers (clients, fournisseurs, État…) | Créances & dettes ≤ 1 an | Comptes de tiers | Produits (Umsatzerlöse) |
| 5 | Comptes financiers | Placements & valeurs disponibles | Comptes financiers | Achats / matières (Wareneinsatz) |
| 6 | Charges | **Charges** | Charges | Autres charges d'exploitation |
| 7 | Produits | **Produits** | Produits | *(suite charges/produits)* |
| 8 | Comptes spéciaux | *(non utilisée)* | Comptes de résultats / hors‑bilan | — |
| 9 | — | Droits & engagements hors bilan (facultatif) | — | Comptes de clôture & statistiques |

**Points clés par pays :**

- **France — PCG.** 8 classes (1‑5 bilan, 6‑7 résultat, 8 spéciaux). Trois systèmes de
  présentation : **abrégé**, **de base**, **développé**. **Réforme majeure ANC 2022‑06**
  obligatoire pour les **exercices ouverts à compter du 1er janvier 2025** : nouveau modèle
  de bilan/compte de résultat, renumérotation de certains comptes, suppression du compte 79
  « Transferts de charges » et de la catégorie des charges à répartir. ➜ **INEE 2.0 doit gérer
  un PCG « avant 2025 » et « depuis 2025 ».**
- **Belgique — PCMN.** 7 classes (1‑5 bilan, 6‑7 résultat ; classe 0 = droits & engagements
  hors bilan). Base légale : **A.R. du 21 octobre 2018** (exécution de l'art. III.84 CDE).
  « Minimum normalisé » = socle obligatoire et uniforme, extensible en sous‑comptes.
- **Luxembourg — PCN.** Structure officielle en classes 1 à 7/8 (1‑5 bilan, 6‑7 résultat),
  **directement alignée sur la collecte eCDF**. Obligatoire pour la plupart des sociétés ;
  **dispense** pour les personnes physiques commerçantes et SENC/SCS dont le CA HT < 100 000 €,
  les SCSp, et les entités sous surveillance CSSF / en IFRS.
- **Allemagne — pas de plan légal unique.** Le HGB impose une **structure de bilan et de
  compte de résultat** (§ 266, § 275) mais laisse le plan de comptes libre. En pratique,
  **standards DATEV** : **SKR 03** (orienté processus / cycle d'exploitation) et **SKR 04**
  (orienté structure du bilan, classes 0‑9). Les libellés sont identiques entre SKR 03 et 04 ;
  seules la **logique de classes et la numérotation** diffèrent. ➜ INEE 2.0 doit proposer
  **les deux référentiels au choix** pour l'Allemagne.

### 3.2 Livres comptables obligatoires (partie double)

| Pays | Livres obligatoires |
|------|---------------------|
| **FR** | **Livre‑journal**, **grand‑livre**, **livre d'inventaire** *(ce dernier n'est plus légalement obligatoire depuis 2016 mais l'inventaire annuel demeure)*. |
| **BE** | **Livre‑journal** (centralisateur) + journaux auxiliaires ; **livre d'inventaire**. En simplifié : journaux financier, achats, ventes. |
| **LU** | **Livre‑journal**, **grand‑livre**, **livre d'inventaire**. |
| **DE** | **Grundbuch** (journal) + **Hauptbuch** (grand‑livre) + **Nebenbücher** ; **Inventar** annuel. Principes **GoB / GoBD** (intégrité, traçabilité, archivage numérique). |

**Principe universel** : partie double (tout débit = un crédit), pièce justificative pour
chaque écriture, séquentialité et inaltérabilité (en France : exigence de **logiciel de caisse
/ comptabilité conforme**, anti‑fraude TVA ; en Allemagne : **GoBD**).

---

## 4. Dimension 3 — TVA & déclarations

### 4.1 Taux de TVA en vigueur (2025‑2026)

| Pays | Normal | Intermédiaire | Réduit | Super‑réduit |
|------|:------:|:-------------:|:------:|:------------:|
| **Luxembourg** | **17 %** | **14 %** | **8 %** | **3 %** |
| **Belgique** | **21 %** | **12 %** | **6 %** | 0 % (journaux, recyclage…) |
| **France** | **20 %** | **10 %** | **5,5 %** | **2,1 %** |
| **Allemagne** | **19 %** | — | **7 %** | — |

> Le Luxembourg a le taux normal le plus bas de l'UE (17 %). À surveiller : ajustements en lois
> de finances (ex. modifications belges annoncées pour 2026, réintroduction du taux 7 %
> restauration en Allemagne au 1er janvier 2026).

### 4.2 Franchise (petites entreprises) & régime UE

| Pays | Seuil national de franchise | Notes |
|------|-----------------------------|-------|
| **Luxembourg** | **50 000 €** (relevé de 35 000 €), tolérance +10 % | Sous le seuil : pas de TVA facturée, pas de déduction. |
| **Belgique** | **25 000 €** (toutes activités) | Régime optionnel ; déclaration **annuelle** si usage purement national. |
| **France** | **Vente** : 85 000 € · **Services / BNC** : 37 500 € (seuils majorés 93 500 € / 41 250 €) | Le projet de **seuil unique à 25 000 €** a été **suspendu** ; statu quo maintenu. |
| **Allemagne** | **Kleinunternehmer** : 25 000 € (année N‑1) / 100 000 € (année en cours), depuis 2025 | § 19 UStG révisé. |

**Régime de franchise transfrontalier UE (depuis le 1er janvier 2025).** Nouveau dispositif
« **SME / régime UE** » : une petite entreprise peut bénéficier de la franchise **dans d'autres
États membres** si son **CA annuel dans l'UE ≤ 100 000 €**. Déclaration trimestrielle spécifique
pour les utilisateurs du régime transfrontalier. ➜ **Donnée structurante pour INEE 2.0** si
l'appli vise des indépendants opérant sur plusieurs des 4 pays.

### 4.3 Périodicité des déclarations

| Pays | Mensuelle | Trimestrielle | Annuelle |
|------|-----------|---------------|----------|
| **France** | Réel **normal** (CA3) | Possible si TVA due < 4 000 €/an | Réel **simplifié** (**CA12**) avec 2 acomptes |
| **Belgique** | Par défaut / **CA > 2 500 000 €** | Option si CA ≤ 2 500 000 € (limites sectorielles) | Franchise nationale : **liste annuelle** |
| **Allemagne** | TVA N‑1 élevée (**Umsatzsteuer‑Voranmeldung**) | Régime intermédiaire | Petite TVA / Kleinunternehmer |
| **Luxembourg** | CA élevé | CA intermédiaire | CA faible (seuils fixés par l'AED à l'immatriculation) |

**Déclarations connexes** (les 4 pays, cadre UE) : **relevé/état récapitulatif
intracommunautaire** (livraisons de biens et prestations B2B), déclaration **Intrastat**
au‑delà de seuils statistiques, **OSS/IOSS** pour le e‑commerce. Numéro de **TVA
intracommunautaire** : `LU` + 8, `BE0` + 9 chiffres, `FR` + clé 2 car. + SIREN 9 chiffres,
`DE` + 9 chiffres.

---

## 5. Dimension 4 — Reporting & dépôt des comptes

### 5.1 États financiers selon la taille

| Taille | Composants à établir / publier |
|--------|--------------------------------|
| **Micro** | Bilan **super‑abrégé** + compte de résultat abrégé ; **annexe quasi supprimée** (quelques mentions en pied de bilan). Souvent dispense de publication intégrale. |
| **Petite** | Bilan & compte de résultat **abrégés** + **annexe abrégée**. Dispense de rapport de gestion (sauf exceptions). |
| **Moyenne** | Schéma **complet** (avec aménagements) + annexe + rapport de gestion. |
| **Grande** | Schéma **complet**, annexe complète, rapport de gestion, **audit obligatoire**, comptes consolidés si groupe. |

### 5.2 Où et comment déposer

| Pays | Destinataire | Format électronique |
|------|--------------|---------------------|
| **Luxembourg** | **RCS** (dépôt), publication **RESA** | **eCDF** — liasse structurée alignée sur le PCN |
| **Belgique** | **BNB — Centrale des bilans** | Dépôt **XBRL** (schémas micro/abrégé/complet), application *Sofista/Filing* |
| **France** | **Guichet unique INPI** → **RNE** + greffe | Télétransmission **EDI/EFI** ; possibilité de **confidentialité** du compte de résultat (petites) et des comptes (micro) |
| **Allemagne** | **Bundesanzeiger** (transmission) → **Unternehmensregister** (publication) | **E‑Bilanz** : transmission fiscale au format **XBRL** au Finanzamt (§ 5b EStG) |

### 5.3 Délais de dépôt

| Pays | Délai |
|------|-------|
| **Belgique** | Dans les **30 jours** suivant l'approbation par l'AG, et **au plus tard 7 mois** après la clôture. |
| **France** | AG d'approbation dans les **6 mois** de la clôture ; dépôt au greffe/INPI dans le **mois** suivant l'approbation (**2 mois** si dépôt en ligne). |
| **Luxembourg** | Dépôt au RCS dans les **7 mois** suivant la clôture (1 mois après l'approbation pour ASBL/fondations). |
| **Allemagne** | Dépôt au Bundesanzeiger dans les **12 mois** suivant la clôture (microsociétés : option de *Hinterlegung* au lieu de publication). |

### 5.4 Audit légal — seuils de déclenchement

| Pays | Auditeur | Seuil d'audit obligatoire |
|------|----------|---------------------------|
| **France** | Commissaire aux comptes (CAC) | Dépasser **2 des 3** : **CA 10 M€** · **Bilan 5 M€** · **50 salariés** (relevés de +25 % par décret 2024‑152). Filiales d'un groupe tenu de désigner un CAC : **5 M€ / 2,5 M€ / 25**. |
| **Belgique** | Commissaire (réviseur IRE) | Sociétés / ASBL **grandes** : dépasser **2 des 3** → **Bilan 6 M€** · **CA 11,25 M€** · **50 ETP**. Toujours obligatoire si groupe à comptes consolidés, EIP, ou petite société cotée. |
| **Luxembourg** | Réviseur d'entreprises agréé | **Moyennes et grandes** entreprises (art. 47 LRCS et au‑delà). Les petites (art. 35) en sont dispensées. |
| **Allemagne** | Wirtschaftsprüfer | **Mittelgroße + große** Kapitalgesellschaften (§ 316 HGB). Les **kleine** (§ 267 I) en sont dispensées. |

---

## 6. Traitement par type d'entité

### 6.1 Indépendants & personnes physiques
- **BE** : comptabilité simplifiée jusqu'à **500 000 €** de CA (3 journaux) ; au‑delà → partie double.
- **FR** : micro‑entrepreneur (livre des recettes) ; **déclaration contrôlée** BNC en comptabilité de trésorerie ; BIC réel en partie double.
- **LU** : commerçant personne physique dispensé du PCN si **CA < 100 000 €**.
- **DE** : **EÜR** si Einzelkaufmann sous § 241a (**800 000 € / 80 000 €**) ou Freiberufler ; sinon Bilanzierung.

### 6.2 Petites sociétés (Sàrl/SRL/SARL/GmbH)
Partie double **systématique** (forme de capitaux). Bénéficient des **schémas abrégés** de
dépôt et de la **dispense d'audit** tant qu'elles restent « petites/micro » selon les seuils du §2.2.

### 6.3 Grandes sociétés & groupes
Schéma complet, **audit obligatoire**, **comptes consolidés** au‑delà des seuils de groupe
(seuils consolidés majorés, généralement « base brute » ≈ +20 % vs base nette). Reporting
durabilité (CSRD) selon calendrier UE et catégorie.

### 6.4 Associations / sans but lucratif
| Pays | Régime |
|------|--------|
| **BE — ASBL** | **Petite** : comptabilité simplifiée possible ; dépôt au **greffe**. **Grande/très grande** (2 des critères : ~5 ETP, ~334 500 € de produits, total bilan) : partie double + dépôt **BNB** + **commissaire**. |
| **LU — ASBL/fondations** | **Loi du 7 août 2023** (en vigueur 23/09/2023) : 3 catégories. **Petite** (< 3 ETP, < 50 000 € de recettes, < 100 000 € d'actif) : comptabilité simplifiée. **Grande** & fondations : partie double, régime « moyenne entreprise » (art. 47), **audit obligatoire**, dépôt RCS sous 1 mois / publication sous 7 mois. Période transitoire de 24 mois. |
| **FR — associations** | Pas d'obligation comptable générale, **sauf** : activité économique, subventions > 153 000 €, agrément, émission de titres… → plan comptable des associations (**règlement ANC 2018‑06**) + **CAC** si seuils (notamment subventions ≥ 153 000 €). |
| **DE — Verein** | Comptabilité de caisse pour petits *Vereine* ; *gemeinnützige* soumis aux exigences fiscales (justificatif d'emploi des fonds). |

---

## 7. Implications pour INEE 2.0

Recommandations de conception issues de l'étude :

1. **Modèle « pays × forme juridique × taille »** comme clé de configuration. La taille se
   recalcule chaque exercice via la règle « 2 des 3 critères sur 2 exercices », à automatiser.
2. **Référentiel de plans comptables paramétrable** : PCG (versions **< 2025** et **≥ 2025**),
   PCMN, PCN (aligné eCDF), et **SKR 03 / SKR 04** au choix pour l'Allemagne. Stocker chaque
   compte avec `classe`, `code`, `libellé`, `type` (actif/passif/charge/produit), `pays`, `version`.
3. **Moteur de seuils versionné dans le temps** (les montants changent par décret/loi). Voir
   `seuils-taille.json` et `audit-depot.json` : chaque valeur porte une date d'effet.
4. **Module TVA multi‑pays** : taux (`taux-tva.json`), franchise nationale + **régime UE 100 000 €**,
   périodicité dérivée du CA, génération du relevé intracommunautaire et gestion OSS/IOSS.
5. **Générateur de liasses de dépôt** par format cible : **eCDF** (LU), **XBRL BNB** (BE),
   **EDI/EFI INPI** (FR), **E‑Bilanz XBRL** (DE) — chacun avec ses schémas micro/abrégé/complet.
6. **Calendrier des échéances** (dépôt, AG, déclarations TVA, acomptes) paramétré par pays et
   par date de clôture, avec rappels.
7. **Garde‑fous de conformité** : inaltérabilité des écritures, piste d'audit, archivage
   (**GoBD** en Allemagne, **FEC** en France), numérotation séquentielle.
8. **Cas « simplifié »** à modéliser à part : comptabilité de trésorerie (FR BNC, DE EÜR),
   3 journaux (BE), livre des recettes (FR micro) — ce ne sont pas de la partie double.

---

## 8. Sources

Sources officielles et professionnelles consultées (situation 2025‑2026) :

**Luxembourg** — CNC Luxembourg (rehaussement des critères art. 35/47 LRCS) ; CSSF
(règlement grand‑ducal du 25 octobre 2024) ; Guichet.lu (plan comptable, dépôt des comptes) ;
eCDF (collecte standardisée) ; Loi du 7 août 2023 (ASBL/fondations, Legilux) ; PwC Luxembourg.

**Belgique** — CNC/CBN (avis critères de taille art. 1:24/1:25, PCMN) ; Banque Nationale de
Belgique — Centrale des bilans (critères, délais de dépôt) ; IRE/IBR (seuils d'audit) ;
SPF Justice & SPF Finances (ASBL, franchise TVA) ; ITAA.

**France** — service-public.fr / entreprendre (franchise TVA, micro‑entreprise, seuils de
catégorie) ; impots.gouv.fr (régimes TVA) ; INPI (dépôt des comptes) ; décret n° 2024‑152 du
28 février 2024 (ANSA, Infogreffe, Deloitte) ; ANC (règlement 2022‑06, PCG 2025) ; CNCC
(seuils CAC, septembre 2025).

**Allemagne** — gesetze-im-internet.de (§§ 241a, 267, 267a HGB) ; IHK München & DRSC
(relèvement des seuils 2024) ; DATEV (SKR 03 / SKR 04) ; Bundesanzeiger / Unternehmensregister.

**Transversal** — Directive déléguée UE 2023/2775 ; Your Europe (Commission européenne, taux
de TVA) ; Eurofiscalis / Mathez Compliance (tableaux de taux).

> ⚠️ Les URL précises ayant servi à cette synthèse sont listées dans le fichier `sources.md`
> du même dossier. **Reconfirmer chaque chiffre sur la source officielle avant intégration
> en production**, en particulier les taux de TVA et seuils de franchise (révision annuelle).
