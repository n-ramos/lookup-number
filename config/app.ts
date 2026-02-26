import env from '#start/env'
import { defineConfig } from '@adonisjs/core/http'

export default {
  appUrl: `http://${env.get('HOST')}:${env.get('PORT')}`,
  http: defineConfig({}),
}
