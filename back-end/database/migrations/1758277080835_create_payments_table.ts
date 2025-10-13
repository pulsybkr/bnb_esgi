import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('reservation_id').references('id').inTable('reservations').onDelete('CASCADE')
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.decimal('amount', 10, 2).notNullable()
      table.string('currency', 3).notNullable().defaultTo('EUR')
      table.enum('status', ['pending', 'succeeded', 'failed', 'refunded', 'cancelled']).notNullable().defaultTo('pending')
      table.enum('payment_method', ['mobile_money', 'card', 'paypal']).notNullable()
      table.string('mobile_money_operator').nullable()
      table.string('transaction_reference').nullable()
      table.string('external_reference').nullable()
      table.json('payment_details').nullable()
      table.text('error_message').nullable()
      table.timestamp('transaction_date').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}