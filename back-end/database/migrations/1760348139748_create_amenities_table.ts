import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'amenities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').notNullable().unique()
      table.string('icon').nullable() // Icône pour l'affichage (ex: 'wifi', 'pool', 'parking')
      table.text('description').nullable()
      table.enum('category', ['basic', 'comfort', 'security', 'entertainment']).notNullable().defaultTo('basic')
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}