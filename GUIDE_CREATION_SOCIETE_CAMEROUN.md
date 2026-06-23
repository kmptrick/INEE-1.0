# Guide — Créer une société au Cameroun pour éditer des applications (ex. Scolaria)

> **Objet.** Cadre juridique, fiscal, social et réglementaire pour créer et exploiter une
> société éditrice de logiciels / applications (SaaS, web, mobile) au Cameroun, avec un focus
> sur le cas d'un **logiciel de gestion scolaire** traitant des **données d'élèves mineurs**.
>
> **Date de rédaction : 23 juin 2026.** Montants en FCFA.
>
> ⚠️ **Avertissement.** Ce guide est une synthèse documentaire à partir de sources publiques
> (textes officiels, DGI/MINFI, CFCE, OAPI, ANTIC, cabinets spécialisés). Plusieurs chiffres
> (notamment les frais exacts) divergent selon les sources et doivent être **confirmés au
> guichet (CFCE, DGI, CNPS) ou auprès d'un avocat/notaire/expert-comptable camerounais** avant
> toute décision. Les points incertains sont signalés par ⚠️.

---

## 0. Synthèse express (TL;DR)

1. **Forme juridique recommandée** : **SARL/SARLU** pour démarrer (capital min. **100 000 FCFA**,
   pas de notaire obligatoire), ou **SAS/SASU** si vous prévoyez une **levée de fonds**.
2. **Immatriculation** : guichet unique **CFCE** (ou en ligne **MyBusiness.cm**), **~72 h** à 7 jours,
   coût réaliste **~50 000 à 150 000 FCFA** pour une SARL sous seing privé. NIU **gratuit**,
   patente **exonérée la 1ʳᵉ année**.
3. **Fiscalité** : sous **50 M FCFA** de CA → nouveau régime forfaitaire **IGS**. Au-delà → **régime
   du réel** : **TVA 19,25 %** + **IS 33 %**. **CNPS** employeur ~**12,95 %** de la masse salariale.
4. **Attention paiements cloud/SaaS étrangers** (AWS, Microsoft, etc.) : **TSR ~15 %** + **TVA
   19,25 %** à retenir/autoliquider.
5. **Propriété intellectuelle** : le **logiciel est protégé par le droit d'auteur** (automatique).
   Déposez la **marque « Scolaria »** à l'**OAPI** (Yaoundé), **classes 9 et 42**, ~**435 000 FCFA**
   de taxes officielles indicatives, protection **10 ans renouvelable**.
6. **Données personnelles (CRUCIAL pour Scolaria)** : nouvelle **loi n° 2024/017** (« RGPD
   camerounais »), **mise en conformité au 23 juin 2026**. Données de **mineurs (< 18 ans)** =
   **consentement parental obligatoire** + précautions renforcées.

---

## 1. Choisir la forme juridique (droit OHADA + droit camerounais)

Cadre : **Acte uniforme OHADA relatif au droit des sociétés commerciales et du GIE (AUDSCGIE),
révisé le 30 janvier 2014**.

| Forme | Associés | Responsabilité | Capital min. | Notaire | Pour la tech ? |
|---|---|---|---|---|---|
| **Établissement (ETS)** — entreprise individuelle | 1 | **Illimitée** (patrimoine perso engagé) | Aucun | Non | ❌ À éviter |
| **GIE** | ≥ 2 | **Illimitée & solidaire** | Aucun | Contrat | ❌ À éviter |
| **SARL / SARLU** | 1 à 100 | Limitée aux apports | **100 000 FCFA** | Facultatif si capital ≤ 1 M | ✅ Idéal pour démarrer |
| **SAS / SASU** | 1+ | Limitée aux apports | **Libre** (pas de min.) | Selon statuts | ✅ Idéal si levée de fonds |
| **SA** | actionnaires | Limitée aux apports | **10 000 000 FCFA** | **Obligatoire** | ⚠️ Surdimensionné |

