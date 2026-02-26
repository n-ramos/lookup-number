# Déploiement Dokploy (multi-services)

## Objectif

Déployer le projet avec 3 services dans un même projet Dokploy:
- `postgres` (base de données via template)
- `site-api` (API Adonis)
- `discord-bot` (worker Discord)

## Prérequis

- Repo Git connecté à Dokploy
- Variables Discord disponibles (`DISCORD_BOT_TOKEN`, `DISCORD_APP_ID`)
- Domaine (ou sous-domaine) pour l'API

## 1) Créer le projet Dokploy

1. Créer un nouveau projet (ex: `arcep-prod`).
2. Connecter le repository Git.

## 2) Service Postgres (template)

1. Ajouter un service via Template `PostgreSQL`.
2. Nom recommandé: `postgres`.
3. Définir:
   - `POSTGRES_DB=arcep`
   - `POSTGRES_USER=arcep`
   - `POSTGRES_PASSWORD=<mot_de_passe_fort>`
4. Activer volume persistant.
5. Déployer le service.

Note: utilise le hostname interne Dokploy du service Postgres (souvent le nom du service) pour `PG_HOST` côté API.

## 3) Service API Adonis (`site-api`)

1. Ajouter un service `Dockerfile` depuis le même repo.
2. Nom recommandé: `site-api`.
3. Build context: racine du repo.
4. Commande start:
   - `node bin/server.ts`
5. Exposer le port `3333`.
6. Configurer domaine/reverse proxy vers ce service.

### Variables d'environnement API

- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `PORT=3333`
- `APP_KEY=<cle_secrete_forte>`
- `LOG_LEVEL=info`
- `DB_CONNECTION=pg`
- `PG_HOST=postgres`
- `PG_PORT=5432`
- `PG_USER=arcep`
- `PG_PASSWORD=<mot_de_passe_fort>`
- `PG_DB_NAME=arcep`
- `DATAGOUV_NUMEROTATION_DATASET=ressources-en-numerotation-telephonique`
- `DATAGOUV_OPERATORS_DATASET=identifiants-de-communications-electroniques`
- `DATAGOUV_MAJNUM_TITLE_INCLUDES=MAJNUM`
- `DATAGOUV_OPERATORS_TITLE_INCLUDES=identifiants_CE`
- `ARCEP_CSV_ENCODING=windows-1252`
- `ARCEP_CSV_DELIMITER=;`

## 4) Service Discord bot (`discord-bot`)

1. Ajouter un second service `Dockerfile` (même repo).
2. Nom recommandé: `discord-bot`.
3. Ne pas exposer de port public.
4. Commande start:
   - `pnpm run discord:start`

### Variables d'environnement bot

- `DISCORD_BOT_TOKEN=<token_bot>`
- `DISCORD_APP_ID=<application_id>`
- `DISCORD_API_BASE_URL=https://api.ton-domaine.tld`

Le bot est global: toutes les guilds où il est invité sont supportées.

## 5) Initialisation après premier déploiement

Exécuter dans le service API (`site-api`) via console Dokploy:

```bash
node ace migration:run
node ace sync:arcep
```

Puis enregistrer les slash commands dans le service bot (`discord-bot`):

```bash
pnpm run discord:register
```

## 6) Vérifications

### API

```bash
curl -sS https://api.ton-domaine.tld/health
curl -sS "https://api.ton-domaine.tld/v1/lookup?number=%2B33%206%2012%2034%2056%2078"
```

### Bot

- Inviter le bot sur un serveur Discord avec les permissions nécessaires.
- Tester `/lookup-number`.

## 7) Mises à jour

À chaque release:

1. Redeploy `site-api`.
2. Redeploy `discord-bot`.
3. Si nouvelles migrations:
   - `node ace migration:run`
4. Si nouvelles commandes Discord:
   - `pnpm run discord:register`

## 8) Dépannage rapide

- API KO: vérifier variables DB + reachabilité `postgres`.
- `lookup` vide: relancer `node ace sync:arcep`.
- Bot silencieux: vérifier `DISCORD_BOT_TOKEN`, `DISCORD_APP_ID`, `DISCORD_API_BASE_URL`.
- Slash command absente: relancer `pnpm run discord:register`.
- Boucle reboot avec `Cannot find module /app/build/start/env.ts`:
  - la commande du service API doit être `node bin/server.ts`
  - retirer tout override `node bin/server.js` ou `cd build && ...`
  - redeployer l'image après mise à jour
