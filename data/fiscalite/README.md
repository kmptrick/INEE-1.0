# Données fiscales structurées — INEE2.0

Données fiscales machine-exploitables pour les 4 pays couverts, destinées au moteur de calcul/simulation et aux comparateurs d'INEE2.0.

## Fichiers

| Fichier | Pays | Année de référence |
|---|---|---|
| `fr-2025.json` | 🇫🇷 France | IR 2025 (revenus 2024) + notes 2026 |
| `be-2025.json` | 🇧🇪 Belgique | EI 2026 (revenus 2025) + réformes 2026 |
| `lu-2025.json` | 🇱🇺 Luxembourg | AI 2025 + notes 2026 |
| `de-2025.json` | 🇩🇪 Allemagne | 2025 + notes 2026 |

## Schéma (commun, par pays)

Chaque fichier suit la structure :

```
{
  "pays", "code", "devise", "annee_imposition", "source_principale",
  "personnes_physiques": {
    "impot_revenu...": { "type_bareme", "tranches": [{min, max, taux}], ... },
    "prelevements_sociaux_capital" / "capitaux_mobiliers" / "abgeltungsteuer",
    "plus_values_immobilieres",
    "impot_fortune..." (le cas échéant),
    "succession..." / "donation"
  },
  "independants": { cotisations, seuils, régimes },
  "societes": { capital_minimal, is/isoc/irc/koerperschaftsteuer, mere_fille, ... },
  "tva": { taux + franchise + régimes }
}
```

### Conventions
- **Taux** exprimés en **décimal** (ex. `0.25` = 25 %).
- **Tranches** : tableaux d'objets `{ "min", "max", "taux" }`, `max: null` = tranche supérieure illimitée. Barème **marginal** (chaque tranche taxée à son taux), sauf indication contraire.
- **Montants** en euros (devise de chaque pays = EUR).
- Les clés `note_*` / `*_2026` / `*_reforme` signalent les **valeurs prospectives ou en cours de réforme** (à activer par date d'effet).

## Particularités à coder

1. **Allemagne** : l'impôt sur le revenu n'est **pas** une table de tranches mais des **formules polynomiales** (`§32a EStG`), fournies dans `de-2025.json > personnes_physiques.impot_revenu_einkommensteuer.zones[].formule`. Implémenter le calcul par zone.
2. **France** : appliquer le **quotient familial** (division par le nombre de parts, calcul, multiplication) + **plafonnement** des demi-parts + **décote**.
3. **Luxembourg** : sélection de **classe d'impôt** (1 / 1a / 2-splitting) puis surtaxe **fonds pour l'emploi** ; **ICC paramétrable par commune** (`societes.icc`).
4. **Belgique** : ajouter les **additionnels communaux** (% de l'impôt) ; droits de **succession/donation par région** (`flandre`/`wallonie`/`bruxelles`).
5. **Allemagne** : **Gewerbesteuer** = `steuermesszahl (0.035) × Hebesatz communal` — variable par commune (`societes.gewerbesteuer`).

## Avertissement

Données issues de recherches sur sources officielles, mais à **verrouiller sur les textes officiels** (administrations fiscales) avant tout usage en production. Voir les fiches détaillées et les « points de vigilance » dans `/docs/fiscalite/`.
