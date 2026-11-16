import { inject } from '@adonisjs/core'
import { errors as authErrors } from '@adonisjs/auth'
import hash from '@adonisjs/core/services/hash'
import User from '#models/administration/user'
import PermissionService from '#services/administration/permission_service'
import InvalidCredentialsException from '#exceptions/administration/invalid_credentials_exception'
import BusinessRuleException from '#exceptions/administration/business_rule_exception'
import type {
  ChangePasswordInput,
  CurrentUserOutput,
  LoginInput,
  LoginOutput,
} from '#dtos/administration/auth'

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
    await user.load('profile')

    return { user, token: token.value!.release() }
  }

  /** Revoga o token usado na requisição atual */
  async logout(user: User, tokenIdentifier: string | number | BigInt): Promise<void> {
    await User.accessTokens.delete(user, tokenIdentifier)
  }

  /**
   * Troca a própria senha conferindo a atual. As outras sessões (tokens) são encerradas;
   * a sessão usada na troca continua válida.
   */
  async changePassword(
    user: User,
    currentTokenIdentifier: string | number | BigInt,
    input: ChangePasswordInput
  ): Promise<void> {
    const isCurrentPasswordValid = await hash.verify(user.password, input.currentPassword)

    if (!isCurrentPasswordValid) {
      throw new BusinessRuleException(
        'A senha atual está incorreta',
        'E_INVALID_CURRENT_PASSWORD',
        'currentPassword'
      )
    }

    user.password = input.newPassword
    await user.save()

    const tokens = await User.accessTokens.all(user)
    const otherTokens = tokens.filter(
      (token) => String(token.identifier) !== String(currentTokenIdentifier)
    )

    for (const token of otherTokens) {
      await User.accessTokens.delete(user, token.identifier)
    }
  }

  /** Usuário autenticado com as permissões efetivas (usado pelo front para montar menus e telas) */
  async currentUser(user: User): Promise<CurrentUserOutput> {
    const permissions = await this.permissionService.getEffectivePermissions(user.id)
    await user.load('profile')

    return { user, permissions }
  }
}
