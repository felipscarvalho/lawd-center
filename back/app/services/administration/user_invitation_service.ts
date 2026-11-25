import { inject } from '@adonisjs/core'
import { Secret } from '@adonisjs/core/helpers'
import db from '@adonisjs/lucid/services/db'
import User, { invitationExpiresInDays } from '#models/administration/user'
import AuthService from '#services/administration/auth_service'
import MailService from '#services/administration/mail_service'
import UserInvitationMail from '#mails/administration/user_invitation_mail'
import BusinessRuleException from '#exceptions/administration/business_rule_exception'
import InvalidInvitationException from '#exceptions/administration/invalid_invitation_exception'
import type { LoginOutput } from '#dtos/administration/auth'
import type {
  AcceptInvitationInput,
  InvitationOutput,
  InviteUserInput,
} from '#dtos/administration/invitation'

/**
 * Cadastro por convite: a gestão informa só o e-mail, a pessoa recebe um link para criar a senha
 * (e informar o nome) e entra no sistema. Enquanto não aceita, o usuário fica pendente (sem senha).
 */
@inject()
export default class UserInvitationService {
  constructor(
    protected authService: AuthService,
    protected mailService: MailService
  ) {}

  /** Cadastra o usuário pendente e envia o convite; se o e-mail não sair, o cadastro é desfeito */
  async invite(input: InviteUserInput): Promise<User> {
    const user = await User.create({
      email: input.email.toLowerCase(),
      fullName: null,
      password: null,
    })

    try {
      await this.sendInvitation(user)
    } catch (error) {
      await user.delete()
      throw error
    }

    return user
  }

  /** Novo link para quem ainda não aceitou (o anterior deixa de valer) */
  async resend(userId: number): Promise<User> {
    const user = await User.findOrFail(userId)

    if (!user.isActive) {
      throw new BusinessRuleException('Este usuário está desativado', 'E_USER_INACTIVE')
    }

    if (!user.isPending) {
      throw new BusinessRuleException(
        'Esta pessoa já aceitou o convite e criou a senha',
        'E_INVITATION_ALREADY_ACCEPTED'
      )
    }

    await this.sendInvitation(user)

    return user
  }

  /** Dados mostrados na página do convite; falha se o link não serve mais */
  async find(token: string): Promise<InvitationOutput> {
    const user = await this.findInvitedUser(token)

    return { email: user.email, fullName: user.fullName }
  }

  /** Define nome e senha, invalida os links de convite e já abre a sessão */
  async accept(token: string, input: AcceptInvitationInput): Promise<LoginOutput> {
    const user = await this.findInvitedUser(token)

    user.merge({ fullName: input.fullName, password: input.password })
    await user.save()

    await this.revokeInvitations(user.id)

    return this.authService.startSession(user)
  }

  /**
   * Gera um token novo e envia o link. Os tokens anteriores só são apagados depois que o e-mail
   * sai, para uma falha no envio não invalidar o link que a pessoa já tem.
   */
  private async sendInvitation(user: User): Promise<void> {
    const token = await User.invitationTokens.create(user)
    const link = this.mailService.frontUrl(
      `/invitation/${encodeURIComponent(token.value!.release())}`
    )

    try {
      await this.mailService.send(
        new UserInvitationMail({
          email: user.email,
          fullName: user.fullName,
          link,
          expiresInDays: invitationExpiresInDays,
        })
      )
    } catch (error) {
      await User.invitationTokens.delete(user, token.identifier)
      throw error
    }

    await this.revokeInvitations(user.id, token.identifier)
  }

  /** Apaga os tokens de convite do usuário (menos o informado, quando houver) */
  private async revokeInvitations(userId: number, keepTokenId?: string | number | BigInt) {
    const query = db.from('user_invitation_tokens').where('tokenable_id', userId)

    if (keepTokenId !== undefined) query.whereNot('id', String(keepTokenId))

    await query.delete()
  }

  /** Usuário dono do token, se o convite ainda vale (token válido, usuário ativo e pendente) */
  private async findInvitedUser(token: string): Promise<User> {
    const invitation = await User.invitationTokens.verify(new Secret(token))

    if (!invitation) {
      throw new InvalidInvitationException()
    }

    const user = await User.find(invitation.tokenableId)

    if (!user || !user.isActive || !user.isPending) {
      throw new InvalidInvitationException()
    }

    return user
  }
}
