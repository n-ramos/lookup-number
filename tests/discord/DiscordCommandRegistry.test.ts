import test from 'node:test'
import assert from 'node:assert/strict'
import DiscordCommandRegistry from '../../bot/discord/DiscordCommandRegistry.ts'

type AnyObj = Record<string, any>

function fakeCommand(name: string): AnyObj {
  return {
    data: { name },
    execute: async () => {},
    toJSON: () => ({ name }),
  }
}

test('registry stores and retrieves commands by name', () => {
  const registry = new DiscordCommandRegistry()
  const command = fakeCommand('lookup-number')

  registry.register(command as any)

  assert.equal(registry.find('lookup-number'), command)
  assert.equal(registry.all().length, 1)
})

test('registry rejects duplicate command names', () => {
  const registry = new DiscordCommandRegistry()
  registry.register(fakeCommand('lookup-number') as any)

  assert.throws(
    () => registry.register(fakeCommand('lookup-number') as any),
    /Duplicate Discord command name/
  )
})
