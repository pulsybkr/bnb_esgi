import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Reservation from './reservation.js'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare senderId: string

  @column()
  declare recipientId: string

  @column()
  declare reservationId: string

  @column()
  declare content: string

  @column()
  declare read: boolean

  @column.dateTime()
  declare readAt: DateTime | null

  @column()
  declare type: 'reservation' | 'support' | 'general'

  @column.dateTime()
  declare sentAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'senderId',
  })
  declare sender: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'recipientId',
  })
  declare recipient: BelongsTo<typeof User>

  @belongsTo(() => Reservation, {
    foreignKey: 'reservationId',
  })
  declare reservation: BelongsTo<typeof Reservation>
}