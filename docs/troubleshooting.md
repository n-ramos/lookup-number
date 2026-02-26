# Dépannage

## Erreur TRUNCATE FK

Message fréquent:
`cannot truncate a table referenced in a foreign key constraint`

Cause:
- tentative de `TRUNCATE` d'une table référencée sans inclure la table enfant.

Solution appliquée dans le projet:
- tronquer les tables staging ensemble, avec table référencée en premier:

```sql
TRUNCATE TABLE number_ranges_staging, operators_staging RESTART IDENTITY
```

## Lookup ne trouve pas un numéro connu

Vérifier:
- la sync a été exécutée (`node ace sync:arcep`),
- le format numéro (`+33 6 12 34 56 78` est accepté),
- la présence des ranges/operators en base,
- la version active dans `dataset_versions`.

## Serveur ne démarre pas

Checklist:
- `.env` présent et complet,
- Postgres en ligne,
- migrations appliquées,
- port `3333` libre.

Commandes:

```bash
node ace migration:run
node ace serve --watch
```

## Discord bot ne répond pas

Vérifier:
- token/app id valides,
- commandes enregistrées,
- permissions Discord du bot sur le serveur,
- `DISCORD_API_BASE_URL` correcte et API joignable.
