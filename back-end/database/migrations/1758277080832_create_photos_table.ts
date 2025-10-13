import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'photos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('accommodation_id').references('id').inTable('accommodations').onDelete('CASCADE')
      table.string('url').notNullable()
      table.string('thumbnail_url').nullable()
      table.boolean('is_main').notNullable().defaultTo(false)
      table.integer('order').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}