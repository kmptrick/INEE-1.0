# INEE 1.0 — CLAUDE.md

## Vue d'ensemble

ERP/CRM interne pour INEE (société de services basée à Mamer, Luxembourg).
Stack : **Next.js** (frontend) + **NestJS** (backend) + **PostgreSQL** (Prisma ORM).

---

## Architecture

```
/
├── frontend/   → Next.js (App Router)
└── backend/    → NestJS + Prisma
```

### Backend — Modules

| Module | Rôle |
|--------|------|
| `auth` | JWT, guards, rôles (ADMIN / MANAGER / MEMBER) |
| `users` | Gestion des utilisateurs |
| `crm` | Contacts, sociétés, deals, pipeline |
| `projects` | Projets, tâches, time entries |
| `invoicing` | Devis (`Dev - YYYY - NNN`) + Factures (`Fact - YYYY - NNN`) |
| `credit-notes` | Avoirs (`NC - YYYY - NNN`) |
| `commissions` | Suivi des commissions courtiers |
| `services` | Catalogue de prestations |
| `calendar` | Événements calendrier |
| `leave-requests` | Demandes de congés |
| `mail` | Envoi d'e-mails (Nodemailer) |

### Frontend — Pages

`/dashboard/` : companies, contacts, deals, projects, invoices, quotes, credit-notes, commissions, prestations, agenda, users, settings

---

## Décisions importantes

### TVA Luxembourg (services uniquement)

| Situation | TVA applicable | Mention facture |
|-----------|---------------|-----------------|
| Client Luxembourg | 3/8/14/17% | Taux + montant |
| B2B intra-UE | 0% (autoliquidation) | *"Autoliquidation — Art. 44 Dir. 2006/112/CE"* + n° TVA client |
| B2C intra-UE | 17% (TVA LU) | Taux + montant |
| B2B hors UE | 0% hors champ | *"Hors champ TVA — Art. 45 loi TVA LU"* |
| B2C hors UE | 0% hors champ | *"Hors champ TVA"* |

- Taux normal par défaut : **17%** (`VAT_LU = 17` dans `invoicing.service.ts` et `credit-notes.service.ts`)
- Le champ `vatMention` (string libre) sur Invoice/Quote permet d'afficher la mention légale dans le PDF et l'e-mail
- Le champ `lineVatRate` (par ligne) permet de surcharger le taux pour une ligne spécifique

### Facturation

- Les factures et devis ne peuvent pas être **supprimés** (erreur 405) — archivage uniquement
- Les avoirs (credit-notes) peuvent être supprimés
- Conversion devis → facture : le devis doit être au statut `ACCEPTED`
- Numérotation : séquentielle par année, basée sur le `count()` total (pas de reset annuel automatique)

### Coordonnées bancaires (hardcodées dans les e-mails)
```
Banque : Revolut | IBAN : LT07 3250 0544 6550 1204 | BIC : REVOLT21
```

### Adresse INEE (hardcodée dans les e-mails)
```
37, Rue du Baumbusch — 8213 Mamer — TVA : LU36332830
```

---

## Tâches restantes / Points d'attention

- [ ] **`vatMention`** n'est pas encore persisté en base (champ absent du schéma Prisma sur Invoice/Quote) — à ajouter si on veut le stocker
- [ ] La numérotation des documents (basée sur `count()`) peut créer des doublons si un document est supprimé — à surveiller pour les avoirs
- [ ] Le schéma Prisma du modèle `CreditNote` est géré via `prisma as any` → migration à finaliser
- [ ] `LeaveRequest` : controller présent mais service à vérifier
- [ ] Pas de gestion OSS pour le B2C numérique intra-UE (non nécessaire actuellement)
- [ ] Les règles TVA B2B UE / hors UE sont gérées manuellement via `vatMention` — pas de logique automatique côté backend

---

## Commandes utiles

```bash
# Backend (local)
cd backend && npm run start:dev

# Frontend (local)
cd frontend && npm run dev

# Prisma (local)
cd backend && npx prisma generate
cd backend && npx prisma migrate dev

# Prisma (SERVEUR — via IP container Docker)
DATABASE_URL='postgresql://inee_user:IneeSecure2026!@172.19.0.2:5432/inee_db' \
npx prisma@7.8.0 migrate dev --name <nom_migration>
```

---

## Infrastructure serveur (Production)

