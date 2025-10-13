import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('phone', 20).nullable().unique()
      table.string('password').notNullable()
      table.text('address').nullable()
      table.string('city').nullable()
      table.string('country').nullable()
      table.enum('user_type', ['tenant', 'owner', 'admin']).notNullable().defaultTo('tenant')
      table.boolean('email_verified').notNullable().defaultTo(false)
      table.boolean('phone_verified').notNullable().defaultTo(false)
      table.string('profile_photo').nullable()
      table.json('preferences').nullable()
      table.enum('status', ['active', 'suspended', 'inactive']).notNullable().defaultTo('active')
      table.timestamp('registration_date').notNullable().defaultTo(this.now())
      table.timestamp('last_login').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}