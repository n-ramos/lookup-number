# Sync ARCEP

## Commandes

Sync directe:

```bash
node ace sync:arcep
```

Via script bash:

```bash
./scripts/sync_arcep.sh
```

Avec préparation auto (`docker`, deps, migrations):

```bash
./scripts/sync_arcep.sh --prepare
```

## Progression terminal

La commande Ace `sync:arcep` log la progression:
- résolution des ressources data.gouv
- version sélectionnée
- truncate staging
- import operators
- import ranges
- swap atomique

## Stratégie staging + swap

1. Import dans `operators_staging`, `number_ranges_staging`
2. Validation tailles minimales
3. Suppression des ranges orphelines
4. Rename atomique:
   - `number_ranges <-> number_ranges_staging`
   - `operators <-> operators_staging`
5. `ANALYZE`
6. insertion `dataset_versions`

## Point important FK / TRUNCATE

Le projet évite de tronquer les tables actives. Le `TRUNCATE` cible uniquement les tables staging:
- `number_ranges_staging`
- `operators_staging`

Ordre actuel dans le service:

```sql
TRUNCATE TABLE number_ranges_staging, operators_staging RESTART IDENTITY
```

L'ordre inclut la table référencée avant la table référente pour éviter l'erreur FK.
