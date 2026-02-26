import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import type { DiscordBotConfig } from './config.ts'

export type DiscordCommandContext = {
  interaction: ChatInputCommandInteraction
  config: DiscordBotConfig
}

export default abstract class DiscordCommand {
  abstract readonly data: SlashCommandBuilder
  abstract execute(context: DiscordCommandContext): Promise<void>

  toJSON() {
    return this.data.toJSON()
  }
}
