import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Accommodation from './accommodation.js'

export default class Availability extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare accommodationId: string

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime

  @column()
  declare status: 'available' | 'reserved' | 'blocked'

  @column()
  declare customPrice: number | null

  @column()
  declare note: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Accommodation, {
    foreignKey: 'accommodationId',
  })
  declare accommodation: BelongsTo<typeof Accommodation>
}