**Points clés :**
- **SARL** : forme la plus répandue pour les PME. Le capital minimum a été **abaissé de 1 000 000 à
  100 000 FCFA** par la **loi n° 2016/014 du 14 décembre 2016** (toute source affichant encore
  1 M FCFA est **obsolète**). Parts ≥ 5 000 FCFA. Notaire **facultatif** si capital ≤ 1 M (statuts
  authentifiés directement au CFCE).
- **SAS** : grande **liberté statutaire** (idéale pour pacte d'associés / investisseurs / actions),
  seule obligation = nommer un **président**. Appel public à l'épargne interdit.
- **SA** : capital **10 M FCFA**, gouvernance lourde — généralement inutile au démarrage.
- **Établissement / GIE** : **à proscrire** (responsabilité illimitée, pas adapté aux investisseurs).

**Libération du capital** : SARL = **50 %** des apports en numéraire à la souscription, solde sous
2 ans (⚠️ le « 25 % » parfois cité confond avec la SA, qui libère 25 % puis solde sous 3 ans).

> **Recommandation** : **SARL/SARLU** si projet autofinancé ; **SAS** si vous visez une croissance
> rapide avec entrée d'investisseurs.

---

## 2. Immatriculer la société (CFCE / guichet unique)

**Le CFCE (Centre de Formalités de Création d'Entreprises)** est un **guichet unique** (tutelle
MINPMEESA, opéré par l'APME) regroupant : **DGI** (NIU, patente), **Greffe** (RCCM), **CNPS**,
**INS** (n° statistique), MINCOMMERCE. CFCE à Yaoundé, Douala, Bafoussam, Garoua, Bamenda, Maroua,
Ebolowa, Limbé. Voie en ligne : **MyBusiness.cm** (paiement par Orange Money / MTN MoMo).

**Étapes :**
1. **Rédiger les statuts** (sous seing privé pour SARL ≤ 1 M ; notariés pour SA).
2. **Souscrire / déposer le capital** (compte « société en création » + DNSV notariée pour la SA).
3. **Déposer le dossier unique** au CFCE (ou en ligne).
4. **Retrait sous ~72 h** : attestation de création, **RCCM**, **carte de contribuable + NIU
   (gratuit)**, **patente « EXONÉRÉE »** (1ʳᵉ année), attestation CNPS, n° statistique INS.

**Délais légaux** : RCCM dans le **mois** ; immatriculation fiscale (NIU) dans les **15 jours
ouvrables** du début d'activité.

**Documents requis (communs)** : formulaire unique CFCE ; **plan de localisation** du siège ;
**copie CNI** (passeport/carte de séjour pour étrangers) ; **casier judiciaire (bulletin n°3)** ou
**déclaration sur l'honneur** (à régulariser sous 75 j) ; **bail commercial** ou domiciliation.
- **SARL** : statuts sous seing privé (5 originaux dont 3 timbrés), déclaration de régularité/conformité.
- **SA** : statuts **notariés**, **DNSV**, liste des dirigeants, justificatif de dépôt du capital.

**Coûts (fourchettes indicatives ⚠️ — divergences entre sources)** :

| Poste | Montant (FCFA) |
|---|---|
| NIU / carte de contribuable | **Gratuit** |
| Patente | **Exonérée 1ʳᵉ année** |
| RCCM (greffe) | ~20 000–21 500 |
| Droits d'enregistrement statuts | ~20 000 |
| Annonce légale | ~13 125 |
| Timbres fiscaux | ~15 000 |
| **Total SARL (sans notaire)** | **~50 000 à 150 000** (selon source/centre) |
| **Total SARL notariée (> 1 M)** | ~220 000 à 700 000 |
| **Total SA** | ~700 000 à 1 500 000+ |

**Délai** : officiel **72 h**, en pratique **3 à 7 jours**.

---

## 3. Fiscalité de l'entreprise

### 3.1 Régimes selon le chiffre d'affaires (RÉFORME MAJEURE 2025)

La **loi de finances 2025** a **supprimé l'ancien « impôt libératoire » et le « régime simplifié »**
et les a fusionnés dans un nouvel **Impôt Général Synthétique (IGS)**, structuré par la LF 2026.

| Régime | Seuil de CA annuel HT | Statut 2025-2026 |
|---|---|---|
| Impôt libératoire (ancien, < 10 M) | — | **Supprimé**, absorbé par l'IGS |
| Régime simplifié (ancien, 10–50 M) | — | **Supprimé**, absorbé par l'IGS |
| **IGS** (nouveau, forfaitaire) | **CA ≤ 50 M** (≤ **30 M** pour professions libérales) | En vigueur |
| **Régime du réel** | **CA ≥ 50 M** | En vigueur |

**IGS** : impôt forfaitaire libératoire en **10 classes**, de **20 000 à 2 000 000 FCFA/an** (CA
< 500 000 FCFA = **exonéré** mais immatriculation obligatoire). Libère de la patente, de l'IRPP/IS
et de la TVA. **Adhésion à un Centre de Gestion Agréé (CGA)** = montant **÷ 2** pour les classes
hautes. ⚠️ Le détail des bornes intermédiaires (classes 2 à 7) est à vérifier dans la Fiscalité
Locale 2026.

### 3.2 Régime du réel (CA ≥ 50 M FCFA)

- **TVA : 19,25 %** (17,5 % de principal + 1,75 % de centimes additionnels communaux). Déclaration
  **mensuelle**, au plus tard le **15 du mois suivant** (déclaration « néant » obligatoire même sans
  opération). **Télédéclaration/télépaiement obligatoires** (portail DGI / Fiscalis).
  **Seuil d'assujettissement TVA : CA ≥ 50 M FCFA.**
- **Impôt sur les sociétés (IS) : 33 %** (30 % + 10 % de CAC) sur le bénéfice net ; **minimum de
  perception 2,2 %**. Paiement au plus tard le **15 mars**.
- **DSF (Déclaration Statistique et Fiscale)** annuelle : échéance **15 mars** (exercice clos au 31/12).
- **Comptabilité OHADA** complète.

### 3.3 IRPP (entrepreneurs individuels au réel) — barème progressif

| Tranche de revenu net annuel (FCFA) | Taux | Avec CAC (10 %) |
|---|---|---|
| 0 – 2 000 000 | 10 % | 11 % |
| 2 000 001 – 3 000 000 | 15 % | 16,5 % |
| 3 000 001 – 5 000 000 | 25 % | 27,5 % |
| > 5 000 000 | 35 % | 38,5 % |

### 3.4 ⚠️ Paiements à des prestataires étrangers (cloud / SaaS / licences) — POINT CLÉ TECH

Si votre société paie des services à l'étranger (hébergement AWS/Azure/GCP, abonnements SaaS,
développeurs offshore, licences) :
- **TSR (Taxe Spéciale sur le Revenu)** : retenue à la source, **taux général 15 %** (10 % pour
  certaines prestations ponctuelles ; 5 % marchés publics). Réductible par convention fiscale (ex.
  **France-Cameroun → 7,5 %** pour études/assistance technique, sur certificat de résidence).
  ⚠️ Divergence entre sources sur l'ajout des CAC (15 % vs 15,75 %) — à faire trancher par un conseil.
- **TVA sur services dématérialisés importés : 19,25 %** (mécanisme d'autoliquidation/retenue).
- **Nouveauté LF 2026** : **IS minimum de 3 % sur le CA local** des **plateformes numériques
  étrangères** sans établissement au Cameroun (seuils : 1 000 utilisateurs **ou** 50 M FCFA de CA).
  Vise surtout les fournisseurs étrangers, mais votre société peut être désignée **collecteur local**.

### 3.5 Taxes locales

- **Contribution des patentes** : assise sur le CA (~0,159 % à 0,494 % selon la taille, avec
  plancher/plafond), payable avant le **31 mars** ; **exonérée la 1ʳᵉ année** pour une société
  nouvelle. Inclut centimes additionnels + taxe de développement local + redevance audiovisuelle.
- **Centimes Additionnels Communaux (CAC)** : **10 %** en sus du principal de la TVA, l'IS, l'IRPP.
- **Précompte sur achats** : acompte imputable, de 0,5 % à 10 % selon le régime du fournisseur
  (1 % pour un contribuable au réel avec carte). ⚠️ Le « 14 % » parfois évoqué n'a pas de fondement
  identifié.

---

## 4. Obligations sociales (CNPS)

La **CNPS** (Caisse Nationale de Prévoyance Sociale) gère la sécurité sociale des salariés du privé.

- **Immatriculation employeur + salariés** : obligatoire, sous **8 jours** après l'embauche (via le
  CFCE à la création, puis espace en ligne cnps.cm).
- **Taux de cotisation** (décret n° 2016/072, plafond mensuel **750 000 FCFA** pour PVID et PF) :

| Branche | Taux total | Employeur | Salarié |
|---|---|---|---|
| Pension (PVID) | 8,4 % | 4,2 % | 4,2 % |
| Prestations familiales (PF) | 7,0 % | 7,0 % | 0 % |
| Risques professionnels (RP) | 1,75 % à 5 % | 100 % | 0 % |

- **Charge employeur ≈ 12,95 %** pour une activité de bureau à faible risque (groupe A à 1,75 %,
  le plus probable pour une entreprise tech — ⚠️ à confirmer par la CNPS selon votre code d'activité).
- **Seule retenue sur le salaire** = 4,2 % PVID (plafonnée à 31 500 FCFA/mois).
- **Télédéclaration mensuelle** + paiement au plus tard le **15 du mois suivant**.

---

## 5. Incitations à l'investissement et écosystème startup

### 5.1 ⚠️ NOUVEAU cadre (l'ancienne loi 2013/004 est ABROGÉE)

- L'ancienne **loi n° 2013/004** (incitations à l'investissement privé), modifiée par la loi
  2017/015, a été **ABROGÉE** par l'**Ordonnance n° 2025/002 du 18 juillet 2025**, **ratifiée par la
  loi n° 2025/015 du 17 décembre 2025** (désormais en vigueur).
- **Régime actuel** : exonérations fiscalo-douanières de **5 à 10 ans** (phases d'installation et
  d'exploitation) **+ innovation majeure : un crédit d'impôt** pouvant atteindre **75 % du montant
  investi** (régime commun) ou **80 % en Zone de Développement Prioritaire (ZDP)**.
- **Conditions** : satisfaire au moins **2 critères**, dont la **création d'emplois directs** pour
  des Camerounais. Agrément via le **guichet unique (API — Agence de Promotion des Investissements)**.
- ⚠️ Réforme récente et critiquée (crédit d'impôt jugé moins avantageux que les anciennes
  exonérations) : **faites valider l'éligibilité de votre projet par un conseil** sur la base du
  texte 2025/002.

### 5.2 Statut « Startup » et appui au numérique

- ⚠️ À ce jour, le Cameroun **n'a pas encore de « Startup Act » dédié pleinement opérationnel**
  (contrairement au Sénégal ou à la Tunisie). L'écosystème s'appuie sur les **incitations générales
  à l'investissement** (ci-dessus) et sur des **programmes publics** (MINPOSTEL, ANTIC, incubateurs,
  programmes de transformation numérique). **Point à vérifier** auprès du MINPOSTEL/MINPMEESA pour
  tout label ou dispositif récent.
- Avantage de droit commun utile : **patente exonérée la 1ʳᵉ année** + possibilité de **CGA** pour
  réduire l'IGS.

---

## 6. Protéger la propriété intellectuelle

### 6.1 Le logiciel = protégé par le DROIT D'AUTEUR (pas le brevet)

- Dans l'espace **OAPI** (siège à **Yaoundé**) et au Cameroun, le **programme d'ordinateur (code
  source inclus) est une œuvre littéraire protégée par le droit d'auteur** — **Annexe VII de
  l'Accord de Bangui** + **loi camerounaise n° 2000/011 du 19 décembre 2000**.
- **Protection automatique dès la création**, sans formalité. Le logiciel « en tant que tel » **n'est
  pas brevetable**.
- **Durée** : droits patrimoniaux **vie de l'auteur + 50 ans** (régime spécifique de **50 ans** pour
  les logiciels selon les commentaires de la loi ⚠️ à confirmer).
