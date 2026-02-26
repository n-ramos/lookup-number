import { BaseSchema } from '@adonisjs/lucid/schema'

export default class LookupStatsDropOperatorFk1700000002000 extends BaseSchema {
  async up() {
    await this.schema.raw('ALTER TABLE lookup_stats DROP CONSTRAINT IF EXISTS lookup_stats_operator_code_foreign')
  }

  async down() {
    await this.schema.raw(`
      UPDATE lookup_stats s
      SET operator_code = NULL
      WHERE operator_code IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM operators o WHERE o.code = s.operator_code)
    `)

    await this.schema.raw(`
      ALTER TABLE lookup_stats
      ADD CONSTRAINT lookup_stats_operator_code_foreign
      FOREIGN KEY (operator_code)
      REFERENCES operators(code)
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `)
  }
}
