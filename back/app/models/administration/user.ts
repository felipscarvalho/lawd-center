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

/** Validade do link de convite enviado por e-mail */
export const invitationExpiresInDays = 7

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  static accessTokens = DbAccessTokensProvider.forModel(User)

  /** Tokens dos convites para criar a senha (só o hash fica no banco) */
  static invitationTokens = DbAccessTokensProvider.forModel(User, {
    table: 'user_invitation_tokens',
    type: 'invitation',
    prefix: 'inv_',
    expiresIn: `${invitationExpiresInDays} days`,
  })

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

  /** Convite ainda não aceito: a pessoa não definiu nome e senha e não consegue entrar */
  get isPending() {
    return this.password === null
  }

  /**
   * Quem ainda não aceitou o convite não tem senha: o login responde como senha errada (o padrão
   * do mixin lançaria erro). O hash é calculado mesmo assim para o tempo de resposta não revelar o caso.
   */
  async verifyPassword(plainPassword: string) {
    if (this.password === null) {
      await hash.make(plainPassword)
      return false
    }

    return super.verifyPassword(plainPassword)
  }
}
