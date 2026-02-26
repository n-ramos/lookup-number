import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Operator from './operator.ts'

export default class NumberRange extends BaseModel {
  public static table = 'number_ranges'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'start_num' })
  declare startNum: string

  @column({ columnName: 'end_num' })
  declare endNum: string

  @column({ columnName: 'operator_code' })
  declare operatorCode: string

  @column()
  declare sourceVersion: string

  @belongsTo(() => Operator, { foreignKey: 'operatorCode' })
  declare operator: BelongsTo<typeof Operator>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
