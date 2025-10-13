import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Reservation from './reservation.js'
import User from './user.js'

export default class Review extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare reservationId: string

  @column()
  declare authorId: string

  @column()
  declare targetId: string

  @column()
  declare targetType: 'accommodation' | 'traveler' | 'owner'

  @column()
  declare rating: number

  @column()
  declare comment: string | null

  @column()
  declare detailedRatings: any

  @column()
  declare ownerResponse: string | null

  @column.dateTime()
  declare responseDate: DateTime | null

  @column()
  declare reported: boolean

  @column()
  declare reportReason: string | null

  @column()
  declare status: 'published' | 'hidden' | 'moderated'

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Reservation, {
    foreignKey: 'reservationId',
  })
  declare reservation: BelongsTo<typeof Reservation>

  @belongsTo(() => User, {
    foreignKey: 'authorId',
  })
  declare author: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'targetId',
  })
  declare target: BelongsTo<typeof User>
}