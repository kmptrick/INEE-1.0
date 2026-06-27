# Fiscalité comparée — France · Belgique · Luxembourg · Allemagne
## Synthèse transversale pour INEE2.0 (données 2025, nouveautés 2026)

> Document de référence consolidé. Les fiches détaillées par pays sont dans `01-france.md`, `02-belgique.md`, `03-luxembourg.md`, `04-allemagne.md`. Les données structurées exploitables par le code sont dans `/data/fiscalite/*.json`.
>
> ⚠️ **Avertissement général** : cette synthèse est un outil d'aide à la conception. Les chiffres sont issus de recherches sur sources officielles (impots.gouv.fr/BOFiP, SPF Finances, ACD Luxembourg, Bundesfinanzministerium) mais doivent être **verrouillés sur les textes officiels avant mise en production** d'un moteur de calcul. Plusieurs réformes 2026 sont en cours (voir section 7).

---

## 1. Vue d'ensemble — taux clés par pays

| Dimension | 🇫🇷 France | 🇧🇪 Belgique | 🇱🇺 Luxembourg | 🇩🇪 Allemagne |
|---|---|---|---|---|
| **IR — taux marginal max** | **45 %** (+ CEHR 3-4 %) | **50 %** (+ additionnels communaux ~7,9 %) | **42 %** (+ 7-9 % fonds emploi ≈ 45,78 %) | **45 %** (Reichensteuer) + Soli 5,5 % |
| **IR — tranche d'entrée** | 11 % dès 11 497 € | 25 % dès le 1ᵉʳ € | 8 % dès 13 230 € | 14 % dès 12 097 € (progressif continu) |
| **Type de barème** | 5 tranches plates | 4 tranches plates | 23 tranches plates | **formule progressive continue** |
| **IS — taux global société de capitaux** | 25 % (15 % réduit) | 25 % (20 % réduit PME) | **≈ 23,87 %** (IRC 16 % + 7 % + ICC) | **≈ 30 %** (KSt 15 % + Soli + GewSt) |
| **Capital mobilier (flat tax)** | **30 %** → 31,4 % (2026) | Pr.M **30 %** | Retenue **15 %** + exonération 50 % | **Abgeltungsteuer 25 %** + Soli |
| **TVA — taux normal** | **20 %** | **21 %** | **17 %** (le plus bas UE) | **19 %** |
| **TVA — taux réduits** | 10 / 5,5 / 2,1 % | 12 / 6 / 0 % | 14 / 8 / 3 % | 7 % |
| **Franchise TVA** | 85 000 / 37 500 € | 25 000 € | 50 000 € | 25 000 / 100 000 € |
| **Impôt sur la fortune** | **IFI** (immobilier ≥ 1,3 M€) | Non (taxe comptes-titres supprimée ; nouvelle taxe PV 2026) | Non (PP) / **Oui (sociétés)** | **Non** (suspendu depuis 1997) |
| **Cotisations sociales salarié** | variables (~22 %) | **13,07 %** (sans plafond) | ~12,45 % | ~20 % (plafonné) |

---

## 2. Personnes physiques (salariés) — points distinctifs

