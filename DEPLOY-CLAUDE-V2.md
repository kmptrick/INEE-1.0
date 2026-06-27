# Déploiement v2 — Appli Claude multi-utilisateurs (comptes + admin + fichiers)

Cette version ajoute un **backend** (`claude-backend/`) : comptes, login persistant,
administration, import de fichiers/liens, et la clé API Claude **partagée côté serveur**
(les utilisateurs ne saisissent plus aucune clé).

Architecture :
- `claude-app/` → frontend statique (login + chat + admin), servi par nginx sur `/`
- `claude-backend/` → API Node/Express en Docker (port **3007**), proxifiée par nginx sur `/api`
- Base PostgreSQL dédiée **`claude_db`** dans le conteneur `inee-postgres` existant

---

## Étape 1 — Pousser le code (PC Windows)

```powershell
cd "C:\PERSO\INEE 1.0"
git add claude-app claude-backend claude-nginx.conf docker-compose.yml DEPLOY-CLAUDE-V2.md
git commit -m "feat: appli Claude multi-utilisateurs (backend, comptes, admin, fichiers)"
git push
```

---

## Étape 2 — Variables d'environnement (serveur)

Le backend lit ses secrets depuis `/opt/inee/.env`. Connecte-toi et ajoute-les :

```bash
ssh root@app.inee.lu
cd /opt/inee

# Clé API Claude partagée (depuis console.anthropic.com)
echo 'ANTHROPIC_API_KEY=sk-ant-VOTRE_CLE'      >> .env
# Compte administrateur initial (créé au 1er démarrage)
echo 'CLAUDE_ADMIN_EMAIL=admin@inee.lu'        >> .env
echo 'CLAUDE_ADMIN_PASSWORD=UnMotDePasseFort'  >> .env
echo 'CLAUDE_ADMIN_NAME=Patrick'               >> .env
```

> `JWT_SECRET` est déjà présent dans ton `.env` (réutilisé). Vérifie : `grep JWT_SECRET .env`.
> Si absent : `echo "JWT_SECRET=$(openssl rand -hex 64)" >> .env`

---

## Étape 3 — Créer la base de données dédiée

```bash
docker exec inee-postgres psql -U inee_user -d inee_db -c "CREATE DATABASE claude_db;"
```
(Si elle existe déjà, le message « already exists » est sans gravité.)

---

## Étape 4 — Récupérer le code + démarrer le backend

```bash
cd /opt/inee && git pull
docker compose build claude-backend
docker compose up -d claude-backend

# Vérifier que ça tourne et que la clé est bien lue :
docker logs claude-backend --tail 20
curl -s http://127.0.0.1:3007/api/health      # -> {"ok":true,"hasKey":true}
```

> `hasKey:true` confirme que la clé API est chargée. Si `false`, revois l'étape 2 puis
> `docker compose up -d claude-backend`.

---

## Étape 5 — Brancher nginx (/api → 3007)

Édite le fichier nginx actif de claude.inee.lu et ajoute le bloc `location /api/`
**à l'intérieur** du `server { ... listen 443 ... }` :

```bash
nano /etc/nginx/sites-enabled/claude.inee.lu
```

Colle ce bloc juste avant la ligne `location / {` :

```nginx
    location /api/ {
        proxy_pass http://127.0.0.1:3007;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_buffering off;
        chunked_transfer_encoding on;
    }
```

Assure-toi aussi que le `server` contient bien (normalement déjà le cas) :
```nginx
    root /opt/inee/claude-app;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
```

Puis :
```bash
nginx -t && systemctl reload nginx
```
(Le fichier de référence complet est `claude-nginx.conf` à la racine du repo.)

---

## Étape 6 — Tester

1. Ouvre **https://claude.inee.lu** → un écran de **connexion** apparaît.
2. Connecte-toi avec `CLAUDE_ADMIN_EMAIL` / `CLAUDE_ADMIN_PASSWORD` (étape 2).
3. Menu ☰ → **🛡️ Administration** → crée des comptes pour ton équipe.
4. Teste : envoie un message, crée un projet, joins un fichier 📎 ou un lien.

L'appli **reste connectée** (session de 180 jours) : pas besoin de se reconnecter à chaque ouverture.

---

## Mises à jour futures

```powershell
# Frontend uniquement (PC) :
git add claude-app/index.html && git commit -m "maj front" && git push
```
```bash
# Serveur : git pull suffit (statique, pas de rebuild)
cd /opt/inee && git pull
```
```bash
# Backend modifié : rebuild du conteneur
cd /opt/inee && git pull && docker compose build claude-backend && docker compose up -d claude-backend
```

---

## Dépannage

| Symptôme | Vérifier |
|----------|----------|
| `/api` renvoie 502 | `docker logs claude-backend --tail 30` ; conteneur up ? `docker ps \| grep claude` |
| Login échoue | compte admin créé ? `docker logs claude-backend \| grep init` |
| `hasKey:false` | la ligne `ANTHROPIC_API_KEY=` dans `/opt/inee/.env`, puis recréer le conteneur |
| Réponses non « streamées » | `proxy_buffering off;` présent dans le bloc nginx `/api/` |
| Erreur DB au démarrage | la base `claude_db` existe ? (étape 3) |

> Sécurité : la clé API n'est jamais envoyée au navigateur (le backend fait l'appel).
> Les mots de passe sont hachés (bcrypt). Les jetons de session sont signés (JWT).
