import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Accommodation from './accommodation.js'

export default class Photo extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare accommodationId: string

  @column()
  declare url: string

  @column()
  declare thumbnailUrl: string | null

  @column()
  declare isMain: boolean

  @column()
  declare order: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Accommodation, {
    foreignKey: 'accommodationId',
  })
  declare accommodation: BelongsTo<typeof Accommodation>
}