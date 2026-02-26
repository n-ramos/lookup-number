import { Client, Events, GatewayIntentBits, InteractionType } from 'discord.js'
import { createDiscordCommandRegistry } from './commands/index.ts'
import { loadDiscordBotConfig } from './config.ts'

async function main() {
  const config = loadDiscordBotConfig()
  const registry = createDiscordCommandRegistry()

  const client = new Client({ intents: [GatewayIntentBits.Guilds] })

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`[discord] Logged in as ${readyClient.user.tag}`)
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.type !== InteractionType.ApplicationCommand || !interaction.isChatInputCommand()) {
      return
    }

    const command = registry.find(interaction.commandName)
    if (!command) {
      await interaction.reply({ content: `Unknown command: ${interaction.commandName}`, ephemeral: true })
      return
    }

    try {
      await command.execute({ interaction, config })
    } catch (error) {
      console.error(error)
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply('An error occurred while running this command.')
      } else {
        await interaction.reply({ content: 'An error occurred while running this command.', ephemeral: true })
      }
    }
  })

  await client.login(config.token)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
