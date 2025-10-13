import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Accommodation from './accommodation.js'
import User from './user.js'
import Payment from './payment.js'
import Message from './message.js'
import Review from './review.js'

export default class Reservation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare accommodationId: string

  @column()
  declare tenantId: string

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime

  @column()
  declare guestsCount: number

  @column()
  declare totalAmount: number

  @column()
  declare currency: string

  @column()
  declare status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress'

  @column()
  declare tenantMessage: string | null

  @column()
  declare cancellationReason: string | null

  @column.dateTime()
  declare cancellationDate: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Accommodation, {
    foreignKey: 'accommodationId',
  })
  declare accommodation: BelongsTo<typeof Accommodation>

  @belongsTo(() => User, {
    foreignKey: 'tenantId',
  })
  declare tenant: BelongsTo<typeof User>

  @hasOne(() => Payment, {
    foreignKey: 'reservationId',
  })
  declare payment: HasOne<typeof Payment>

  @hasMany(() => Message, {
    foreignKey: 'reservationId',
  })
  declare messages: HasMany<typeof Message>

  @hasMany(() => Review, {
    foreignKey: 'reservationId',
  })
  declare reviews: HasMany<typeof Review>
}