- **Serveur Hetzner** : `178.105.159.65` (même machine que n8n)
- **Domaine** : `https://app.inee.lu` (HTTPS Let's Encrypt, auto-renouvelé)
- **Frontend** : Next.js 16.2.6, port 3000, géré par **pm2** (`inee-frontend`)
- **Backend** : NestJS, port 3001, géré par **Docker** (`inee-backend`)
- **Base de données** : PostgreSQL dans Docker (`inee-postgres`)
  - User : `inee_user` / Password : `IneeSecure2026!`
  - IP container Docker : `172.19.0.2`
- **Nginx** : reverse proxy HTTP→HTTPS, `/api` → port 3001
- **Build** : `npx next build --webpack` (**obligatoire** — Turbopack incompatible avec next-pwa)

```bash
# Déployer sur le serveur
cd /opt/inee && git pull
cd frontend && NEXT_PUBLIC_API_URL=https://app.inee.lu/api npx next build --webpack
pm2 restart inee-frontend

# Rebuild backend Docker
cd /opt/inee && docker compose build backend && docker compose up -d backend
```

---

## Sauvegardes automatiques

- **Script** : `/opt/backups/backup.sh`
- **Cron** : chaque nuit à **2h00**
- **Rétention** : 30 jours glissants
- **Emplacement** : `/opt/backups/inee_YYYYMMDD_HHMM.sql.gz`
- **Accès WinSCP** : `178.105.159.65` avec clé `C:\Users\lenovo9\.ssh\id_rsa.ppk`
- **Accès SSH** : `ssh root@178.105.159.65` depuis PowerShell

---

## Ce qui a été fait (Sprint 0)

### Authentification & Sécurité
- [x] Blocage compte après 5 tentatives incorrectes (`loginAttempts` + `lockedUntil`)
- [x] Lien "mot de passe oublié" affiché si compte bloqué
- [x] Œil sur champ mot de passe (visible au maintien du clic)
- [x] Déblocage automatique à la réinitialisation du mot de passe

### Interface
- [x] Bouton "+ Nouveau" sur page Utilisateurs (supprimé de la sidebar)
- [x] Suppression colonne "Nom d'utilisateur"
- [x] TableFooter fixé en bas (`position: fixed; bottom: 0; left: 15rem`)
- [x] Scrollbar horizontale sur tous les tableaux
- [x] Colonne "Création" (createdAt) visible dans tous les tableaux

### Filtres & Recherche
- [x] `SegmentFilterBar` sur toutes les pages = barre de recherche + bouton "⊕ Filtres"
- [x] Modal filtres avancés avec règles (colonne / opérateur / valeur)
- [x] Opérateurs : contient, est égal à, commence par, >, <, ≥, ≤, avant/après (dates)

### Clients (Companies)
- [x] Formes juridiques dynamiques par pays — LU/BE/DE/FR (voir tableau ci-dessous)
- [x] Champs **N°** et **Rue** ajoutés (migration `20260529205303_add_company_address_fields`)
- [x] Pays en dropdown avec reset de la forme juridique au changement

### Formes juridiques par pays
| Pays | Formes disponibles |
|------|--------------------|
| LU | Particulier, Indépendant, SARL, SARL-S, SA, SAS, SCA, SCS, SNC, SCoop, SCI, ASBL, Fondation, GIE |
| BE | Particulier, Indépendant, SRL, SA, SC, SNC, SComm, ASBL, Fondation, SCI |
| DE | Privatperson, Einzelunternehmen, GmbH, AG, KG, OHG, GmbH & Co. KG, GbR, e.V., Stiftung |
| FR | Particulier, Auto-entrepreneur, EI, EURL, SARL, SAS, SASU, SA, SNC, SCS, SCA, SCI, SCP, SCOP, Association loi 1901, Fondation, GIE |

### Factures
- [x] Colonne "Échéance" (dueDate) ajoutée et activable via sélecteur colonnes

### PWA (Progressive Web App)
- [x] Installable sur mobile (Android/iOS) et desktop (Chrome/Edge)
- [x] `manifest.json` avec branding INEE (cuivré #C8803A, fond sombre #1A1008)

### Agenda
- [x] Barre de quotas de congés au-dessus du calendrier
- [x] Clic sur créneau → modale pré-remplie avec date/heure
- [x] Sélecteur de personne pour voir le calendrier de n'importe qui

---

## Composants clés — PageShell.tsx

| Export | Rôle |
|--------|------|
| `useSegmentFilter` + `SegmentFilterBar` | Recherche textuelle + filtres avancés par règles |
| `useSort` + `usePagination` | Tri et pagination client-side |
| `useColumns` + `TableFooter` | Sélecteur colonnes + export CSV/Excel/PDF |
| `FilterBar` | Pills de filtre par statut (factures, devis, etc.) |
| `StatusBadge`, `Td`, `DataTable` | Composants tableau |
| `PageHeader`, `AddButton` | En-tête de page |

---

## Tâches restantes

- [ ] Backup automatique vers Google Drive (reporté)
- [ ] Microsoft 365 + OneDrive pour documents professionnels partagés (5 utilisateurs)
- [ ] Modification inline des données existantes dans les tableaux