- **Preuve d'antériorité** : déclaration auprès d'un organisme de gestion collective — au Cameroun,
  la **SOCILADRA** gère les œuvres littéraires **et les logiciels**. Possibilité de dépôt probatoire.

### 6.2 Déposer la MARQUE « Scolaria » à l'OAPI

- **Un seul dépôt OAPI = protection dans les 17 États membres** (dont le Cameroun).
- **Classes de Nice recommandées** : **classe 9** (logiciels téléchargeables, applis) **+ classe 42**
  (SaaS, développement, hébergement). Déposez **les deux**.
- **Durée** : **10 ans renouvelable indéfiniment**.
- **Coûts officiels indicatifs ⚠️** (barème modifié en juin 2024, à actualiser) : dépôt 1ʳᵉ classe
  ~**360 000 FCFA** + classe supplémentaire ~**75 000 FCFA** → ~**435 000 FCFA** pour 2 classes,
  **hors honoraires de mandataire** (mandataire **obligatoire** si vous déposez depuis hors zone OAPI).
- Dépôt au siège OAPI (Yaoundé), via une Structure Nationale de Liaison, ou en **e-filing**
  (depuis juin 2024). Formulaire **M301**.

### 6.3 Sécuriser la titularité du code (salariés & prestataires) — IMPORTANT

