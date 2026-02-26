import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Schema1700000000000 extends BaseSchema {
  async up() {
    this.schema.createTable('operators', (table) => {
      table.text('code').primary()
      table.text('name').notNullable()
      table.text('source_version').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.createTable('number_ranges', (table) => {
      table.bigIncrements('id')
      table.bigInteger('start_num').notNullable()
      table.bigInteger('end_num').notNullable()
      table.text('operator_code').notNullable().references('code').inTable('operators')
      table.text('source_version').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['start_num'], 'idx_number_ranges_start')
      table.index(['operator_code'], 'idx_number_ranges_operator')
    })

    this.schema.createTable('operators_staging', (table) => {
      table.text('code').primary()
      table.text('name').notNullable()
      table.text('source_version').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.createTable('number_ranges_staging', (table) => {
      table.bigIncrements('id')
      table.bigInteger('start_num').notNullable()
      table.bigInteger('end_num').notNullable()
      table.text('operator_code').notNullable()
      table.text('source_version').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['start_num'], 'idx_number_ranges_staging_start')
      table.index(['operator_code'], 'idx_number_ranges_staging_operator')
    })

    this.schema.createTable('dataset_versions', (table) => {
      table.bigIncrements('id')
      table.text('source').notNullable()
      table.text('source_version').notNullable()
      table.text('etag').nullable()
      table.text('last_modified').nullable()
      table.timestamp('downloaded_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.bigInteger('row_count').notNullable().defaultTo(0)
      table.text('status').notNullable()
      table.index(['source'], 'idx_dataset_versions_source')
    })
  }

  async down() {
    this.schema.dropTable('dataset_versions')
    this.schema.dropTable('number_ranges_staging')
    this.schema.dropTable('operators_staging')
    this.schema.dropTable('number_ranges')
    this.schema.dropTable('operators')
  }
}
