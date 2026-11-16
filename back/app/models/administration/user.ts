import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Membership from '#models/administration/membership'
import Profile from '#models/administration/profile'
import Technology from '#models/administration/technology'
import InterestArea from '#models/administration/interest_area'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  static accessTokens = DbAccessTokensProvider.forModel(User)

  @hasMany(() => Membership)
  declare memberships: HasMany<typeof Membership>

  /** Perfil da pessoa (pode ainda não existir: é criado no primeiro preenchimento) */
  @hasOne(() => Profile)
  declare profile: HasOne<typeof Profile>

  @manyToMany(() => Technology, { pivotTable: 'user_technologies' })
  declare technologies: ManyToMany<typeof Technology>

  @manyToMany(() => InterestArea, { pivotTable: 'user_interest_areas' })
  declare interestAreas: ManyToMany<typeof InterestArea>

  /** Usuários desativados não fazem login e não têm vínculos ativos */
  get isActive() {
    return this.deactivatedAt === null
  }
}