- **Salarié** : en droit OAPI/Cameroun, les **droits patrimoniaux** sur une œuvre créée dans le cadre
  d'un **contrat de travail** sont **présumés transférés à l'employeur**, dans la limite de ses
  activités habituelles (Annexe VII, art. 31). **Sécurisez-le par une clause de cession écrite.**
- **Prestataire / freelance** : **reste propriétaire du code SAUF cession écrite expresse**. Le simple
  paiement ne transfère **pas** les droits → sans clause, vous n'avez qu'une licence d'usage et **pas
  droit à la remise du code source**.
- **Contrat de cession** : doit être **écrit**, lister **chaque droit cédé** distinctement, préciser
  **étendue, destination, territoire, durée** (et rémunération). Le **droit moral** reste incessible.
- Ajoutez systématiquement : clause de **cession de droits**, **remise du code source**, **confidentialité/NDA**.

---

## 7. Protection des données personnelles & conformité (CRUCIAL pour Scolaria)

### 7.1 La nouvelle loi « RGPD camerounais »

- **Loi n° 2024/017 du 23 décembre 2024** relative à la protection des données à caractère personnel —
  le Cameroun disposait jusque-là d'**aucune loi générale** dédiée. Largement **calquée sur le RGPD**.
- **Mise en conformité : 23 juin 2026** (délai de transition de 18 mois, art. 73) — **c'est-à-dire
  maintenant**.
