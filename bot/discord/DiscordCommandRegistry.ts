import DiscordCommand from './DiscordCommand.ts'

export default class DiscordCommandRegistry {
  private readonly byName = new Map<string, DiscordCommand>()

  register(command: DiscordCommand) {
    const name = command.data.name
    if (this.byName.has(name)) {
      throw new Error(`Duplicate Discord command name: ${name}`)
    }
    this.byName.set(name, command)
    return this
  }

  all(): DiscordCommand[] {
    return [...this.byName.values()]
  }

  find(name: string): DiscordCommand | undefined {
    return this.byName.get(name)
  }
}
