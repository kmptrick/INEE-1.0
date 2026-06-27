# FICHE DE RÉFÉRENCE FISCALE — ALLEMAGNE (2025, avec nouveautés 2026)

*Destinée à alimenter l'application INEE2.0 (calcul/simulation d'impôts). Toutes les valeurs sont sourcées. Sauf mention contraire, les chiffres sont ceux applicables au 1er janvier 2025.*

> **Avertissement de cohérence des sources** : sur le seuil de début du taux à 42 % en 2025, on rencontre deux valeurs voisines selon les sources : **68 430 €** (communiqué initial BMF de septembre 2024) et **68 480 €** (valeur définitive figurant dans la formule légale du §32a EStG / Lohnsteuer-Handbuch 2025). La valeur **68 480 €** est celle qui figure dans la formule légale officielle et doit être retenue pour le calcul. Idem pour 2026 : seuil à **69 878/69 879 €**.

---

## A) PERSONNES PHYSIQUES

### A.1 — Impôt sur le revenu (Einkommensteuer) — barème à formule §32a EStG

Le barème allemand n'est **pas un barème par tranches plates** : c'est un **tarif progressif à formule** (Formeltarif). Le taux marginal augmente de façon continue à l'intérieur des zones de progression. On distingue **5 zones**.

**Paramètres 2025** (zu versteuerndes Einkommen = zvE, revenu imposable) :

| Zone | Plage de revenu imposable (zvE) 2025 | Taux | Description |
|------|--------------------------------------|------|-------------|
| 1 — Exonérée (Grundfreibetrag) | **0 – 12 096 €** | 0 % | Minimum vital exonéré |
| 2 — 1ʳᵉ progression | **12 097 – 17 443 €** | marginal **14 % → ~24 %** | Progression rapide |
| 3 — 2ᵉ progression | **17 444 – 68 480 €** | marginal **~24 % → 42 %** | Progression plus lente |
| 4 — Proportionnelle (Spitzensteuersatz) | **68 481 – 277 825 €** | **42 %** (taux plat) | Taux supérieur |
| 5 — « Reichensteuer » | **à partir de 277 826 €** | **45 %** (taux plat) | Taux des très hauts revenus |

- **Grundfreibetrag 2025 = 12 096 €** (relèvement de +312 €) (BMF, *das-aendert-sich-2025* ; IHK München)
- Début du taux à 42 % en 2025 = **68 480 €** (formule légale §32a) / 68 430 € (communiqué BMF) (gesetze-im-internet.de §32a ; lsth.bundesfinanzministerium.de LStH 2025)
- Seuil « Reichensteuer » 45 % = **277 826 €** (inchangé depuis 2022, non indexé) (Finanztip ; t-online)

**Formules officielles du tarif 2025 (§32a EStG)** — l'impôt (ESt) en euros, arrondi à l'euro inférieur :
- zvE 12 097 – 17 443 € : `ESt = (932,30 · y + 1 400) · y` où **y = (zvE − 12 096) / 10 000**
- zvE 17 444 – 68 480 € : `ESt = (176,64 · z + 2 397) · z + 1 015,13` où **z = (zvE − 17 443) / 10 000**
- zvE 68 481 – 277 825 € : `ESt = 0,42 · zvE − 10 911,92`
- zvE ≥ 277 826 € : `ESt = 0,45 · zvE − 19 246,67`

(Source formules : gesetze-im-internet.de/estg/__32a.html ; lsth.bundesfinanzministerium.de LStH 2025 ; finanz-tools.de)

**Paramètres 2026** (loi *Steuerfortentwicklungsgesetz*, décalage des seuils d'env. +2,0 %) :

| Zone | Plage zvE 2026 | Taux |
|------|----------------|------|
| 1 | **0 – 12 348 €** | 0 % |
| 2 | 12 349 – 17 799 € | 14 % → ~24 % |
| 3 | 17 800 – 69 878 € | ~24 % → 42 % |
| 4 | **69 879 – 277 825 €** | 42 % |
| 5 | **≥ 277 826 €** | 45 % |

- **Grundfreibetrag 2026 = 12 348 €** (+252 €) (BMF *das-aendert-sich-2026* ; Ordio)
- Début 42 % 2026 = **69 879 €** (Finanztip ; IHK Bodensee-Oberschwaben)
- Seuil 45 % 2026 = **277 826 €** (inchangé) (anwalt.de)

### A.2 — Classes d'impôt (Steuerklassen I à VI)

Pour le prélèvement à la source du salaire (Lohnsteuer).

- **Classe I** : célibataires, divorcés, veufs (hors année de décès), mariés en séparation durable — sans enfant ouvrant droit à l'abattement parent isolé.
- **Classe II** : parents isolés (Alleinerziehende) — inclut l'abattement parent isolé (Entlastungsbetrag) de **4 260 €/an** pour le 1ᵉʳ enfant (2025 et 2026), +240 €/enfant supplémentaire.
- **Classe III** : conjoint à revenu élevé d'un couple marié choisissant la combinaison III/V (l'autre conjoint étant en V).
- **Classe IV** : conjoints mariés à revenus comparables (combinaison IV/IV, éventuellement avec facteur — IV mit Faktor).
- **Classe V** : conjoint à faible revenu d'un couple en combinaison III/V.
- **Classe VI** : tout **second emploi** (et suivants) — sans abattement.

