import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import UserInvitationService from '#services/administration/user_invitation_service'
import { acceptInvitationValidator } from '#validators/administration/user'
import { LoginTransformer } from '#transformers/administration/auth_transformer'

/** Página pública do convite: quem recebeu o link confere o e-mail e cria a senha */
@inject()
export default class InvitationsController {
  constructor(protected userInvitationService: UserInvitationService) {}

  async show({ params }: HttpContext) {
    const invitation = await this.userInvitationService.find(params.token)

    return { data: invitation }
  }

  /** Aceita o convite e devolve a sessão, como no login */
  async accept({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(acceptInvitationValidator)

    const result = await this.userInvitationService.accept(params.token, payload)

    return serialize(LoginTransformer.transform(result))
  }
}
