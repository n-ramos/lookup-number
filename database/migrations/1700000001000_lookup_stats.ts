import { BaseSchema } from '@adonisjs/lucid/schema'

export default class LookupStats1700000001000 extends BaseSchema {
  async up() {
    this.schema.createTable('lookup_stats', (table) => {
      table.text('number_digits').primary()
      table.bigInteger('request_count').notNullable().defaultTo(1)
      table.boolean('found').notNullable().defaultTo(false)
      table.text('operator_code').nullable().references('code').inTable('operators')
      table.integer('risk_score').notNullable().defaultTo(0)
      table.jsonb('risk_flags').notNullable().defaultTo('[]')
      table.timestamp('first_seen_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('last_seen_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['request_count'], 'idx_lookup_stats_request_count')
      table.index(['last_seen_at'], 'idx_lookup_stats_last_seen_at')
      table.index(['operator_code'], 'idx_lookup_stats_operator_code')
    })
  }

  async down() {
    this.schema.dropTable('lookup_stats')
  }
}