- **Sanctions** : administratives jusqu'à **100 M FCFA** ; **pénales** jusqu'à **1 milliard FCFA** et
  emprisonnement (6 mois à 10 ans).
- ⚠️ L'**Autorité de Protection des Données (APD)** est instituée par la loi mais **pas encore créée**
  (décret présidentiel attendu) — surveillez sa publication car déclarations/autorisations en dépendent.

### 7.2 Données de MINEURS (élèves) — obligations renforcées

- **Seuil de minorité : moins de 18 ans.** Le consentement d'un mineur **n'est valable qu'avec le
  consentement des parents / du représentant légal**.
- Pour les **données sensibles** d'un mineur (santé, biométrie, photos/empreintes) : **autorisation
  préalable de l'Autorité**.
- À mettre en place dans Scolaria : **consentement parental documenté et vérifiable**, **vérification
  de l'identité du parent/tuteur**, **minimisation** des données, sécurité (mesures techniques et
  organisationnelles), procédure de **notification de violation**.

### 7.3 Hébergement / localisation des données

- Tout **transfert hors Cameroun** (serveurs UE/USA) requiert une **autorisation préalable de l'APD**
  + garanties. La loi **incite à la localisation au Cameroun** (⚠️ incitation plutôt qu'obligation
  absolue générale — à confirmer dans le texte).
