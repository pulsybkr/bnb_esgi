import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('sender_id').references('id').inTable('users').onDelete('CASCADE')
      table.uuid('recipient_id').references('id').inTable('users').onDelete('CASCADE')
      table.uuid('reservation_id').references('id').inTable('reservations').onDelete('CASCADE')
      table.text('content').notNullable()
      table.boolean('read').notNullable().defaultTo(false)
      table.timestamp('read_at').nullable()
      table.enum('type', ['reservation', 'support', 'general']).notNullable().defaultTo('general')
      table.timestamp('sent_at').notNullable().defaultTo(this.now())

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}