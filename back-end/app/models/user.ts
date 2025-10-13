import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, computed, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Accommodation from './accommodation.js'
import Reservation from './reservation.js'
import Message from './message.js'
import Review from './review.js'
import Favorite from './favorite.js'
import Payment from './payment.js'
import Notification from './notification.js'
import Report from './report.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare address: string | null

  @column()
  declare city: string | null

  @column()
  declare country: string | null

  @column()
  declare userType: 'tenant' | 'owner' | 'admin'

  @column()
  declare emailVerified: boolean

  @column()
  declare phoneVerified: boolean

  @column()
  declare profilePhoto: string | null

  @column()
  declare preferences: any

  @column()
  declare status: 'active' | 'suspended' | 'inactive'

  @column.dateTime()
  declare registrationDate: DateTime

  @column.dateTime()
  declare lastLogin: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }

  @hasMany(() => Accommodation, {
    foreignKey: 'ownerId',
  })
  declare ownedAccommodations: HasMany<typeof Accommodation>

  @hasMany(() => Reservation, {
    foreignKey: 'tenantId',
  })
  declare reservations: HasMany<typeof Reservation>

  @hasMany(() => Message, {
    foreignKey: 'senderId',
  })
  declare sentMessages: HasMany<typeof Message>

  @hasMany(() => Message, {
    foreignKey: 'recipientId',
  })
  declare receivedMessages: HasMany<typeof Message>

  @hasMany(() => Review, {
    foreignKey: 'authorId',
  })
  declare authoredReviews: HasMany<typeof Review>

  @hasMany(() => Review, {
    foreignKey: 'targetId',
  })
  declare receivedReviews: HasMany<typeof Review>

  @hasMany(() => Favorite, {
    foreignKey: 'userId',
  })
  declare favorites: HasMany<typeof Favorite>

  @hasMany(() => Payment, {
    foreignKey: 'userId',
  })
  declare payments: HasMany<typeof Payment>

  @hasMany(() => Notification, {
    foreignKey: 'userId',
  })
  declare notifications: HasMany<typeof Notification>

  @hasMany(() => Report, {
    foreignKey: 'reporterId',
  })
  declare reports: HasMany<typeof Report>

  @hasMany(() => Report, {
    foreignKey: 'moderatorId',
  })
  declare moderatedReports: HasMany<typeof Report>
}