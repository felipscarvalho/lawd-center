import { inject } from '@adonisjs/core'
import { errors as authErrors } from '@adonisjs/auth'
import User from '#models/administration/user'
import PermissionService from '#services/administration/permission_service'
import InvalidCredentialsException from '#exceptions/administration/invalid_credentials_exception'
import type { CurrentUserOutput, LoginInput, LoginOutput } from '#dtos/administration/auth'

@inject()
export default class AuthService {
  constructor(protected permissionService: PermissionService) {}

  /** Valida e-mail e senha e cria um access token; usuários desativados não entram */
  async login(input: LoginInput): Promise<LoginOutput> {
    let user: User

    try {
      user = await User.verifyCredentials(input.email.toLowerCase(), input.password)
    } catch (error) {
      if (error instanceof authErrors.E_INVALID_CREDENTIALS) throw new InvalidCredentialsException()
      throw error
    }

    if (!user.isActive) {
      throw new InvalidCredentialsException()
    }

    const token = await User.accessTokens.create(user)

    return { user, token: token.value!.release() }
  }

  /** Revoga o token usado na requisição atual */
  async logout(user: User, tokenIdentifier: string | number | BigInt): Promise<void> {
    await User.accessTokens.delete(user, tokenIdentifier)
  }

  /** Usuário autenticado com as permissões efetivas (usado pelo front para montar menus e telas) */
  async currentUser(user: User): Promise<CurrentUserOutput> {
    const permissions = await this.permissionService.getEffectivePermissions(user.id)

    return { user, permissions }
  }
}
