# ARCEP lookup API (AdonisJS v6 + Postgres)

Documentation complète:
- index: `docs/README.md`
- API: `docs/api.md`
- sync ARCEP: `docs/sync-arcep.md`
- Docker/Dokploy: `docs/deployment-dokploy.md`
- bot Discord: `docs/discord-bot.md`
- dépannage: `docs/troubleshooting.md`

API REST qui :
- récupère les **CSV officiels** via l'API data.gouv.fr,
- importe en **staging**,
- valide,
- puis **swap atomique** vers les tables actives,
- expose `/v1/lookup?number=...`
- expose `/admin/sync/arcep` (à protéger plus tard)

Sources officielles :
- Dataset numérotation: https://www.data.gouv.fr/api/1/datasets/ressources-en-numerotation-telephonique/
- Dataset identifiants opérateurs: https://www.data.gouv.fr/api/1/datasets/identifiants-de-communications-electroniques/

## Prérequis
- Node.js 24+
- Docker (pour Postgres)

## Démarrage

### 1) Postgres (Docker)
```bash
docker compose up -d
```

### 2) Installer les deps
```bash
pnpm install
cp .env.example .env
# mets APP_KEY (random) et ajuste si besoin
```

### 3) Migrations
```bash
pnpm run migration:run
```

### 4) Import initial ARCEP
```bash
pnpm run sync:arcep
```

### 5) Lancer l’API
```bash
pnpm run dev
```

Test:
```bash
curl "http://localhost:3333/v1/lookup?number=+33612345678"
```

## Tests unitaires

Lancer tous les tests:
```bash
pnpm test
```

La réponse inclut aussi un scoring risque:
```json
{
  "found": true,
  "operatorCode": "....",
  "operatorName": "....",
  "risk": {
    "score": 0,
    "flags": []
  }
}
```

## Scoring KAV (FR_KAV_OPERATORS)

Règle actuelle:
- si `operatorCode` appartient à `FR_KAV_OPERATORS`:
  - `score = 100`
  - `flags` contient `"KAV_OPERATOR"`
- sinon:
  - `score = 0`

## MAJ automatique (optionnel)

### Option A — Cron système
Planifie:
```bash
cd /path/to/project && pnpm run sync:arcep
```

### Option B — Scheduler Node (inclus)
Dans `.env`:
```
SCHEDULER_ENABLED=true
SCHEDULER_CRON=0 3 * * *
```
Puis:
```bash
pnpm run scheduler
```

## Lancement serveur (convention Adonis)

- Développement:
  - `node ace serve --watch`
  - ou `pnpm run dev`
- Production:
  - `NODE_ENV=production pnpm run start`

## Discord bot (optionnel)

Le bot suit une architecture extensible:
- base abstraite: `bot/discord/DiscordCommand.ts`
- registry: `bot/discord/DiscordCommandRegistry.ts`
- commandes: `bot/discord/commands/*.ts`

Commande incluse:
- `/lookup-number number:<string>` -> appelle `/v1/lookup`

### Variables d env bot
```bash
DISCORD_BOT_TOKEN=...
DISCORD_APP_ID=...
DISCORD_API_BASE_URL=http://127.0.0.1:3333
```

Sécurité:
- le bot est utilisable dans toutes les guilds où il est invité
- contrôle d'accès via permissions Discord au moment de l'invitation

### Enregistrer les slash commands
```bash
pnpm run discord:register
```

### Lancer le bot
```bash
pnpm run discord:start
```

### Ajouter une nouvelle commande
1) créer une classe `extends DiscordCommand` dans `bot/discord/commands`
2) l enregistrer dans `bot/discord/commands/index.ts`
3) relancer `pnpm run discord:register`

## Si MAJNUM n’est pas détecté
Le dataset contient plusieurs ressources. Le projet choisit MAJNUM par un match sur le titre:
`DATAGOUV_MAJNUM_TITLE_INCLUDES=MAJNUM`

Si ça ne match pas:
1) ouvre l’API dataset
2) regarde `resources[].title`
3) ajuste la variable

## Docker / Dokploy

Le projet inclut un `Dockerfile` prêt pour Dokploy:
- image runtime Node 24 + pnpm
- démarrage via `node bin/server.ts`

Variables d'environnement minimales à configurer sur Dokploy:
- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `PORT=3333`
- `APP_KEY`
- `DB_CONNECTION`, `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DB_NAME`
- `DATAGOUV_*`, `ARCEP_*` selon ton setup

Commande de démarrage API (Dokploy):
```bash
node bin/server.ts
```

Bot Discord sur Dokploy (service séparé):
- crée un second service depuis le même repo
- commande:
```bash
pnpm run discord:start
```
- variables bot à définir: `DISCORD_BOT_TOKEN`, `DISCORD_APP_ID`, `DISCORD_API_BASE_URL`
