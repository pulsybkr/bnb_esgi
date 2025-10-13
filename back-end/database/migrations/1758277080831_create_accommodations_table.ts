import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accommodations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('owner_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('title').notNullable()
      table.text('description').notNullable()
      table.text('address').notNullable()
      table.string('city').notNullable()
      table.string('country').notNullable()
      table.decimal('latitude', 10, 8).nullable()
      table.decimal('longitude', 11, 8).nullable()
      table.enum('type', ['house', 'apartment', 'room', 'hotel']).notNullable()
      table.integer('rooms_count').notNullable()
      table.integer('capacity').notNullable()
      table.decimal('price_per_night', 10, 2).notNullable()
      table.string('currency', 3).notNullable().defaultTo('EUR')
      table.json('amenities').nullable()
      table.json('house_rules').nullable()
      table.enum('status', ['active', 'suspended', 'archived']).notNullable().defaultTo('active')
      table.float('average_rating').nullable().defaultTo(0)
      table.integer('reviews_count').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}