import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reservations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('accommodation_id').references('id').inTable('accommodations').onDelete('CASCADE')
      table.uuid('tenant_id').references('id').inTable('users').onDelete('CASCADE')
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.integer('guests_count').notNullable()
      table.decimal('total_amount', 10, 2).notNullable()
      table.string('currency', 3).notNullable().defaultTo('EUR')
      table.enum('status', ['pending', 'confirmed', 'cancelled', 'completed', 'in_progress']).notNullable().defaultTo('pending')
      table.text('tenant_message').nullable()
      table.text('cancellation_reason').nullable()
      table.timestamp('cancellation_date').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}