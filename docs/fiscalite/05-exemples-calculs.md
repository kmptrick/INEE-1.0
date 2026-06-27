# Exemples de calculs fiscaux — cas de test (fixtures) pour INEE2.0

> Cas concrets, **calculés pas à pas**, à utiliser comme **fixtures de validation** du moteur de calcul. Chaque cas : `Entrées → Étapes → Résultat attendu`.
>
> ⚠️ **Simplifications volontaires** : ces exemples isolent la mécanique principale de chaque impôt. Ils ignorent certains éléments secondaires (ex. prélèvement à la source FR, cotisation spéciale sécurité sociale BE, crédits d'impôt LU, abattements particuliers) sauf quand l'exemple les illustre explicitement. Les montants sont arrondis à l'euro. Données = barèmes 2025 des fichiers `/data/fiscalite/*.json`.

---

## 🇫🇷 FRANCE

### FR-1 — IR, célibataire, 1 part, revenu net imposable = 35 000 €
Barème par part :
| Tranche | Calcul | Impôt |
|---|---|---|
| 0 – 11 497 (0 %) | — | 0,00 |
| 11 497 – 29 315 (11 %) | 17 818 × 0,11 | 1 959,98 |
| 29 315 – 35 000 (30 %) | 5 685 × 0,30 | 1 705,50 |
| **Impôt brut** | | **3 665,48** |

Décote : applicable si impôt brut < 1 965 € (célibataire) → **non applicable** (3 665 > 1 965).
**➡️ Impôt dû ≈ 3 665 €** · taux moyen 10,5 % · taux marginal 30 %.

### FR-2 — IR, couple marié + 2 enfants (3 parts), revenu net imposable = 60 000 € *(quotient familial + plafonnement + décote)*
1. **Quotient** : 60 000 / 3 parts = 20 000 €/part.
2. Impôt/part : (20 000 − 11 497) × 0,11 = 935,33 → × 3 parts = **2 805,99 €**.
3. **Plafonnement** : recalcul à 2 parts (couple sans enfant) : quotient 30 000 €/part → impôt/part = 17 818×0,11 + 685×0,30 = 2 165,48 → ×2 = 4 330,96 €.
   - Avantage des enfants = 4 330,96 − 2 805,99 = 1 524,97 €.
   - Plafond = 2 demi-parts × 1 791 = 3 582 € → avantage (1 525) < plafond → **pas de plafonnement**.
4. **Décote** (couple, seuil 3 249) : impôt 2 806 < 3 249 → décote = 1 470 − 0,4525 × 2 806 = **200 €**.

**➡️ Impôt dû ≈ 2 806 − 200 = 2 606 €**.

### FR-3 — Dividendes 10 000 € au PFU
- 2025 : 10 000 × 30 % = **3 000 €** (1 280 IR + 1 720 PS) → net 7 000 €.
- 2026 : 10 000 × 31,4 % = **3 140 €** (hausse CSG capital).

### FR-4 — Micro-entrepreneur, prestations de services BIC, CA = 40 000 €
- Cotisations sociales URSSAF : 40 000 × 21,2 % = **8 480 €**.
- Option versement libératoire IR (1,7 %) : 40 000 × 1,7 % = **680 €**.
- *(Sans versement libératoire : bénéfice imposable = 40 000 × (1 − 50 %) = 20 000 € intégré au barème de l'IR du foyer.)*

### FR-5 — IS, société (conditions taux réduit réunies), bénéfice = 60 000 €
- 0 – 42 500 à 15 % = 6 375 € ; 42 500 – 60 000 (17 500) à 25 % = 4 375 €.
**➡️ IS dû = 10 750 €**.

---

## 🇧🇪 BELGIQUE

### BE-1 — IPP, isolé, revenu imposable = 40 000 €, additionnels communaux 8 %
| Tranche | Calcul | Impôt |
|---|---|---|
| 0 – 15 820 (25 %) | 15 820 × 0,25 | 3 955,00 |
| 15 820 – 27 920 (40 %) | 12 100 × 0,40 | 4 840,00 |
| 27 920 – 40 000 (45 %) | 12 080 × 0,45 | 5 436,00 |
| **Impôt barème brut** | | **14 231,00** |

1. **Quotité exemptée** : 10 910 € exonérés (au taux de base 25 %) → réduction 10 910 × 0,25 = **2 727,50 €**.
2. Impôt après quotité = 14 231,00 − 2 727,50 = **11 503,50 €**.
3. **Additionnels communaux** = 11 503,50 × 8 % = **920,28 €**.

**➡️ Impôt total ≈ 12 423 €** *(hors cotisation spéciale sécurité sociale et autres réductions)*.

### BE-2 — Cotisations sociales indépendant (titre principal), revenu net = 50 000 €
- Palier 1 (≤ 73 447,52 €) à 20,5 % : 50 000 × 20,5 % = **10 250 €/an** (≈ 2 562 €/trimestre) + frais de gestion caisse (~3,95 %).

### BE-3 — ISOC, SRL (conditions PME réunies), bénéfice = 80 000 €
- Taux réduit 20 % sur les premiers 100 000 € : 80 000 × 20 % = **16 000 €**.
- *(Condition clé : rémunération minimale du dirigeant 45 000 € — bientôt 50 000 €. Si non respectée → 25 % + cotisation distincte.)*

### BE-4 — Dividende d'une SRL via VVPRbis (après délai), montant brut 10 000 €
- Précompte mobilier réduit 15 % = **1 500 €** (vs 30 % = 3 000 € en régime général) → net 8 500 €.
- *(Réforme annoncée : 18 % → 1 800 €.)*

---

## 🇱🇺 LUXEMBOURG

### LU-1 — IRPP, classe 1, revenu imposable = 50 000 €
Somme des tranches (barème 2025) :

| Plage | Taux | Impôt |
|---|---|---|
| 13 230–15 435 | 8 % | 176,40 |
| 15 435–17 640 | 9 % | 198,45 |
| 17 640–19 845 | 10 % | 220,50 |
| 19 845–22 050 | 11 % | 242,55 |
| 22 050–24 255 | 12 % | 264,60 |
| 24 255–26 550 | 14 % | 321,30 |
| 26 550–28 845 | 16 % | 367,20 |
| 28 845–31 140 | 18 % | 413,10 |
| 31 140–33 435 | 20 % | 459,00 |
| 33 435–35 730 | 22 % | 504,90 |
| 35 730–38 025 | 24 % | 550,80 |
| 38 025–40 320 | 26 % | 596,70 |
| 40 320–42 615 | 28 % | 642,60 |
| 42 615–44 910 | 30 % | 688,50 |
| 44 910–47 205 | 32 % | 734,40 |
| 47 205–49 500 | 34 % | 780,30 |
| 49 500–50 000 | 36 % | 180,00 |
| **Impôt barème** | | **7 341,30** |

- **Contribution fonds pour l'emploi** 7 % = 7 341,30 × 0,07 = **513,89 €**.

**➡️ Impôt dû ≈ 7 855 €** *(avant crédit d'impôt salarié CIS, max 600 €/an)* · taux moyen ~15,7 %.

### LU-2 — IRPP, classe 2 (splitting), couple, revenu imposable = 100 000 €
1. **Splitting** : 100 000 / 2 = 50 000 € → impôt barème sur 50 000 = **7 341,30 €** (cf. LU-1) × 2 = **14 682,60 €**.
2. Fonds pour l'emploi 7 % = **1 027,78 €**.

**➡️ Impôt dû ≈ 15 710 €** (contre ~30 700 € si ce revenu était imposé en classe 1 → illustre l'effet du splitting).

### LU-3 — IRC + ICC, société à Luxembourg-Ville, bénéfice = 300 000 €
- IRC (taux normal 16 %, bénéfice > 200 000) : 300 000 × 16 % = 48 000 €.
- Fonds pour l'emploi 7 % de l'IRC = 3 360 €.
- ICC Luxembourg-Ville (3 % × 225 % = 6,75 %) = 300 000 × 6,75 % = 20 250 €.

**➡️ Charge totale = 71 610 € ≈ 23,87 %** du bénéfice (taux global agrégé Luxembourg-Ville 2025).

---

## 🇩🇪 ALLEMAGNE

### DE-1 — Einkommensteuer (formule §32a), célibataire, zvE = 50 000 € (2025)
- zvE = 50 000 € → **zone 3** (17 444 – 68 480).
- z = (50 000 − 17 443) / 10 000 = **3,2557**.
- ESt = (176,64 × z + 2 397) × z + 1 015,13
  = (176,64 × 3,2557 + 2 397) × 3,2557 + 1 015,13
  = (575,09 + 2 397) × 3,2557 + 1 015,13
  = 2 972,09 × 3,2557 + 1 015,13
  = 9 676,30 + 1 015,13 = **10 691 €** (arrondi à l'euro inférieur).
- Solidaritätszuschlag : 10 691 < Freigrenze 19 950 → **0 €**.

**➡️ Impôt dû = 10 691 €** · taux moyen 21,4 %.

### DE-2 — Ehegattensplitting, couple, zvE = 100 000 € (2025)
1. **Splitting** : 100 000 / 2 = 50 000 € → ESt = 10 691 € (cf. DE-1) × 2 = **21 382 €**.
2. Soli : 21 382 < Freigrenze couple 39 900 → **0 €**.

**➡️ Impôt dû = 21 382 €** (contre 31 088 € pour un célibataire sur 100 000 € : 0,42 × 100 000 − 10 911,92 → illustre le gain du splitting ≈ 9 700 €).

### DE-3 — Abgeltungsteuer, dividendes 10 000 € (célibataire, sans impôt d'église)
- Sparer-Pauschbetrag : 10 000 − 1 000 = **9 000 € imposables**.
- Abgeltungsteuer 25 % = 2 250 € ; Soli 5,5 % de 2 250 = 123,75 €.

**➡️ Impôt dû = 2 373,75 €** → net 7 626,25 €.

### DE-4 — GmbH, bénéfice = 100 000 €, Hebesatz communal = 400 %
- Körperschaftsteuer 15 % = 15 000 € ; Soli 5,5 % de 15 000 = 825 €.
- Gewerbesteuer = 100 000 × 3,5 % × 400 % = 100 000 × 0,035 × 4,0 = **14 000 €**.

**➡️ Charge totale = 29 825 € ≈ 29,83 %** (varie selon le Hebesatz : Munich 490 % → ~33 %).

---

## Tableau récapitulatif (oracle de test)

| Cas | Entrée principale | Résultat attendu |
|---|---|---|
| FR-1 | IR célib. 1 part, 35 000 € | ≈ 3 665 € |
| FR-2 | IR couple 3 parts, 60 000 € | ≈ 2 606 € |
| FR-3 | Dividendes 10 000 € PFU | 3 000 € (2025) / 3 140 € (2026) |
| FR-5 | IS réduit, bénéfice 60 000 € | 10 750 € |
| BE-1 | IPP isolé 40 000 € + 8 % comm. | ≈ 12 423 € |
| BE-3 | ISOC PME, bénéfice 80 000 € | 16 000 € |
| LU-1 | IRPP cl.1, 50 000 € | ≈ 7 855 € |
| LU-2 | IRPP cl.2 splitting, 100 000 € | ≈ 15 710 € |
| LU-3 | IRC+ICC Lux-Ville, 300 000 € | 71 610 € (23,87 %) |
| DE-1 | ESt célib. 50 000 € | 10 691 € |
| DE-2 | ESt splitting 100 000 € | 21 382 € |
| DE-3 | Abgeltungsteuer div. 10 000 € | 2 373,75 € |
| DE-4 | GmbH 100 000 €, Hebesatz 400 % | 29 825 € (29,83 %) |

> Ces valeurs servent d'**oracle** : un test unitaire qui réinjecte ces entrées dans le moteur doit retrouver ces montants (à l'arrondi près). En cas d'écart, vérifier d'abord l'année de barème, l'arrondi (l'Allemagne arrondit le zvE et l'impôt à l'euro inférieur) et la prise en compte des surtaxes (fonds emploi LU, additionnels BE, Soli DE).
