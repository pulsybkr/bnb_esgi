import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Report extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare reporterId: string

  @column()
  declare contentType: 'accommodation' | 'review' | 'user' | 'message'

  @column()
  declare contentId: string

  @column()
  declare reason: 'inappropriate_content' | 'fake' | 'spam' | 'other'

  @column()
  declare description: string | null

  @column()
  declare status: 'pending' | 'processed' | 'rejected'

  @column()
  declare moderatorId: string | null

  @column()
  declare decision: string | null

  @column.dateTime()
  declare processedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'reporterId',
  })
  declare reporter: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'moderatorId',
  })
  declare moderator: BelongsTo<typeof User>
}