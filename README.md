# INEE 1.0

Project repository for INEE 1.0.

## Getting Started

Clone the repository and follow the setup instructions below.

```bash
git clone https://github.com/kmptrick/INEE-1.0.git
cd INEE-1.0
```

## Recherche fiscale (INEE2.0)

Documentation fiscale comparative pour **France, Belgique, Luxembourg et Allemagne** (données 2025, nouveautés 2026), destinée au moteur de calcul/simulation, à la comparaison et à la pédagogie d'INEE2.0.

- 📄 **Fiches & synthèse** : [`docs/fiscalite/`](docs/fiscalite/)
  - [`00-synthese-comparative.md`](docs/fiscalite/00-synthese-comparative.md) — vue d'ensemble et recommandations d'architecture
  - [`01-france.md`](docs/fiscalite/01-france.md) · [`02-belgique.md`](docs/fiscalite/02-belgique.md) · [`03-luxembourg.md`](docs/fiscalite/03-luxembourg.md) · [`04-allemagne.md`](docs/fiscalite/04-allemagne.md)
  - [`05-exemples-calculs.md`](docs/fiscalite/05-exemples-calculs.md) — calculs pas à pas servant de cas de test (fixtures) pour le moteur
- 🗂️ **Données structurées (JSON)** : [`data/fiscalite/`](data/fiscalite/) — barèmes, taux et seuils exploitables par le code (voir le [README des données](data/fiscalite/README.md)).
- ⚙️ **Moteur de calcul** : calculs d'impôts fonctionnels alimentés par les JSON, avec tests reproduisant les exemples chiffrés. Deux implémentations équivalentes (mêmes entrées/sorties, mêmes montants) :
  - **TypeScript / Node.js** : [`src/`](src/) — voir le [README TypeScript](src/README.md)
  - **Python** (référence, sans dépendance) : [`engine/`](engine/) — voir le [README Python](engine/README.md)

### Lancer les calculs

**TypeScript / Node.js**
```bash
npm install && npm run build
node dist/calc.js fr-ir 60000 --parts 3 --couple   # IR France (quotient familial)
node dist/calc.js lu-irpp 100000 --classe 2         # IRPP Luxembourg (splitting)
node dist/calc.js de-gmbh 100000 --hebesatz 4.9     # Imposition GmbH (Allemagne)
npm test                                            # Suite de tests (15 cas)
```

**Python**
```bash
python3 calc.py fr-ir 60000 --parts 3 --couple
python3 -m unittest discover -s tests
```

Couverture : personnes physiques, indépendants/professions libérales, sociétés par forme juridique, TVA et conformité déclarative. Chaque chiffre est sourcé (administrations fiscales officielles).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin my-feature`)
5. Open a Pull Request
