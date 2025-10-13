import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('title').notNullable()
      table.text('content').notNullable()
      table.enum('type', ['reservation', 'payment', 'message', 'review', 'system']).notNullable()
      table.json('data').nullable()
      table.boolean('read').notNullable().defaultTo(false)
      table.timestamp('read_at').nullable()
      table.timestamp('sent_at').notNullable().defaultTo(this.now())

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}