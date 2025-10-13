import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Reservation from './reservation.js'
import User from './user.js'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare reservationId: string

  @column()
  declare userId: string

  @column()
  declare amount: number

  @column()
  declare currency: string

  @column()
  declare status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'cancelled'

  @column()
  declare paymentMethod: 'mobile_money' | 'card' | 'paypal'

  @column()
  declare mobileMoneyOperator: string | null

  @column()
  declare transactionReference: string | null

  @column()
  declare externalReference: string | null

  @column()
  declare paymentDetails: any

  @column()
  declare errorMessage: string | null

  @column.dateTime()
  declare transactionDate: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Reservation, {
    foreignKey: 'reservationId',
  })
  declare reservation: BelongsTo<typeof Reservation>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>
}