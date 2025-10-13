import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Accommodation from './accommodation.js'

export default class Favorite extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare accommodationId: string

  @column()
  declare privateNote: string | null

  @column.dateTime()
  declare addedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Accommodation, {
    foreignKey: 'accommodationId',
  })
  declare accommodation: BelongsTo<typeof Accommodation>
}