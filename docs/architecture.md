# Architecture

## Flux global

1. `DatagouvService` résout les URLs des ressources ARCEP.
2. `ArcepSyncService` télécharge et parse les CSV.
3. Import vers `operators_staging` et `number_ranges_staging`.
4. Nettoyage des ranges orphelines.
5. Swap atomique des tables staging vers actives.
6. Lookup API utilise les tables actives.
7. Chaque lookup alimente la table `lookup_stats`.

## Modules clés

- `app/Services/datagouv_service.ts`
- `app/Services/arcep_sync_service.ts`
- `app/Services/number_normalize_service.ts`
- `app/Services/risk_scoring_service.ts`
- `app/Controllers/Http/lookup_controller.ts`
- `app/Controllers/Http/admin_sync_controller.ts`
- `app/Controllers/Http/admin_lookup_stats_controller.ts`

## Tables PostgreSQL

- `operators`
- `number_ranges`
- `operators_staging`
- `number_ranges_staging`
- `dataset_versions`
- `lookup_stats`

## Route map

- `GET /health`
- `GET /v1/lookup`
- `POST /admin/sync/arcep`
- `GET /admin/lookup/stats`
- `GET /docs`
- `GET /openapi.yaml`
- `GET /fr`
- `GET /en`
- `GET /` (redirige selon `Accept-Language`)
