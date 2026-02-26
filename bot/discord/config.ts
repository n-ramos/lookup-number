import process from 'node:process'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

export type DiscordBotConfig = {
  token: string
  appId: string
  apiBaseUrl: string
}

export function loadDiscordBotConfig(): DiscordBotConfig {
  return {
    token: required('DISCORD_BOT_TOKEN'),
    appId: required('DISCORD_APP_ID'),
    apiBaseUrl: process.env.DISCORD_API_BASE_URL || 'http://127.0.0.1:3333',
  }
}
