# Vue d'ensemble

## Objectif

Cette application AdonisJS v6 + TypeScript + Lucid + PostgreSQL:
- télécharge les ressources CSV ARCEP via data.gouv.fr,
- importe les données en tables staging,
- active les nouvelles données via swap atomique,
- expose des endpoints de lookup et d'administration,
- calcule un score de risque (KAV operators),
- stocke des statistiques de lookup.

## Features principales

- Lookup opérateur: `GET /v1/lookup?number=...`
- Sync manuelle API: `POST /admin/sync/arcep`
- Sync CLI: `node ace sync:arcep`
- Progression CLI: logs en temps réel pendant la sync
- Swagger UI: `GET /docs`
- OpenAPI YAML: `GET /openapi.yaml`
- UI lookup i18n: `/fr`, `/en`, redirection locale sur `/`
- Stats de requêtes lookup: `GET /admin/lookup/stats`

## Stack

- Node.js
- AdonisJS v6
- TypeScript
- Lucid ORM
- PostgreSQL
- pnpm

## Démarrage rapide

```bash
docker compose up -d
pnpm install
cp .env.example .env
node ace migration:run
node ace sync:arcep
node ace serve --watch
```

Test rapide:

```bash
curl -sS "http://127.0.0.1:3333/health"
curl -sS "http://127.0.0.1:3333/v1/lookup?number=%2B33%206%2012%2034%2056%2078"
```