- **Recommandation** : privilégier un **hébergement au Cameroun** (ex. datacenters locaux / CAMTEL)
  pour les données d'élèves, ou prévoir le dossier d'autorisation de transfert.

### 7.4 ANTIC, ART et secteur éducatif

- **ANTIC** (Agence Nationale des TIC) : cybersécurité, certification, **audit de sécurité** des
  systèmes d'information (décret n° 2012/1643/PM), **CIRT** pour le signalement d'incidents
  (cirt.cm). ⚠️ Un SaaS traitant des données personnelles via Internet **pourrait** entrer dans le
  champ de l'audit — à confirmer.
- **ART** (Agence de Régulation des Télécommunications) : un simple logiciel scolaire **n'est pas**
  un opérateur télécom. **Mais** si vous intégrez de l'**envoi massif de SMS/USSD** aux parents, une
  qualification de **Fournisseur de Services à Valeur Ajoutée (FSVA)** et une **déclaration ART**
  peuvent être requises (sanctions 100–500 M FCFA pour exploitation sans titre).
- **Éducation (MINESEC/MINEDUB)** : **aucun agrément éditeur spécifique identifié** pour un logiciel
  de gestion scolaire. ⚠️ Mais le MINESEC déploie ses propres outils (**carte scolaire numérique**,
  projet de **matricule national unique** par élève) → prévoir l'**interopérabilité** et **vérifier
  auprès des ministères** d'éventuelles conditions techniques.
- **Cybersécurité** (loi n° 2010/012) : obligations de sécurité, signalement d'incident (ANTIC/CIRT).

---

## 8. Feuille de route opérationnelle suggérée

1. **Décider la structure** : SARL/SARLU (démarrage) ou SAS (si levée de fonds).
2. **Réserver/déposer la marque « Scolaria »** à l'OAPI (classes 9 + 42) — idéalement avant le lancement public.
3. **Immatriculer** au CFCE / MyBusiness.cm (statuts, capital 100 000 FCFA, ~72 h).
4. **S'immatriculer à la CNPS** dès la 1ʳᵉ embauche (sous 8 jours).
5. **Mettre en place la comptabilité** (adhésion à un **CGA** recommandée tant que CA < 50 M) et le
   suivi fiscal (IGS puis bascule au réel à 50 M : TVA + IS).
6. **Sécuriser la PI** : clauses de cession dans tous les contrats (salariés ET prestataires) + NDA.
7. **Conformité données (priorité absolue pour Scolaria)** : registre des traitements, base légale,
   **consentement parental vérifiable**, sécurité, hébergement (localisation CM ou dossier de
   transfert), procédure de notification de violation. **Faire auditer par un avocat TIC/données.**
