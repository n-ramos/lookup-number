import { SlashCommandBuilder } from 'discord.js'
import DiscordCommand, { type DiscordCommandContext } from '../DiscordCommand.ts'

export default class LookupNumberCommand extends DiscordCommand {
  readonly data = new SlashCommandBuilder()
    .setName('lookup-number')
    .setDescription('Lookup un numero via l API ARCEP')
    .addStringOption((option) =>
      option.setName('number').setDescription('Numero a rechercher').setRequired(true)
    )

  async execute({ interaction, config }: DiscordCommandContext): Promise<void> {
    const number = interaction.options.getString('number', true)

    await interaction.deferReply()

    const url = new URL('/v1/lookup', config.apiBaseUrl)
    url.searchParams.set('number', number)

    const response = await fetch(url)
    if (!response.ok) {
      await interaction.editReply(`Lookup failed (${response.status})`)
      return
    }

    const data: any = await response.json()
    if (!data.found) {
      const count = Number(data.requestCount ?? 0)
      await interaction.editReply(`Not found for "${number}" (requests: ${count})`)
      return
    }

    const score = Number(data?.risk?.score ?? 0)
    const flags = Array.isArray(data?.risk?.flags) ? data.risk.flags.join(', ') : '-'
    const count = Number(data.requestCount ?? 0)

    await interaction.editReply(
      [
        `Found: ${data.operatorName ?? '-'} (${data.operatorCode ?? '-'})`,
        `Range: ${data.rangeStart ?? '-'} -> ${data.rangeEnd ?? '-'}`,
        `Risk: ${score}% (${flags || '-'})`,
        `Requests: ${count}`,
      ].join('\n')
    )
  }
}
