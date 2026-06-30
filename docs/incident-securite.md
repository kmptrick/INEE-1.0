# Incident de sécurité — Serveur INEE (Hetzner `178.105.159.65`)

> Document interne. Rédigé le **2026-06-30**.
> Branche : `claude/ollama-pricing-rsenm8`.
> **Confidentiel** — ne pas committer de secrets en clair dans ce fichier.

---

## 1. Résumé exécutif

Le serveur de production (Hetzner, `app.inee.lu`, héberge INEE + Scolaria + n8n)
a été **compromis**. Trois familles de logiciels malveillants ont été identifiées
et **confirmées de façon indépendante** (analyse VirusTotal lancée par le
propriétaire du serveur, ~30 moteurs antivirus) :

1. **XMRig** — cryptomineur Monero (`cpu-logind`), consomme le CPU pour miner.
2. **Outil de déni de service (DDoS / flood TCP)** — process `100UP-TCP` / `filevZQtR6`.
3. **gs-netcat (Global Socket)** — porte dérobée (backdoor) chiffrée, masquée sous
   le nom de process `[raid5wq]`, avec watchdog de persistance (`nullbyte`).

Les trois charges ont été **stoppées, mises en quarantaine et privées de
persistance** pendant l'investigation. Le serveur **n'est toutefois PAS digne de
confiance** tant qu'il n'a pas été reconstruit à neuf (voir §6).

**Vecteur d'entrée le plus probable :** mauvaise configuration applicative
(secret de session par défaut sur Scolaria + backends exposés directement à
Internet), **pas** un vol d'identifiants SSH.

---

## 2. Chronologie des constats

> Heures serveur. Reconstituées pendant la session de diagnostic du 2026-06-30.

| Moment | Constat |
|--------|---------|
| ~07:50 (jour J) | Fichier `config.json` du mineur **écrit le jour même** → activité fraîche, pas un vieux résidu. |
| Minutes avant le scan | **Connexion C2 active** observée vers l'extérieur (gs-netcat). |
| Investigation | Process malveillants vivants : `cpu-logind` (XMRig), `100UP-TCP`/`filevZQtR6` (DDoS), `[raid5wq]`/`nullbyte` (backdoor). |
| Investigation | Persistance via **crontab de `appuser`** (`@reboot … ./cpu-logind`) + cron base64 relançant `nullbyte` (gs-netcat). |
| Investigation | **Accès SSH root propre** : seule l'IP du propriétaire (`178.249.195.212`) depuis le 7 juin → **pas** d'intrusion par SSH. |

---

## 3. Preuves (Indicators of Compromise)

### Binaires / fichiers
- `/var/tmp/cpu-logind` (+ `config.json`) — **XMRig**. Quarantaine : `/root/quarantaine/cpu-logind` (chmod 000).
  - SHA256 confirmé sur **VirusTotal** comme `Trojan:Linux/CoinMiner` / `XMRig` par 30+ moteurs.
- `/home/appuser/.config/htop/nullbyte` (+ `nullbyte.dat`) — **gs-netcat** (backdoor Global Socket).
- Process DDoS : `100UP-TCP` / `filevZQtR6`.

### Persistance (supprimée)
- Crontab `appuser` :
  `@reboot cd /var/tmp && nohup ./cpu-logind -c config.json >/dev/null 2>&1 &`
- Cron watchdog (décodé depuis base64) :
  `pkill -0 -U1000 nullbyte || … GS_ARGS="-k …/nullbyte.dat -liqD" /usr/bin/bash -c "exec -a '[raid5wq]' '…/nullbyte'"`

### Réseau (bloqué via iptables)
- IP C2 gs-netcat : `152.53.173.29`
- Pool de minage + cible(s) DDoS : bloquées également.

### Configuration à risque
- **Backends exposés à Internet hors nginx :**
  - `inee-backend` → `0.0.0.0:3001`
  - `claude-backend` → `0.0.0.0:3008→3007`
  - (n8n `127.0.0.1:5678` et `inee-postgres` `127.0.0.1:5432` étaient correctement liés au localhost.)
- **Serveur mutualisé à forte surface d'attaque :** une seule machine héberge de
  nombreuses applications, **toutes lancées sous l'utilisateur `appuser` (UID 1000)**
  via pm2 — `inee-frontend`, `inee-website`, `inee2-backend`, `inee2-frontend`,
  `multipos-frontend`, `resto-frontend`, `scolaria-frontend` — **plus n8n**.
  Or le malware tournait précisément sous `appuser`/UID 1000.
