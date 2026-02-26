import DiscordCommandRegistry from '../DiscordCommandRegistry.ts'
import LookupNumberCommand from './LookupNumberCommand.ts'

export function createDiscordCommandRegistry(): DiscordCommandRegistry {
  return new DiscordCommandRegistry().register(new LookupNumberCommand())
}
