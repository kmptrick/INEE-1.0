# Plans comptables — Allemagne (SKR 03 & SKR 04)

> L'Allemagne n'a **pas de plan comptable légal unique**. Le **HGB** impose la *structure*
> du bilan (§ 266) et du compte de résultat (§ 275), mais le plan de comptes est libre.
> En pratique, deux **référentiels standards DATEV** dominent — au choix de l'entreprise :
> - **SKR 03** — orienté **processus** (cycle d'exploitation : *Prozessgliederung*)
> - **SKR 04** — orienté **structure du bilan / compte de résultat** (*Abschlussgliederung*)
>
> Les **libellés** des comptes sont identiques entre SKR 03 et SKR 04 ; seules la **logique
> de classes** et la **numérotation** diffèrent. Comptes à 4 chiffres (souvent 5–6 en pratique).
> Transmission fiscale au format **E-Bilanz (XBRL, § 5b EStG)**.

---

## SKR 04 (orienté clôture — le plus répandu pour les nouvelles entités)

| Classe | Contenu | Exemples de comptes |
|:------:|---------|---------------------|
| **0** | Anlagevermögen (immobilisations) | 0100 Konzessionen/incorporels · 0240 Grundstücke · 0440 Maschinen |
| **1** | Umlaufvermögen (actif circulant) | 1200 Forderungen aus L&L (clients) · 1400 Vorsteuer · 1600 Kasse · 1800 Bank |
| **2** | Eigenkapital (capitaux propres) | 2000 Gezeichnetes Kapital · 2970 Gewinnvortrag |
| **3** | Fremdkapital (provisions & dettes) | 3070 Rückstellungen · 3300 Verbindlichkeiten aus L&L (fournisseurs) · 3800 Umsatzsteuer |
| **4** | Betriebliche Erträge (produits) | 4000 / 4400 Umsatzerlöse 19 % · 4300 Umsatzerlöse 7 % |
| **5** | Material-/Wareneinkauf (achats) | 5200 Wareneingang · 5400 Materialaufwand |
| **6** | Betriebliche Aufwendungen | 6000 Löhne · 6020 Gehälter · 6200 soziale Abgaben · 6220 Abschreibungen · 6300 sonstige |
| **7** | Weitere Erträge / Aufwendungen | 7300 Zinsaufwand · 7600 a.o. Aufwand · 7640 Steuern vom Einkommen |
| **8** | *(libre / non utilisée)* | — |
| **9** | Vortrags-, Kapital-, statistische Konten | 9000 Saldenvortrag |

---

## SKR 03 (orienté processus — historiquement majoritaire)

| Classe | Contenu | Exemples de comptes |
|:------:|---------|---------------------|
| **0** | Anlage- und Kapitalkonten (immobilisations **et** capitaux/emprunts L.T.) | 0027 incorporels · 0070 Bauten · 0420 Maschinen · 0800 Kapital |
| **1** | Finanz- und Privatkonten (trésorerie, comptes privés) | 1000 Kasse · 1200 Bank · 1400 Forderungen aus L&L · 1576 Vorsteuer · 1600 Verbindlichkeiten aus L&L · 1776 Umsatzsteuer |
| **2** | Abgrenzungskonten (produits/charges hors exploitation, financiers, exceptionnels) | 2100 Zinsaufwand · 2650 Zinserträge · 2000 a.o. Aufwendungen |
| **3** | Wareneingangs- und Bestandskonten (achats & stocks) | 3200 Wareneingang · 3400 Materialeinkauf · 3970 Bestand Waren |
| **4** | Betriebliche Aufwendungen (charges d'exploitation) | 4100 Löhne und Gehälter · 4130 soziale Abgaben · 4830 Abschreibungen · 4900 sonstige |
| **5** | *(libre)* | — |
| **6** | *(libre)* | — |
| **7** | Bestände an Erzeugnissen (stocks de produits finis/en-cours) | 7000 Bestand fertige Erzeugnisse |
| **8** | Erlöskonten (produits / ventes) | 8400 Erlöse 19 % · 8300 Erlöse 7 % · 8200 Erlöse |
| **9** | Vortrags- und statistische Konten | 9000 Saldenvorträge |

---

### Repères de correspondance SKR 03 → SKR 04
| Notion | SKR 03 | SKR 04 |
|--------|:------:|:------:|
| Kasse (caisse) | 1000 | 1600 |
| Bank | 1200 | 1800 |
| Forderungen aus L&L (clients) | 1400 | 1200 |
| Verbindlichkeiten aus L&L (fournisseurs) | 1600 | 3300 |
| Vorsteuer (TVA déductible) | 1576 | 1400 |
| Umsatzsteuer (TVA collectée) | 1776 | 3800 |
| Umsatzerlöse 19 % (ventes) | 8400 | 4400 |
| Wareneingang (achats) | 3200 | 5200 |
| Löhne/Gehälter (salaires) | 4100 | 6000/6020 |

> **Livres / principes** : Grundbuch (journal) + Hauptbuch (grand-livre) + Nebenbücher,
> Inventar annuel, conformité **GoB / GoBD** (intégrité, traçabilité, archivage numérique
> inaltérable). Dispense de comptabilité commerciale pour l'Einzelkaufmann sous **§ 241a HGB**
> (CA ≤ 800 000 € et bénéfice ≤ 80 000 €) → **EÜR** (recettes-dépenses).
>
> *Source : DATEV (SKR 03 / SKR 04) ; HGB §§ 266, 275, 238 s. ; § 5b EStG (E-Bilanz).*
