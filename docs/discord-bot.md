# Bot Discord

## Objectif

Fournir une architecture de commandes extensible autour d'une classe de base `DiscordCommand`.

## Structure

- `bot/discord/DiscordCommand.ts` (classe abstraite)
- `bot/discord/DiscordCommandRegistry.ts` (registry)
- `bot/discord/commands/*` (implémentations)
- `bot/discord/register.ts` (enregistrement des slash commands)
- `bot/discord/start.ts` (runtime bot)

## Variables d'environnement

- `DISCORD_BOT_TOKEN`
- `DISCORD_APP_ID`
- `DISCORD_API_BASE_URL=http://127.0.0.1:3333`

## Sécurité guild

Le bot accepte les commandes depuis toutes les guilds où il est invité.
Le contrôle se fait via les permissions configurées dans Discord.

## Commandes disponibles

- `/lookup-number number:<string>`

## Enregistrer les commandes

```bash
pnpm run discord:register
```

## Lancer le bot

```bash
pnpm run discord:start
```

## Déploiement Dokploy (bot)

Déployer le bot dans un service séparé de l'API:

1. Créer un service Dokploy pointant sur ce repo.
2. Utiliser la commande de démarrage:
   - `pnpm run discord:start`
3. Renseigner les variables d'environnement Discord.
4. Définir `DISCORD_API_BASE_URL` vers l'URL publique de l'API Adonis.
5. Ne pas exposer de port (le bot n'a pas d'HTTP public).

## Enregistrement des slash commands sur Dokploy

Après déploiement initial (ou ajout de commande), exécuter une fois:

```bash
pnpm run discord:register
```

## Ajouter une nouvelle commande

1. Créer une classe `extends DiscordCommand`.
2. Déclarer son `SlashCommandBuilder`.
3. Implémenter `execute(context)`.
4. L'enregistrer dans `bot/discord/commands/index.ts`.
5. Relancer `pnpm run discord:register`.
