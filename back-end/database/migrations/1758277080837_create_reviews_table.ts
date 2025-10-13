import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reviews'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('reservation_id').references('id').inTable('reservations').onDelete('CASCADE')
      table.uuid('author_id').references('id').inTable('users').onDelete('CASCADE')
      table.uuid('target_id').references('id').inTable('users').onDelete('CASCADE')
      table.enum('target_type', ['accommodation', 'traveler', 'owner']).notNullable()
      table.integer('rating').notNullable().checkBetween([1, 5])
      table.text('comment').nullable()
      table.json('detailed_ratings').nullable()
      table.text('owner_response').nullable()
      table.timestamp('response_date').nullable()
      table.boolean('reported').notNullable().defaultTo(false)
      table.text('report_reason').nullable()
      table.enum('status', ['published', 'hidden', 'moderated']).notNullable().defaultTo('published')
      table.timestamp('published_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}