- **France** : barème par parts (**quotient familial**), décote, PAS (prélèvement à la source). Prélèvements sociaux du capital **17,2 % → 18,6 %** en 2026.
- **Belgique** : **quotité exemptée** (10 910 €), **additionnels communaux** (% de l'impôt, variable par commune), cotisation ONSS **13,07 % sans plafond**.
- **Luxembourg** : **3 classes d'impôt** (1, 1a, 2 avec splitting), surtaxe **fonds pour l'emploi 7/9 %**, nombreux **crédits d'impôt** (CIS, CIM, CIP).
- **Allemagne** : **formule progressive continue** (pas de tranches plates), **6 Steuerklassen**, **Ehegattensplitting** (splitting conjugal), **Soli** résiduel + **Kirchensteuer** 8/9 % optionnel.

> **Implication INEE2.0** : prévoir 4 moteurs de calcul IR distincts. L'Allemagne nécessite l'implémentation des **formules polynomiales du §32a EStG** (pas une simple table de tranches). La France nécessite la logique du quotient familial + plafonnement + décote. Le Luxembourg nécessite la sélection de classe + splitting. La Belgique nécessite l'ajout des additionnels communaux paramétrables par commune.

---

## 3. Fiscalité du capital (dividendes, plus-values, épargne)

| | 🇫🇷 France | 🇧🇪 Belgique | 🇱🇺 Luxembourg | 🇩🇪 Allemagne |
|---|---|---|---|---|
| **Dividendes** | PFU 30 % (→31,4 %) ou barème + abatt. 40 % | Pr.M 30 % (VVPRbis 15→18 %) | Retenue 15 % + **exonération 50 %** | Abgeltungsteuer 25 % + Soli (+ Kirchensteuer) |
| **Plus-values mobilières** | PFU 30 % (→31,4 %) | **Nouvelle taxe 10 %** dès 2026 (exonération 10 000 €/an) | Demi-taux si >10 % & >6 mois ; sinon exonéré (privé) | Abgeltungsteuer 25 % ; abatt. 1 000 €/2 000 € |
| **Plus-values immobilières** | 19 % + 17,2 %, exonération 22/30 ans | Régional (droits d'enregistrement) | Demi-taux ; résidence principale exonérée | **Exonérée après 10 ans** ou résidence principale |
| **Abattement épargne** | — | Épargne réglementée 1 050 € ; dividendes 833 € | — | Sparer-Pauschbetrag 1 000 € / 2 000 € |

---

## 4. Indépendants — comparatif des régimes

| | 🇫🇷 France | 🇧🇪 Belgique | 🇱🇺 Luxembourg | 🇩🇪 Allemagne |
|---|---|---|---|---|
| **Régime simplifié** | Micro-entrepreneur (CA 188 700 / 77 700 €) | Statut indépendant (titre principal/complémentaire) | Régime des indépendants | Kleinunternehmer (TVA) ; EÜR |
| **Cotisations sociales** | TNS/SSI (assiette unique 2025) | INASTI **20,5 %** puis 14,16 % (min ~906 €/trim.) | CCSS : pension 16 % + maladie ~6,1 % + dépendance 1,4 % | Facultatif sauf exceptions ; GKV ~14,6 %+ ; Rente 18,6 % |
| **Distinction clé** | activité vente / service / libéral | titre principal / complémentaire | — | **Freiberufler** (pas de Gewerbesteuer) vs **Gewerbetreibende** |
| **Cotisations sur CA ?** | Oui (micro-social) | Non (sur revenu net) | Non (sur revenu pro) | Non |

> **Spécificité allemande majeure** : la distinction **Freiberufler vs Gewerbetreibende** détermine l'assujettissement à la **Gewerbesteuer** — point central à modéliser.

---

## 5. Sociétés — imposition par forme juridique

| Pays | Sociétés de **capitaux** (IS) | Sociétés de **personnes** (transparence/IR) |
|---|---|---|
| 🇫🇷 France | SARL, EURL (option), SAS, SASU, SA → **IS 25 %/15 %** | SNC, SCI (défaut IR), EURL (défaut IR) |
| 🇧🇪 Belgique | SRL/BV, SA/NV, SC → **ISOC 25 %/20 %** | SNC, SComm (selon configuration) |
| 🇱🇺 Luxembourg | SARL, SA, SAS → **IRC + ICC ≈ 23,87 %** | SCS, SCSp (transparentes) |
| 🇩🇪 Allemagne | GmbH, UG, AG → **KSt+Soli+GewSt ≈ 30 %** | GbR, OHG, KG, GmbH & Co. KG (transparentes) |

**Régimes mère-fille / participation** (exonération des dividendes intra-groupe) : présents dans les 4 pays.
- France : QPFC 5 % (1 % en intégration), participation ≥ 5 %.
- Belgique : RDT **100 %**, participation ≥ 10 % ou > 2,5 M€.
- Luxembourg : **Soparfi** — exonération totale, participation ≥ 10 % ou ≥ 1,2 M€ (dividendes) / ≥ 6 M€ (plus-values).
- Allemagne : exonération ~95 % (5 % réintégré).

**Arbitrage rémunération vs dividendes** : déterminant dans les 4 pays.
- France : gérant majoritaire (TNS) cotise sur dividendes > 10 % du capital ; président SAS non.
- Belgique : rémunération minimale dirigeant **45 000 € (→ 50 000 €)** conditionne le taux réduit ISOC.
- Allemagne : salaire du gérant déductible mais risque de **vGA** (distribution dissimulée) si excessif.
- Luxembourg : dividendes exonérés à 50 % chez le bénéficiaire.

---

## 6. Capital minimal des sociétés (repère création)

| Forme | Capital minimal |
|---|---|
| 🇫🇷 SARL/SAS/EURL/SASU | **1 €** (libre) ; SA : **37 000 €** |
| 🇧🇪 SRL/BV | **pas de minimum** (plan financier) ; SA/NV : **61 500 €** |
| 🇱🇺 SARL | **12 000 €** ; SA : **30 000 €** ; SCSp : aucun |
| 🇩🇪 UG : **1 €** ; GmbH : **25 000 €** ; AG : **50 000 €** | |

---

## 7. Réformes 2026 à surveiller (paramétrage par date d'effet)

- **🇫🇷 France** : prélèvements sociaux du capital **17,2 % → 18,6 %** (PFU 30 % → 31,4 %) au 1.1.2026 ; PLF 2026 (seuil IS 15 % à 100 k€, franchise TVA 25 k€, CVAE) = **projets**.
- **🇧🇪 Belgique** : **nouvelle taxe sur les plus-values 10 %** (1.1.2026) ; VVPRbis/réserve de liquidation **15 % → 18 %** ; rémunération min. dirigeant **→ 50 000 €** ; réforme succession **wallonne 2028** et **flamande 2026**.
- **🇱🇺 Luxembourg** : IRC déjà baissé (17 % → 16 %) au 1.1.2025 ; indexation barème +2,5 % attendue ; adaptation automatique du barème dès 2028.
- **🇩🇪 Allemagne** : barème indexé 2026 (Grundfreibetrag 12 348 €) ; IS abaissé progressivement **à partir de 2028**.

---

## 8. Conformité — échéances déclaratives (repères)

| | IR/IPP particuliers | IS/sociétés | TVA |
|---|---|---|---|
| 🇫🇷 | Mai-juin (par zones) | Acomptes 15/03-06-09-12 ; solde 2572 le 15 mai | CA3 mensuelle / CA12 annuelle |
| 🇧🇪 | Tax-on-web (juin-oct.) | Biztax, 7 mois après clôture | Intervat, le 20/25 du mois |
| 🇱🇺 | 31 décembre N+1 | 31 mai (eCDF) ; comptes RCS 7 mois | eCDF mensuel/trimestriel/annuel selon CA |
| 🇩🇪 | 31 juillet N+1 (ELSTER) | ELSTER | Voranmeldung le 10 ; mensuel/trim./annuel |

---

## 9. Recommandations d'architecture pour INEE2.0

1. **Données externalisées et versionnées par année fiscale** : tous les barèmes/seuils/taux dans `/data/fiscalite/*.json`, indexés par `pays` + `annee`, pour gérer l'indexation annuelle et les réformes par date d'effet.
2. **Variables communales/régionales** : ICC luxembourgeois, Gewerbesteuer-Hebesatz allemand, additionnels communaux belges, et droits de succession régionaux belges → tables paramétrables, pas de valeurs en dur.
3. **Moteur IR par pays** : l'Allemagne utilise des **formules polynomiales** (§32a), les 3 autres des **tables de tranches**. Le quotient familial (FR), le splitting (LU/DE) et les additionnels (BE) doivent être des modules dédiés.
4. **Distinguer assiette sociale et assiette fiscale** : les cotisations sociales (indépendants surtout) ont des assiettes, planchers et plafonds propres, différents de l'assiette de l'impôt.
5. **Signaler le statut « projet de loi »** des mesures 2026 non promulguées dans l'UI (transparence pédagogique).
6. **Couche « sources »** : conserver, pour chaque valeur, l'URL officielle et l'année de référence (déjà présent dans les JSON) pour traçabilité et mises à jour.

---

*Fiches établies à partir de recherches multi-sources (WebSearch sur sources officielles gouvernementales prioritaires). Voir chaque fiche pays pour les sources détaillées et les points de vigilance spécifiques.*