> Réforme prévue : suppression à terme des classes III/V au profit de la combinaison IV/IV mit Faktor (calendrier reporté).

### A.3 — Splitting conjugal (Ehegattensplitting)

Pour les couples mariés / partenaires enregistrés en imposition commune (Zusammenveranlagung) : on **additionne les revenus imposables des deux conjoints, on divise par 2, on applique le barème §32a à cette moitié, puis on multiplie l'impôt obtenu par 2**. Avantage maximal quand les revenus sont très inégaux.

### A.4 — Supplément de solidarité (Solidaritätszuschlag, « Soli »)

- **Taux : 5,5 %** de l'impôt sur le revenu (ou de l'IS pour les sociétés).
- Depuis 2021, **franchise (Freigrenze) élevée** : le Soli n'est dû que si l'ESt dépasse, en 2025 :
  - **19 950 €** d'impôt (imposition individuelle)
  - **39 900 €** d'impôt (imposition commune)
- **2026** : franchise relevée à **20 350 €** (individuel) / **40 700 €** (commun).
- **Zone d'atténuation (Milderungszone)** : au-delà de la franchise, le Soli monte progressivement jusqu'à atteindre 5,5 % pleins.
- **Qui le paie encore** : ~10 % des contribuables (hauts revenus, **revenus du capital** au-delà de l'abattement, et **toutes les sociétés de capitaux** — pas de franchise pour elles). Constitutionnalité confirmée par le BVerfG en mars 2025.

### A.5 — Impôt d'église (Kirchensteuer)

- Assiette : **un pourcentage de l'impôt sur le revenu** (pas du revenu brut).
- **8 %** en **Bavière** et **Bade-Wurtemberg** ; **9 %** dans tous les autres Länder.
- Déductible comme Sonderausgabe (charge effective ~1 % du revenu brut).
- **Plafonnement (Kappung)** ~2,75–4 % du revenu imposable pour les très hauts revenus (sauf Bavière).

### A.6 — Impôt forfaitaire sur le capital (Abgeltungsteuer)

- **Taux : 25 %** sur les revenus du capital (dividendes, intérêts, plus-values mobilières), **+ 5,5 % de Soli** (= 26,375 % au total) **+ Kirchensteuer** le cas échéant (≈ 27,8–27,99 %). Prélevé à la source.
- **Abattement épargnant (Sparer-Pauschbetrag)** : **1 000 €** /personne, **2 000 €** /couple (depuis 2023). À activer via Freistellungsauftrag.
- Option Günstigerprüfung (imposition au barème si plus favorable).

### A.7 — Plus-values immobilières privées (« Spekulationssteuer ») — §23 EStG

- Imposition si vente **dans les 10 ans** suivant l'acquisition. Au-delà de **10 ans : exonération totale**.
- **Exonération même avant 10 ans** si usage **exclusif à l'habitation propre**, ou habité l'année de la vente + les 2 années civiles précédentes.
- Plus-value taxée au **barème progressif** (pas à 25 %).
- **Franchise** : exonéré si total des plus-values privées de l'année **< 1 000 €**.
- Biens meubles : délai de spéculation de **1 an** (10 ans si revenus générés).

### A.8 — Impôt sur la fortune (Vermögensteuer)

- **N'est PLUS prélevé depuis le 1ᵉʳ janvier 1997.** Le BVerfG (22 juin 1995) a jugé inconstitutionnelle la méthode d'évaluation. La loi est **suspendue**, pas abrogée — aucun impôt sur la fortune n'est dû aujourd'hui.

### A.9 — Droits de succession et donation (Erbschaft-/Schenkungsteuer)

**3 classes fiscales (§15 ErbStG)** :
- **Classe I** : conjoint/partenaire, enfants/beaux-enfants, petits-enfants ; parents/grands-parents **en succession uniquement**.
- **Classe II** : frères et sœurs, neveux/nièces, beaux-parents, gendres/belles-filles, ex-conjoint, parents/grands-parents **en donation**.
- **Classe III** : toutes autres personnes (concubins non enregistrés, tiers, personnes morales).

**Abattements (§16 ErbStG)** :

| Bénéficiaire | Abattement | Classe |
|--------------|-----------|--------|
| Conjoint / partenaire enregistré | **500 000 €** | I |
| Enfant / beau-enfant (et petit-enfant si parent prédécédé) | **400 000 €** | I |
| Petit-enfant (parent vivant) | **200 000 €** | I |
| Parents/grands-parents (en succession) | **100 000 €** | I |
| Classe II (frères, neveux, etc.) | **20 000 €** | II |
| Classe III (tiers) | **20 000 €** | III |

- Conjoint : Versorgungsfreibetrag jusqu'à 256 000 € ; enfants : abattement dégressif selon l'âge.
- **Règle des 10 ans** : pour les donations, l'abattement se reconstitue tous les 10 ans.

**Barème des taux (§19 ErbStG)** — sur l'acquisition nette imposable (après abattement) :

| Valeur imposable jusqu'à | Classe I | Classe II | Classe III |
|--------------------------|----------|-----------|------------|
| 75 000 € | **7 %** | **15 %** | **30 %** |
| 300 000 € | 11 % | 20 % | 30 % |
| 600 000 € | 15 % | 25 % | 30 % |
| 6 000 000 € | 19 % | 30 % | 30 % |
| 13 000 000 € | 23 % | 35 % | 50 % |
| 26 000 000 € | 27 % | 40 % | 50 % |
| au-delà de 26 000 000 € | 30 % | 43 % | 50 % |

---

## B) INDÉPENDANTS

### B.1 — Distinction clé : Freiberufler vs Gewerbetreibende

| | **Freiberufler** (professions libérales) | **Gewerbetreibende** (commerçants/artisans) |
|---|---|---|
| Catégorie de revenus | Activité indépendante (**§18 EStG**) | Entreprise commerciale (**§§15-17 EStG**) |
| **Gewerbesteuer** | **NON assujetti** | **Assujetti** (au-delà du Freibetrag de 24 500 €) |
| Inscription | **Finanzamt** | **Gewerbeamt** + Finanzamt |
| Comptabilité | EÜR (caisse) **toujours autorisée** | Bilan au-delà des seuils §141 AO |

**Freiberufler** = activités scientifiques, artistiques, littéraires, d'enseignement/soin ; **Katalogberufe** (§18 EStG : médecins, avocats, conseillers fiscaux, architectes, ingénieurs, journalistes…).

### B.2 — Entrepreneur individuel (Einzelunternehmer)

Imposé à l'**Einkommensteuer** sur le bénéfice. Si Gewerbetreibender : Gewerbesteuer avec **Freibetrag de 24 500 €** et **imputation §35 EStG**.

### B.3 — Régime de franchise de TVA (Kleinunternehmerregelung — §19 UStG)

**Nouveaux seuils depuis le 1ᵉʳ janvier 2025** :
- **CA année précédente ≤ 25 000 €** (auparavant 22 000 €)
- **CA année en cours ≤ 100 000 €** (auparavant 50 000 € prévisionnel)
- Le seuil **100 000 €** est une **limite ferme** : dépassement → assujettissement **immédiat**.
- Depuis 2025 : opérations du Kleinunternehmer **exonérées** (plus de déduction de TVA amont).

### B.4 — Cotisations sociales des indépendants

Pas d'affiliation obligatoire en principe (sauf catégories spécifiques : Künstlersozialkasse, artisans inscrits…).

**Assurance maladie / dépendance** :
- **GKV volontaire** : taux général **14,6 %** + Zusatzbeitrag moyen **2,5 %** (2025) ; Pflegeversicherung **3,6 %** (+0,6 % sans enfant). Base minimale ~**1 248,33 €/mois** (2025) → **1 318,33 €/mois (15 820 €/an)** en 2026. Cotisation minimale GKV ≈ **258,13 €/mois** (2025).
- **PKV** (privée) : prime selon âge/santé, indépendante du revenu.

**Assurance retraite (Rentenversicherung)** : **18,6 %** (facultatif en règle générale ; obligatoire pour certaines professions).

**Plafonds (Beitragsbemessungsgrenzen) 2025** (unifiés Est/Ouest) :
- Maladie & dépendance : **5 512,50 €/mois = 66 150 €/an**
- Retraite & chômage : **8 050 €/mois = 96 600 €/an**

**Taux salariés 2025 (pour info)** : Rente 18,6 % (9,3 % salarié) ; Kranken 14,6 % + Zusatzbeitrag 2,5 % ; Pflege 3,6 % (+0,6 % sans enfant) ; Chômage 2,6 %. **2026** : Zusatzbeitrag moyen GKV → **2,9 %**.

---

## C) SOCIÉTÉS

### C.1 — Sociétés de capitaux vs sociétés de personnes

| | **Kapitalgesellschaften** | **Personengesellschaften** |
|---|---|---|
| Formes | **GmbH, UG, AG** | **GbR, OHG, KG, GmbH & Co. KG** |
| Principe | **Trennungsprinzip** (la société est sujet fiscal) | **Transparenzprinzip** (bénéfice imposé chez les associés) |
| Impôt sur le bénéfice | **KSt 15 % + Soli + Gewerbesteuer** (société) | **Einkommensteuer** chez chaque associé + Gewerbesteuer (société) |
| Gewerbesteuer Freibetrag | **Non** (0 €) | **Oui : 24 500 €** |

**Option à l'IS (§1a KStG)** : OHG, KG, GmbH & Co. KG (et eGbR) peuvent **opter pour l'imposition comme société de capitaux** sans changer de forme.

### C.2 — Impôt sur les sociétés (Körperschaftsteuer — KSt)

- **Taux : 15 %** (unique, indépendant du bénéfice).
- **+ Soli 5,5 % de l'IS = 0,825 %** → **KSt + Soli = 15,825 %**.
- Le Soli **reste dû** par les sociétés de capitaux.

> **Réforme** : IS abaissé progressivement **à partir de 2028** (objectif ~10 % vers 2032), Soli maintenu.

### C.3 — Taxe professionnelle communale (Gewerbesteuer — GewSt)

Calcul : **Bénéfice × Steuermesszahl (3,5 %) × Hebesatz communal**

- **Steuermesszahl : 3,5 %** (uniforme).
- **Hebesatz** : fixé par la **commune**, **minimum légal 200 %**, fourchette réelle **~200 % à 580 %**. **Principal facteur de variation de la charge des sociétés selon la commune.**

**Exemples** :
- **Munich : 490 %** → ≈ **17,15 %** du bénéfice
- **Berlin : 410 %** → ≈ **14,35 %**
- Communes attractives (ex. Schönefeld) : **200 %** → ≈ **7 %**
- Hebesatz élevé : ~580 % → ≈ 20,3 %

**Freibetrag 24 500 €** : seulement personnes physiques et sociétés de personnes. **Imputation §35 EStG** : la GewSt s'impute sur l'IR jusqu'à **4,0 × le Messbetrag** (neutralise ~totalement la GewSt jusqu'à un Hebesatz ~400 %).