8. **Anticiper la TSR/TVA** sur vos abonnements cloud/SaaS étrangers.
9. **Étudier l'agrément « incitations à l'investissement »** (ordonnance 2025/002, crédit d'impôt) si
   l'investissement est significatif.

---

## 9. Principales incertitudes à faire valider par un professionnel

- Montants exacts des **frais d'immatriculation** (41 500 vs 69 625 vs 147 000 FCFA selon source).
- **Bornes intermédiaires** des classes IGS (2 à 7) et frontière exacte réel simplifié / réel normal.
- **Application des CAC à la TSR** (15 % vs 15,75 %) selon la nature du paiement.
- **Barème OAPI** post-juin 2024 (taxes en hausse) + honoraires de mandataire.
- **Régime de durée** du droit d'auteur sur les logiciels (50 ans vs vie + 50 ans).
- **Création effective de l'APD** (décret) et **délai exact** de notification de violation.
- **Obligation stricte vs simple incitation** de localisation des données au Cameroun.
- **Champ de l'audit ANTIC** pour un éditeur SaaS et **conditions d'interopérabilité** MINESEC.
- Existence d'un **dispositif/label « startup »** récent (MINPOSTEL/MINPMEESA).

---

## 10. Sources principales

**Sociétés / immatriculation**
- MINFI — Formalités de création : https://minfi.gov.cm/en/formalities-for-setting-up-an-enterprise-in-cameroon/
- CFCE : https://cfce-cameroun.cm/ · MyBusiness.cm : https://cameroun.eregistrations.org/
- RCCM-OHADA : https://rccm.ohada.org/staticPage/index?alias=immRC
- Loi 2016/014 (capital SARL 100 000) : https://www.village-justice.com/articles/Creation-une-SARL-Cameroun-innovations-loi-2016-014-decembre-2016,24010.html
- Investir au Cameroun (capital SARL) : https://www.investiraucameroun.com/entreprises/1303-8649-le-cameroun-ramene-a-100-000-fcfa-le-capital-exigible-pour-creer-une-societe-a-responsabilite-limitee

**Fiscalité**
- DGI : https://impots.cm/ · Calendrier fiscal : https://www.impots.cm/fr/calendrier-fiscal
- IGS 2026 : https://codegeneraldesimpots.com/cm/article/igs-2026-ce-que-vous-devez-savoir
- Deloitte LF 2025 : https://blog.avocats.deloitte.fr/cameroun-les-principales-mesures-importantes-de-la-loi-de-finances-pour-2025/
- Deloitte LF 2026 : https://blog.avocats.deloitte.fr/cameroun-les-principales-innovations-de-la-loi-de-finances-pour-2026/
- PwC Tax Summaries Cameroun : https://taxsummaries.pwc.com/republic-of-cameroon/corporate/withholding-taxes
- Fiscalité numérique / art. 23 bis : https://www.digitalbusiness.africa/loi-de-finances-2026-comment-le-cameroun-encadre-et-taxe-desormais-les-entreprises-du-numerique-operant-depuis-letranger/

**CNPS**
- CNPS — Obligations employeur : https://www.cnps.cm/fr/employeurs/obligations-de-lemployeur1.html
- Cleiss — Cotisations Cameroun : https://www.cleiss.fr/docs/cotisations/cameroun.html

**Incitations**
- Ordonnance 2025/002 : https://www.prc.cm/fr/actualites/actes/ordonnances/7897-ordonnance-n-2025-002-du-18-juillet-2025-fixant-les-incitations-a-l-investissement-en-republique-du-cameroun
- Loi de ratification 2025/015 : https://prc.cm/fr/actualites/actes/lois/8095-loi-n-2025-015-du-17-decembre-2025-portant-ratification-de-l-ordonnance-n-2025-002-du-18-juillet-2025
- MINEPAT (crédit d'impôt) : https://minepat.gov.cm/2025/11/25/incitations-a-linvestissement-le-gouvernement-veut-doter-le-cameroun-dun-cadre-plus-attractif/

**Propriété intellectuelle**
- OAPI : https://oapi.int/ · Accord de Bangui : https://oapi.int/en/legal-framework/bangui-agreement/
- Loi 2000/011 (droit d'auteur) — WIPO Lex : https://www.wipo.int/wipolex/fr/legislation/details/836
- SOCILADRA : https://www.sociladra.cm/declarations-oeuvres/oeuvres-protegees

**Données personnelles / numérique**
- Loi 2024/017 (texte officiel PRC) : https://www.prc.cm/fr/multimedia/documents/10258-loi-n-2024-017-du-23-12-2024-web
- Analyse : https://taxafrica.cm/loi-n2024-017-un-nouveau-cadre-pour-la-protection-des-donnees-personnelles-au-cameroun/
- APD non encore créée : https://cio-mag.com/protection-des-donnees-au-cameroun-la-course-contre-la-montre-avant-juin-2026/
- ANTIC — audit de sécurité : https://www.antic.cm/index.php/fr/missions/audit-de-securite.html
- Loi 2010/012 (cybersécurité) : https://www.art.cm/sites/default/files/documents/loi_2010-012_cybersecurite_cybercriminalite.pdf
- MINESEC — carte scolaire numérique : https://www.minesec.gov.cm/web/index.php/fr/carte-scolaire/carte-scolaire-numerique
