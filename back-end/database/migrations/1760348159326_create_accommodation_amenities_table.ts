import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accommodation_amenities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('accommodation_id').notNullable().references('id').inTable('accommodations').onDelete('CASCADE')
      table.integer('amenity_id').unsigned().notNullable().references('id').inTable('amenities').onDelete('CASCADE')
      
      // Empêcher les doublons
      table.unique(['accommodation_id', 'amenity_id'])

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}