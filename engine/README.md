# Moteur de calcul fiscal — INEE2.0

Implémentation de référence (Python 3, **sans dépendance externe**) des calculs
d'impôts pour la France, la Belgique, le Luxembourg et l'Allemagne. Les barèmes
proviennent de [`/data/fiscalite/*.json`](../data/fiscalite/) (source de vérité
unique, versionnée par année).

## Structure

```
engine/
  loader.py       chargement des barèmes JSON (cache)
  core.py         primitives partagées (barème marginal, arrondis)
  france.py       IR (quotient familial + plafonnement + décote), PFU, IS, micro
  belgique.py     IPP (+ quotité + additionnels communaux), cotisations indép., ISOC
  luxembourg.py   IRPP (classes 1/1a/2 splitting + fonds emploi), IRC + ICC
  allemagne.py    Einkommensteuer (§32a), splitting, Soli, Abgeltungsteuer, GmbH
calc.py           démo CLI (à la racine)
tests/            fixtures = exemples de docs/fiscalite/05-exemples-calculs.md
```

## Utilisation (bibliothèque)

```python
from engine import france, luxembourg, allemagne

france.impot_revenu(60000, parts=3, couple=True)
#   {'impot_avant_decote': 2805.99, 'decote': 200.29, 'impot_net': 2605.7, ...}

luxembourg.irpp(100000, classe="2")           # splitting conjugal
#   {'impot_bareme': 14682.6, 'fonds_pour_emploi': 1027.78, 'impot_total': 15710.38, ...}

allemagne.gmbh(100000, hebesatz=4.9)          # Hebesatz communal de Munich (490 %)
#   {'koerperschaftsteuer': 15000.0, 'gewerbesteuer': 17150.0, 'charge_totale': 32975.0, ...}
```

## Utilisation (CLI)

```bash
python3 calc.py fr-ir 35000 --parts 1
python3 calc.py be-ipp 40000 --communal 0.08
python3 calc.py lu-irpp 100000 --classe 2
python3 calc.py de-est 100000 --couple
python3 calc.py de-gmbh 100000 --hebesatz 4.9
```

## Tests

```bash
python3 -m unittest discover -s tests   # 15 cas, doivent tous passer
```

Les tests rejouent les 13 exemples chiffrés de
[`docs/fiscalite/05-exemples-calculs.md`](../docs/fiscalite/05-exemples-calculs.md)
et servent de garde-fou : toute modification d'un barème doit laisser ces
montants inchangés (ou mettre à jour la fixture en connaissance de cause).

## Conventions

- **Taux** en décimal (`0.25` = 25 %). Montants en euros.
- Barèmes **marginaux** par tranches `{min, max, taux}` (`max: null` = illimité).
- Fonctions **pures** (entrées → dict de résultats) → faciles à porter vers
  TypeScript, Python/Pydantic, etc.

## Limites connues (volontaires)

Ces calculs couvrent la mécanique principale. Sont **simplifiés ou non encore
implémentés** : zone d'atténuation du Soli allemand, cotisation spéciale de
sécurité sociale belge, crédits d'impôt luxembourgeois (CIS/CIM), prélèvement à
la source français, et l'ensemble des cas particuliers/abattements signalés dans
les fiches `docs/fiscalite/`. À compléter selon les besoins d'INEE2.0 et à
**verrouiller sur les textes officiels** avant production.