- **n8n sous `appuser` — VECTEUR LE PLUS PROBABLE :** n8n est **exposé publiquement**
  sur `https://n8n.inee.lu` (nginx → `localhost:5678`, certificat Let's Encrypt) et
  ses variables d'environnement **ne contiennent ni `N8N_BASIC_AUTH_ACTIVE` ni
  `N8N_USER_MANAGEMENT`**. Les nœuds *Code* / *Execute Command* de n8n exécutent des
  commandes shell **sous `appuser` (UID 1000)** — exactement l'utilisateur sous lequel
  tournaient le mineur, le watchdog et la backdoor. Une instance n8n exposée et
  faiblement/non authentifiée est le vecteur classique des compromissions
  « XMRig + gs-netcat as appuser ». **À confirmer par la version de n8n (CVE connues)
  et l'historique d'exécutions.**
- **Deux services Node tournant en `root`** (PID 47531 `node dist/src/main.js`,
  PID 166384 `node server.js`) — à identifier ; un service web exposé en root = RCE → root direct.
- **UID orphelin :** `/opt/scolaria` appartenait à l'UID numérique `197609`
  (sans utilisateur correspondant), signe d'un déploiement par archive extraite en
  préservant les UID d'une autre machine. Normalisé en `appuser:appuser`.

### Scolaria — fallback de secret (NON exploité, durci par précaution)
- `middleware.ts` / `crypto.ts` contenaient `process.env.SESSION_SECRET || "dev-insecure-secret"`.
- **Réévaluation :** `SESSION_SECRET` était en réalité **défini (66 caractères)** dans
  `/opt/scolaria/.env`, donc le fallback ne se déclenchait jamais → **cookies non
  forgeables**. Ce n'était **pas** le vecteur d'entrée. `session.ts` possédait déjà
  une garde fail-closed en production.
- **Durci malgré tout** (défense en profondeur) : fallbacks remplacés par des gardes
  fail-closed dans `middleware.ts` et `crypto.ts` (le déchiffrement des clés Mobile
  Money est préservé car la clé reste dérivée de `SESSION_SECRET`). Recompilé et
  redéployé (`scolaria-frontend`).
- **Scolaria — uploads data-URI :** `my-contract/route.ts` (~5 Mo) et
  `school-settings/route.ts` (logo `data:image/...`). Points d'entrée à durcir/valider.

---

## 3bis. Investigation du vecteur — résultat

Le **vecteur d'entrée exact reste indéterminé**, et c'est un résultat attendu : sur
une machine où une backdoor a disposé des droits d'effacer ses traces, l'entrée ne
peut pas être prouvée de façon fiable en lisant la machine compromise. **La
remédiation ne dépend pas de cette réponse** (voir §6–7).

| Candidat | Verdict |
|----------|---------|
| Backend INEE (NestJS) | **Écarté** — aucun `child_process`/`exec`/`eval`, aucun upload. |
| Accès SSH | **Écarté** — root propre, uniquement l'IP du propriétaire depuis le 7 juin. |
| Scolaria — fallback `SESSION_SECRET` | **Écarté** — `SESSION_SECRET` était défini (66 car.), fallback jamais déclenché. Durci par précaution. |
| n8n (`n8n.inee.lu`) | **Non confirmé** — n8n 2.26.8 avec mur de login (`/rest/login` → 401) **et 2FA active sur le compte owner** ; aucun IOC dans la base n8n (workflows ni exécutions : pas de `executeCommand`, `child_process`, `/dev/tcp`, `stratum+tcp`, ni IP C2). Admin protégé par login+2FA. Reste théoriquement une CVE pré-auth de la 2.26.8 ou un webhook malveillant (aucun trouvé), mais sans preuve. |

> Constat n8n : `965 × n8n-nodes-base.code` (usage légitime normal du nœud *Code*),
> et **zéro** indicateur de compromission. La piste n8n est plausible mais
> **non démontrée**.

## 4. Périmètre — ce qui a été écarté

- **INEE (backend NestJS)** : aucun appel `child_process`/`exec`/`eval`, aucun
  upload de fichier (pas de multer). Contrôleurs CRUD standards. → **Probablement
  PAS le vecteur d'entrée.**
- **Accès SSH** : root propre, uniquement l'IP du propriétaire. → **Pas** une
  intrusion par identifiants SSH volés.
- **Scolaria (code)** : aucune RCE par injection de commande trouvée dans le code
  source réel (hors `.next`/`node_modules`). Le risque est **de configuration**
  (voir §3), pas une ligne d'exploit identifiable.

---

## 5. Actions déjà réalisées (confinement)

- [x] Tous les process malveillants **tués** (`cpu-logind`, `100UP-TCP`/`filevZQtR6`, `[raid5wq]`/`nullbyte`).
- [x] Persistance **supprimée** : crontab `appuser` vidé (`crontab -r -u appuser`), cron watchdog retiré.
- [x] Binaires **mis en quarantaine** (chmod 000) dans `/root/quarantaine/`.
- [x] IP C2 / pool / cibles DDoS **bloquées** via iptables.
- [x] Compromission **confirmée indépendamment** via VirusTotal.
- [x] **Durcissement code Scolaria** : fallbacks `dev-insecure-secret` remplacés par
  des gardes fail-closed (`middleware.ts`, `crypto.ts`), propriété fichiers normalisée
  (`appuser`), recompilé et redéployé.
- [x] **Fermeture de l'exposition des backends** : `inee-backend` (3001) et
  `claude-backend` (3008) repassés de `0.0.0.0` à **`127.0.0.1`** dans
  `/opt/inee/docker-compose.yml` (sauvegarde `.bak.avant-bind`). nginx les sert
  toujours en local (`app.inee.lu` / `claude.inee.lu` → 200) — accès direct Internet
  coupé, zéro coupure de service.
- [x] **Fermeture de l'exposition des frontends Next** (process hôte pm2, ports
  3000/3003/3005/3006/3007/3100) : règles **iptables + ip6tables** (`ACCEPT` sur `lo`,
  `DROP` externe sur ces ports). Accès direct par IP:port coupé ; accès par les domaines
  via nginx intact (tous les sites répondent 200/307). Réversible (`iptables -D`).

