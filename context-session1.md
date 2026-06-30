# Contexte Session 1 — INEE 1.0

**Date :** 30 mai 2026  
**Branche active :** `setup/sprint-0-foundations`  
**Statut git :** propre (aucune modification en cours)

---

## Stack technique

- **Frontend :** Next.js (App Router), port 3000, géré par pm2 (`inee-frontend`)
- **Backend :** NestJS + Prisma ORM, port 3001, Docker (`inee-backend`)
- **Base de données :** PostgreSQL dans Docker (`inee-postgres`)
- **Serveur prod :** Hetzner `178.105.159.65` — domaine `https://app.inee.lu`

---

## Derniers commits (Sprint 0 terminé)

| Commit | Description |
|--------|-------------|
| `28ba049` | docs: mise à jour CLAUDE.md — état complet Sprint 0 |
| `4a7cd2a` | feat: formes juridiques par pays (LU/BE/DE/FR) + champs N° et Rue |
| `48caaf6` | feat: colonne Création visible dans tous les tableaux |
| `052ba0c` | feat: SegmentFilterBar — search + modal filtres + createdAt + Échéance |
| `e6538db` | fix: cast validUntil as any dans export devis |

---

## État du Sprint 0 — Complété

### Ce qui est fait
- Authentification : blocage compte, mot de passe oublié, œil sur champ mdp
- Interface : TableFooter fixé, scrollbar horizontale, colonne Création partout
- Filtres : SegmentFilterBar + modal règles avancées sur toutes les pages
- Clients : formes juridiques dynamiques par pays, champs N° et Rue
- Factures : colonne Échéance (dueDate)
- PWA installable (Android/iOS/desktop)
- Agenda : quotas congés, clic créneau → modale pré-remplie, sélecteur personne

---

## Points en suspens (backlog)

- [ ] `vatMention` non persisté en base (champ absent du schéma Prisma)
- [ ] Numérotation documents via `count()` → risque doublon si suppression avoir
- [ ] Schéma `CreditNote` géré via `prisma as any` → migration à finaliser
- [ ] `LeaveRequest` : service à vérifier
- [ ] Backup automatique vers Google Drive (reporté)
- [ ] Microsoft 365 + OneDrive pour documents partagés (5 utilisateurs)
- [ ] Modification inline des données dans les tableaux

---

## Règles TVA (Luxembourg)

| Situation | TVA | Mention |
|-----------|-----|---------|
| Client LU | 3/8/14/17% | Taux + montant |
| B2B intra-UE | 0% | Art. 44 Dir. 2006/112/CE |
| B2C intra-UE | 17% | Taux + montant |
| B2B/B2C hors UE | 0% | Art. 45 loi TVA LU |

Taux normal par défaut : **17%**

---

## Commandes clés

```bash
# Dev local
cd backend && npm run start:dev
cd frontend && npm run dev

# Déploiement prod
cd /opt/inee && git pull
cd frontend && NEXT_PUBLIC_API_URL=https://app.inee.lu/api npx next build --webpack
pm2 restart inee-frontend
docker compose build backend && docker compose up -d backend

# Migration BDD prod
DATABASE_URL='postgresql://inee_user:${DB_PASSWORD}@172.19.0.2:5432/inee_db' \
npx prisma@7.8.0 migrate dev --name <nom>
```