### C.4 — Charge fiscale TOTALE d'une société de capitaux

| Composante | Taux |
|------------|------|
| Körperschaftsteuer | 15,000 % |
| Solidaritätszuschlag (5,5 % de l'IS) | 0,825 % |
| Gewerbesteuer (3,5 % × Hebesatz ~400 %) | ≈ 14 % |
| **Charge totale** | **≈ 29,8 – 30 %** |

Ex. Munich (490 %) ≈ **33 %** ; Berlin (410 %) ≈ **30,2 %**.

### C.5 — Distribution chez l'associé : Teileinkünfteverfahren vs Abgeltungsteuer

Personne physique recevant des dividendes :
- **Patrimoine privé** → **Abgeltungsteuer 25 %** (+ Soli + Kirchensteuer). Pas de déduction de frais réels.
- **Patrimoine professionnel** (ou option pour participations ≥ 25 %, ou ≥ 1 % avec activité) → **Teileinkünfteverfahren** : **60 % imposable** au barème (40 % exonérés), frais déductibles à 60 %.

**Arbitrage rémunération du gérant vs dividendes** (gérant-associé de GmbH) :
- **Salaire du gérant** = **charge déductible** (réduit IS + Soli + GewSt).
- **Dividende** : double charge (société + associé).
- **Risque vGA (verdeckte Gewinnausschüttung)** : le salaire doit être conforme au marché (Fremdvergleich) ; excès requalifié en distribution dissimulée.

### C.6 — Capital minimal par forme

| Forme | Capital minimal | Particularités |
|-------|-----------------|----------------|
| **UG (haftungsbeschränkt)** | **1 €** | Apport numéraire intégral ; réserve légale 25 % du bénéfice jusqu'à 25 000 €. |
| **GmbH** | **25 000 €** | ≥ 12 500 € libérés à la constitution. |
| **AG** | **50 000 €** (§7 AktG) | ≥ ¼ libéré ; actions ≥ 1 €. |
| **GbR / OHG / KG** | aucun | — |
| **GmbH & Co. KG** | aucun (KG) | Commandité = GmbH (responsabilité limitée + transparence). |

---

## D) TVA (Umsatzsteuer — USt)

- **Taux normal : 19 %** ; **taux réduit : 7 %** (§12 UStG).
- **7 %** : denrées alimentaires de base, livres, journaux, transport public local, hébergement hôtelier, entrées culturelles, eau du robinet.
- **19 %** : jus de fruits, eau minérale, alcools, prestations de services, électronique.
- **Kleinunternehmerregelung** : voir B.3 (25 000 € / 100 000 € depuis 2025).

**Déclarations (Umsatzsteuer-Voranmeldung)** — selon la dette de TVA (Zahllast) N-1, **seuils 2025** :
- Zahllast **> 9 000 €** → **mensuelle**
- Zahllast **2 000–9 000 €** → **trimestrielle**
- Zahllast **≤ 2 000 €** → **annuelle** seulement
- Transmission **via ELSTER**.

---

## E) CONFORMITÉ

### E.1 — Échéances et ELSTER

- **ELSTER** : portail électronique obligatoire (authentification requise).
- **Umsatzsteuer-Voranmeldung** : pour le **10** du mois suivant ; **Dauerfristverlängerung** (+1 mois) possible moyennant Sondervorauszahlung de 1/11.
- **Déclaration annuelle d'IR** : en principe **31 juillet** N+1 ; délais prolongés avec conseiller fiscal.

### E.2 — Obligations comptables (Buchführungspflicht)

Seuils §141 AO / §241a HGB (depuis 2024, maintenus 2025/2026) :
- **EÜR** (caisse simplifiée) suffit en deçà des seuils.
- **Bilan obligatoire** dès dépassement de : **CA > 800 000 €** OU **bénéfice > 80 000 €**.
- Effet §141 AO **après notification** du Finanzamt (non rétroactif).
- **Sociétés de capitaux** : comptabilité en partie double et bilan **dès le 1ᵉʳ euro** (§§238 ss. HGB).
- **Freiberufler** : EÜR autorisée **sans limite**.

---

## Sources principales

- BMF — Änderungen 2025/2026 : bundesfinanzministerium.de
- §32a EStG : gesetze-im-internet.de/estg/__32a.html ; LStH 2025
- §23 EStG (plus-values immo) : gesetze-im-internet.de/estg/__23.html
- §16/§19 ErbStG : gesetze-im-internet.de/erbstg_1974/__19.html
- §141 AO (comptabilité) : gesetze-im-internet.de/ao_1977/__141.html
- Körperschaftsteuer/Gewerbesteuer : steuerkurse.de ; IHK München ; stadt.muenchen.de
- Sozialversicherung 2025/2026 : Deutsche Rentenversicherung ; krankenkassen.de ; TK ; Finanztip
- Kleinunternehmer 2025 : IHK Stuttgart/München ; nwb.de
- Erbschaftsteuer : finanztip.de ; sparkasse.de ; anwalt.de
- Teileinkünfteverfahren / vGA : juhn.com ; rosepartner.de ; bibukurse.de

---

### Notes de vigilance pour le développement

1. **Seuil 42 % 2025** : utiliser **68 480 €** (formule légale §32a) ; 68 430 € = valeur arrondie du communiqué.
2. **Soli** : pour personnes physiques uniquement au-delà de la Freigrenze (zone d'atténuation à coder) ; **toujours dû** pour sociétés de capitaux et sur l'Abgeltungsteuer.
3. **Gewerbesteuer** : paramétrer le **Hebesatz comme variable communale** (200 %–580 %).
4. **§35 EStG** : imputation GewSt réservée aux entrepreneurs individuels/associés de sociétés de personnes, plafonnée à 4,0 × Messbetrag.
5. **Kleinunternehmer** depuis 2025 : seuil 100 000 € = limite ferme à effet immédiat.