> ⚠️ Le confinement **ne suffit pas**. Une machine compromise par une backdoor
> doit être considérée comme définitivement non fiable → reconstruction (§6).

---

## 6. Plan de reconstruction (recommandé)

1. **Nouveau serveur** propre (nouvelle VM Hetzner), ne **rien** copier en binaire
   depuis l'ancien.
2. **Redéploiement depuis Git** uniquement (code source vérifié), pas depuis les
   tarballs présents sur la machine compromise.
3. **Base de données** : restaurer depuis une sauvegarde **antérieure à la
   compromission** (cf. backups `/opt/backups/inee_*.sql.gz`, rétention 30 j).
   Vérifier l'intégrité avant restauration.
4. **Rotation de TOUS les secrets** (voir §7) — considérer tout secret ayant
   transité sur l'ancien serveur comme **divulgué**.
5. Bascule DNS `app.inee.lu` vers le nouveau serveur une fois validé, puis
   **mise hors ligne / destruction** de l'ancien.

---

## 7. Durcissement (checklist)

- [x] **Lier les backends au localhost** (`127.0.0.1`) — fait (docker-compose).
- [x] **Bloquer l'accès direct aux frontends Next** — fait (iptables/ip6tables).
- [x] **Rendre les règles iptables persistantes** — fait (`netfilter-persistent`).
- [x] **`SESSION_SECRET` Scolaria** : fallback `"dev-insecure-secret"` supprimé
      (`middleware.ts`, `crypto.ts`) → démarrage fail-closed si secret absent.
- [x] **Accès admin n8n** : login + **2FA déjà active** sur le compte owner → admin
      protégé sans restriction IP (accessible de partout). Webhooks publics conservés.
- [ ] **n8n — maintien à jour** (sur le serveur neuf) pour couvrir d'éventuelles CVE.
- [ ] **Isoler les applications** entre elles (utilisateurs/containers dédiés,
      moindre privilège ; `appuser` ne doit pas pouvoir installer de persistance
      système).
- [ ] **Rotation de tous les secrets** (⚠️ priorité — voir §10 pour la liste détaillée) :
  - Mot de passe PostgreSQL INEE (`inee_user`) — était en clair dans plusieurs fichiers
    du **dépôt PUBLIC `INEE-1.0`** → exposé publiquement, **à changer en TOUT premier**.
  - Mot de passe PostgreSQL resto (`resto_user`).
  - JWT secret(s), `SESSION_SECRET` Scolaria, identifiants SMTP/Nodemailer, clés API
    (Anthropic, Brevo…).
