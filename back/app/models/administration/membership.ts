import { MembershipSchema } from '#database/schema'
import { belongsTo, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { Position } from '#permissions/positions'
import User from '#models/administration/user'
import Directorate from '#models/administration/directorate'

/**
 * Vínculo de um usuário com uma diretoria, em um cargo, por um período.
 * ends_at nulo significa vínculo ativo.
 */
export default class Membership extends MembershipSchema {
  declare position: Position

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Directorate)
  declare directorate: BelongsTo<typeof Directorate>

  get isActive() {
    return this.endsAt === null
  }

  /** Apenas vínculos ativos */
  static active = scope((query) => {
    query.whereNull('ends_at')
  })
}
