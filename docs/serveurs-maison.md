# Serveurs maison pour l'activité INEE

> Objectif : héberger en interne (« à la maison » / sur site) les **services web et
> applications** de l'activité INEE, afin d'éviter de dépendre de serveurs en ligne
> (cloud, hébergeurs tiers). Ce document compare les options matérielles et logicielles,
> et liste les points de vigilance.

## 1. Pourquoi auto-héberger (et ce que ça implique)

**Avantages**
- Maîtrise totale des données (aucune donnée chez un tiers).
- Pas d'abonnement mensuel récurrent : on paie le matériel une fois.
- Indépendance vis-à-vis des coupures de service d'un hébergeur.
- Idéal pour un usage **en réseau local** (LAN) ou via VPN.

**Contraintes à accepter**
- **Disponibilité** : si la machine, l'électricité ou Internet tombe, le service tombe.
  Un hébergeur en ligne garantit souvent 99,9 %+ de disponibilité ; chez soi, c'est à toi de l'assurer.
- **Maintenance** : mises à jour, sauvegardes, sécurité = ton travail.
- **Accès depuis l'extérieur** : exposer un service sur Internet depuis chez soi demande
  des précautions (voir §5). Si l'usage reste **interne**, c'est beaucoup plus simple.
- **Consommation électrique** : une machine allumée 24/7 a un coût (voir §6).

> Règle pratique : l'auto-hébergement est excellent pour un usage **interne ou semi-privé**.
> Pour un service public à fort trafic et haute disponibilité, le cloud reste souvent plus simple.

## 2. Options matérielles (de la plus légère à la plus puissante)

| Option | Idéal pour | Conso | Coût indicatif | Remarques |
|---|---|---|---|---|
| **Raspberry Pi 5** (8 Go) | 1–3 petits services web, domotique, tests | ~5–10 W | 80–120 € + carte/SSD | Silencieux, faible conso. Limité en RAM/CPU. |
| **Mini-PC** (Intel N100 / N305) | Plusieurs apps, conteneurs Docker, base de données | ~10–20 W | 150–350 € | **Meilleur rapport perf/conso/prix** pour débuter sérieusement. |
| **Vieux PC recyclé** | Tout-en-un, apprentissage, gros stockage | 40–100 W | 0 € (existant) | Gratuit mais plus énergivore et plus bruyant. |
| **NAS** (Synology, QNAP, ou DIY) | Stockage + apps légères (le NAS fait aussi serveur) | 15–40 W | 250–600 € | Intègre disques, sauvegarde et apps. Très pratique. |
| **Station/serveur dédié** (Xeon/Ryzen, ECC) | Forte charge, virtualisation, GPU | 80–250 W | 500 €+ | Pour de la charge sérieuse ou de la virtualisation. |

**Recommandation pour ton cas (services web internes, budget non décidé) :**
1. Si tu veux **tester sans rien acheter** → recycle un PC existant ou un Raspberry Pi.
2. Si tu veux **une base pérenne et discrète** → un **mini-PC Intel N100** est le meilleur point de départ
   (faible conso, assez puissant pour une dizaine de conteneurs).
3. Si tu as **aussi besoin de stockage/sauvegarde centralisé** → un **NAS** fait les deux.

## 3. Système d'exploitation et couche logicielle

| Besoin | Solution recommandée |
|---|---|
| OS de base, simple et stable | **Debian** ou **Ubuntu Server** (Linux, gratuit) |
| OS « tout-en-un » avec interface web | **CasaOS**, **Umbrel** ou **Yunohost** (installent les apps en un clic) |
| NAS clé en main | **Synology DSM** (commercial) ou **TrueNAS** / **OpenMediaVault** (gratuits) |
| Virtualisation / plusieurs VM | **Proxmox VE** (gratuit, très répandu en auto-hébergement) |
| Isolation des services | **Docker** + **Docker Compose** (standard pour héberger des apps web) |

> Pour héberger des **applications web**, la combinaison la plus courante et la plus
> maintenable aujourd'hui est : **Linux (Debian) + Docker Compose**, éventuellement
> derrière une interface comme **CasaOS** pour simplifier.

## 4. Exposer les services proprement (reverse proxy)

Pour servir plusieurs apps depuis une seule machine avec des URL propres et du HTTPS :
- **Caddy** : le plus simple, HTTPS automatique (recommandé pour débuter).
- **Nginx Proxy Manager** : interface web, facile à configurer.
- **Traefik** : puissant, idéal avec Docker (un peu plus technique).

## 5. Accès et sécurité

**Usage interne uniquement (réseau local)** — le plus sûr :
- Aucun port ouvert sur Internet. Accès via l'IP locale ou un nom local.
- Si besoin d'accès à distance : **VPN** (WireGuard, ou Tailscale/Cloudflare Tunnel
  pour la simplicité). C'est la méthode recommandée : pas d'exposition directe.

**Si tu dois exposer un service sur Internet** :
- Active **HTTPS** (Caddy/Let's Encrypt) systématiquement.
- Mets à jour le système régulièrement et utilise un **pare-feu** (ufw).
- Sépare les services (Docker) et limite les ports ouverts au strict nécessaire.
- IP fixe ou **DNS dynamique** (DuckDNS, etc.) si l'IP de ta box change.

## 6. Points de vigilance pratiques

- **Sauvegardes** : applique la règle **3-2-1** (3 copies, 2 supports, 1 hors site).
  Une sauvegarde hors site peut être un disque chez un proche, pas forcément du cloud.
- **Onduleur (UPS)** : protège contre les coupures de courant et les corruptions de données.
- **Coût électrique** : un appareil 15 W allumé 24/7 ≈ 130 kWh/an ≈ ~30 €/an (à ~0,23 €/kWh).
  Un vieux PC à 80 W ≈ ~160 €/an : le mini-PC est vite rentabilisé.
- **Refroidissement / bruit** : privilégie le fanless (Pi, mini-PC) pour un placement
  dans un lieu de vie.

## 7. Recommandation synthétique

Pour démarrer l'auto-hébergement des services web de l'INEE **sans surinvestir** :

1. **Matériel** : un mini-PC Intel N100 (ou recyclage d'un PC existant pour tester).
2. **OS** : Debian 12.
3. **Plateforme** : Docker + Docker Compose (option : CasaOS pour l'interface).
4. **Accès** : réseau local + **WireGuard/Tailscale** pour l'accès distant sécurisé.
5. **Reverse proxy** : Caddy (HTTPS automatique).
6. **Sauvegarde** : règle 3-2-1 + onduleur.

Cette base couvre la grande majorité des besoins d'hébergement de services web internes,
reste extensible, et évite toute dépendance à un serveur en ligne.

---

> Document de référence — à affiner selon les services précis à héberger (nombre
> d'utilisateurs, applications visées, besoins de stockage). N'hésite pas à préciser
> ces points pour une recommandation matérielle plus exacte.
