import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  TZ: Env.schema.string.optional(),
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string(),
  APP_KEY: Env.schema.string(),

  LOG_LEVEL: Env.schema.string.optional(),

  DB_CONNECTION: Env.schema.string(),
  PG_HOST: Env.schema.string(),
  PG_PORT: Env.schema.number(),
  PG_USER: Env.schema.string(),
  PG_PASSWORD: Env.schema.string(),
  PG_DB_NAME: Env.schema.string(),

  DATAGOUV_NUMEROTATION_DATASET: Env.schema.string(),
  DATAGOUV_OPERATORS_DATASET: Env.schema.string(),
  DATAGOUV_MAJNUM_TITLE_INCLUDES: Env.schema.string(),
  DATAGOUV_OPERATORS_TITLE_INCLUDES: Env.schema.string(),

  ARCEP_CSV_ENCODING: Env.schema.string(),
  ARCEP_CSV_DELIMITER: Env.schema.string(),

  SCHEDULER_ENABLED: Env.schema.boolean.optional(),
  SCHEDULER_CRON: Env.schema.string.optional(),
})