- [ ] **Valider/restreindre les uploads** Scolaria (type MIME réel, taille,
      stockage hors webroot exécutable).
- [ ] **Pare-feu par défaut DENY** entrant, n'ouvrir que 80/443 (+ SSH restreint à
      l'IP du propriétaire).
- [ ] **Mises à jour** système et dépendances ; surveillance (alerte CPU anormal,
      connexions sortantes inhabituelles).

---

## 8. Conformité — RGPD / CNPD

Scolaria et INEE traitent des **données à caractère personnel** (clients, contrats,
écoles). Une backdoor avec accès potentiel super-admin constitue une **violation de
données personnelles** au sens du RGPD.

- **Évaluer** si des données personnelles ont pu être consultées/exfiltrées.
- **Notification CNPD** (autorité luxembourgeoise) sous **72 h** après prise de
  connaissance, sauf si la violation est peu susceptible d'engendrer un risque
  pour les personnes concernées (à documenter).
- **Tenir un registre** de l'incident (constats, mesures, décisions) — ce document
  en constitue la base.
- **Informer les personnes concernées** si risque élevé.

> Ceci est une orientation, pas un avis juridique. Faire valider la décision de
> notification par un conseil compétent.

---

## 9. Suivi

| Action | Statut | Responsable |
|--------|--------|-------------|
| Confinement (kill + persistance + quarantaine + iptables) | ✅ Fait | — |
| Confirmation indépendante (VirusTotal) | ✅ Fait | — |
| Durcissement Scolaria + backends/frontends fermés + iptables persistant | ✅ Fait | — |
| Sauvegarde du code des apps sur GitHub privé | ✅ Fait | — |
| Nouveau serveur + redéploiement Git | ⬜ À faire | — |
| Restauration DB depuis backup sain | ⬜ À faire | — |
| **Rotation de tous les secrets** (dont le mot de passe PostgreSQL exposé publiquement) | ⬜ **Priorité** | — |
| Évaluation + notification CNPD si nécessaire | ⬜ À faire | — |

---

## 10. Sauvegarde du code & secrets découverts

### Apps sauvegardées sur GitHub (dépôts **privés**, compte `kmptrick`)
Réalisé le 2026-06-30, depuis le serveur, avec un PAT temporaire (révoqué après) jamais
écrit sur disque (helper d'identifiant éphémère). Pour chaque app : `.gitignore`
(exclut `.env`, `node_modules`, `.next`, `dist`, code généré Prisma), **scan anti-secrets
bloquant** avant push, commit propre (sans historique ancien).

- `scolaria`, `inee2`, `resto-pos`, `multipos`, `inee-website`, `claude-backend`
  (+ `INEE-1.0` déjà présent, **public**).

> ⚠️ Code poussé **depuis un serveur compromis** → à **réauditer** avant tout
> redéploiement (un éventuel implant dans le source n'est pas exclu, même si aucun
> n'a été détecté).

### Secrets de production repérés pendant la migration → À CHANGER
Le scan a empêché leur publication, mais ils existent en clair sur le serveur (et/ou
dans des dépôts) et doivent être **rotés** :

| Secret | Où | Gravité |
|--------|-----|---------|
| Mot de passe PostgreSQL INEE (`inee_user`) | `CLAUDE.md` + `docker-compose.yml` + `context-session1.md` du dépôt **PUBLIC INEE-1.0** (redacté ; reste dans l'historique Git) | ✅ **ROTÉ le 2026-06-30** (`ALTER USER`, nouveau mdp 48 car. ; inee-backend + claude-backend réalignés). L'ancien est mort. |
| Mot de passe PostgreSQL resto (`resto_user`) | `resto-pos/start-prod.sh` (exclu du push) | 🟠 Élevé — à roter |
| `SESSION_SECRET` Scolaria (66 car.) | `/opt/scolaria/.env` | 🟠 Élevé (a transité sur machine compromise) |
| Identifiants SMTP/Brevo, clé Anthropic | `.env` des apps | 🟠 Élevé |

Fichiers laissés **hors Git** car porteurs de secrets : `docker-compose.yml`,
`CLAUDE.md`, `context-session1.md` (inee2) ; `start-prod.sh` (resto-pos). À committer
plus tard en versions **assainies** (mots de passe → variables d'environnement).
