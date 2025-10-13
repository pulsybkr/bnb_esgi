import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Photo from './photo.js'
import Availability from './availability.js'
import Reservation from './reservation.js'
import Favorite from './favorite.js'
import Amenity from './amenity.js'

export default class Accommodation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare ownerId: string

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare address: string

  @column()
  declare city: string

  @column()
  declare country: string

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare type: 'house' | 'apartment' | 'room' | 'hotel'

  @column()
  declare roomsCount: number

  @column()
  declare capacity: number

  @column()
  declare pricePerNight: number

  @column()
  declare currency: string

  @column()
  declare amenities: any

  @column()
  declare houseRules: any

  @column()
  declare status: 'active' | 'suspended' | 'archived'

  @column()
  declare averageRating: number | null

  @column()
  declare reviewsCount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'ownerId',
  })
  declare owner: BelongsTo<typeof User>

  @hasMany(() => Photo, {
    foreignKey: 'accommodationId',
  })
  declare photos: HasMany<typeof Photo>

  @hasMany(() => Availability, {
    foreignKey: 'accommodationId',
  })
  declare availabilities: HasMany<typeof Availability>

  @hasMany(() => Reservation, {
    foreignKey: 'accommodationId',
  })
  declare reservations: HasMany<typeof Reservation>

  @hasMany(() => Favorite, {
    foreignKey: 'accommodationId',
  })
  declare favorites: HasMany<typeof Favorite>

  @manyToMany(() => Amenity, {
    pivotTable: 'accommodation_amenities',
    localKey: 'id',
    pivotForeignKey: 'accommodation_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'amenity_id',
  })
  declare amenitiesRelation: ManyToMany<typeof Amenity>
}