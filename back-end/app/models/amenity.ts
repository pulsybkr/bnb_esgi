import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Accommodation from './accommodation.js'

export default class Amenity extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare icon: string | null

  @column()
  declare description: string | null

  @column()
  declare category: 'basic' | 'comfort' | 'security' | 'entertainment'

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Accommodation, {
    pivotTable: 'accommodation_amenities',
    localKey: 'id',
    pivotForeignKey: 'amenity_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'accommodation_id',
  })
  declare accommodations: ManyToMany<typeof Accommodation>
}