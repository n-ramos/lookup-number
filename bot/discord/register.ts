import { REST, Routes } from 'discord.js'
import { loadDiscordBotConfig } from './config.ts'
import { createDiscordCommandRegistry } from './commands/index.ts'

async function main() {
  const config = loadDiscordBotConfig()
  const registry = createDiscordCommandRegistry()
  const body = registry.all().map((command) => command.toJSON())

  const rest = new REST({ version: '10' }).setToken(config.token)
  await rest.put(Routes.applicationCommands(config.appId), { body })
  console.log(`[discord] Registered ${body.length} global commands`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
