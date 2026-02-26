import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Operator extends BaseModel {
  public static table = 'operators'

  @column({ isPrimary: true })
  declare code: string

  @column()
  declare name: string

  @column()
  declare sourceVersion: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
