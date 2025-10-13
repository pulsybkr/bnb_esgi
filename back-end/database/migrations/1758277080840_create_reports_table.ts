import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('reporter_id').references('id').inTable('users').onDelete('CASCADE')
      table.enum('content_type', ['accommodation', 'review', 'user', 'message']).notNullable()
      table.uuid('content_id').notNullable()
      table.enum('reason', ['inappropriate_content', 'fake', 'spam', 'other']).notNullable()
      table.text('description').nullable()
      table.enum('status', ['pending', 'processed', 'rejected']).notNullable().defaultTo('pending')
      table.uuid('moderator_id').references('id').inTable('users').onDelete('SET NULL').nullable()
      table.text('decision').nullable()
      table.timestamp('processed_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}