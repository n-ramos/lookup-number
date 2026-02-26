# Tests

## Lancer les tests

```bash
pnpm test
```

## Couverture actuelle

- Normalisation numéro
- Scoring KAV
- Lookup controller (fallback candidats + requestCount)
- Admin stats controller
- Admin sync controller
- Datagouv service (sélection de resource)
- Discord command registry
- Discord config parsing

## Fichiers de test

- `tests/services/number_normalize_service.test.ts`
- `tests/services/risk_scoring_service.test.ts`
- `tests/services/datagouv_service.test.ts`
- `tests/controllers/lookup_controller.test.ts`
- `tests/controllers/admin_lookup_stats_controller.test.ts`
- `tests/controllers/admin_sync_controller.test.ts`
- `tests/discord/DiscordCommandRegistry.test.ts`
- `tests/discord/config.test.ts`

## Notes

Les tests sont unitaires et injectent des mocks (DB/services) sans dépendance à une base réelle.
