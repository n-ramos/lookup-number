import test from 'node:test'
import assert from 'node:assert/strict'
import { loadDiscordBotConfig } from '../../bot/discord/config.ts'

function withEnv(values: Record<string, string | undefined>, fn: () => Promise<void> | void) {
  const previous: Record<string, string | undefined> = {}

  for (const key of Object.keys(values)) {
    previous[key] = process.env[key]
    const next = values[key]
    if (next === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = next
    }
  }

  const restore = () => {
    for (const key of Object.keys(values)) {
      const old = previous[key]
      if (old === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = old
      }
    }
  }

  try {
    const result = fn()
    if (result && typeof (result as Promise<void>).then === 'function') {
      return (result as Promise<void>).finally(restore)
    }
    restore()
    return undefined
  } catch (error) {
    restore()
    throw error
  }
}

test('loadDiscordBotConfig loads required fields', () =>
  withEnv(
    {
      DISCORD_BOT_TOKEN: 'token',
      DISCORD_APP_ID: 'app',
      DISCORD_API_BASE_URL: 'http://localhost:3333',
    },
    () => {
      const config = loadDiscordBotConfig()
      assert.equal(config.token, 'token')
      assert.equal(config.appId, 'app')
      assert.equal(config.apiBaseUrl, 'http://localhost:3333')
    }
  ))

test('loadDiscordBotConfig throws when required env vars are missing', () =>
  withEnv(
    {
      DISCORD_BOT_TOKEN: undefined,
      DISCORD_APP_ID: undefined,
    },
    () => {
      assert.throws(() => loadDiscordBotConfig(), /Missing required env var/)
    }
  ))
