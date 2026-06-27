# Déploiement de l'appli Claude sur `claude.inee.lu`

L'appli est un site **statique** (un seul `index.html` + scripts via CDN). Pas de build,
pas de base de données, pas de backend. On la sert via nginx, comme `resto.inee.lu`.

Fichiers ajoutés au repo :
- `claude-app/index.html` → l'appli (sera servie depuis `/opt/inee/claude-app/`)
- `claude-nginx.conf` → config nginx de référence (résultat final attendu)

---

## Étape 1 — DNS (chez ton registrar / panneau DNS de inee.lu)

Ajoute un enregistrement :

| Type | Nom    | Valeur                          |
|------|--------|---------------------------------|
| A    | claude | **<IP du serveur Hetzner>**     |

> L'IP est la même que `app.inee.lu`. Récupère-la dans la console Hetzner,
> ou sur ton PC : `ping app.inee.lu`.
> Attends que ça résolve : `nslookup claude.inee.lu` doit renvoyer l'IP avant l'étape 3.

---

## Étape 2 — Pousser le code (depuis ton PC Windows)

```powershell
cd "C:\PERSO\INEE 1.0"
git add claude-app claude-nginx.conf DEPLOY-CLAUDE.md
git commit -m "feat: appli Claude statique + config nginx claude.inee.lu"
git push
```

---

## Étape 3 — Sur le serveur (SSH)

```bash
ssh root@app.inee.lu

# 1) Récupérer les fichiers
cd /opt/inee && git pull

# 2) Localiser où vivent tes configs nginx (sites-enabled OU conf.d)
grep -rl "resto.inee.lu" /etc/nginx/    # te montre le dossier utilisé pour resto

# 3) Bloc HTTP minimal pour que certbot puisse valider le domaine
cat > /etc/nginx/sites-available/claude.inee.lu <<'EOF'
server {
    listen 80;
    server_name claude.inee.lu;
    root /opt/inee/claude-app;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
EOF
ln -sf /etc/nginx/sites-available/claude.inee.lu /etc/nginx/sites-enabled/claude.inee.lu
# (si tes configs sont dans conf.d/, mets plutôt le fichier dans /etc/nginx/conf.d/claude.inee.lu.conf)

nginx -t && systemctl reload nginx

# 4) Certificat SSL + activation HTTPS automatique
#    (installe certbot si absent : apt install -y certbot python3-certbot-nginx)
certbot --nginx -d claude.inee.lu
#    -> choisis "rediriger HTTP vers HTTPS" quand il le demande.

nginx -t && systemctl reload nginx
```

---

## Étape 4 — Vérifier

Ouvre **https://claude.inee.lu** sur ton téléphone.
1. Menu ⚙️ → colle ta clé API → Enregistrer.
2. Menu ☰ → « Installer sur l'écran d'accueil ».

---

## Mettre à jour l'appli plus tard

C'est du statique, donc aucun rebuild :

```powershell
# PC : modifie claude-app/index.html, puis
git add claude-app/index.html && git commit -m "maj appli claude" && git push
```
```bash
# Serveur :
cd /opt/inee && git pull   # le nouveau fichier est servi immédiatement
```

> Le renouvellement du certificat SSL est automatique (certbot installe un timer).
> Pour tester : `certbot renew --dry-run`.

---

## Note multi-utilisateurs (important)

Chaque personne qui ouvre `claude.inee.lu` aura **sa propre clé API** et **ses propres
conversations** stockées dans le navigateur de SON appareil (localStorage). Il n'y a pas
de compte central ni de données partagées : c'est volontaire et sans serveur.
Pour de vrais comptes partagés (login, historique synchronisé entre personnes),
il faudrait ajouter un backend + base de données — un projet séparé.
