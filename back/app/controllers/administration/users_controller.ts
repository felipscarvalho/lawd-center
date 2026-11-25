import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import UserService from '#services/administration/user_service'
import UserInvitationService from '#services/administration/user_invitation_service'
import UserTransformer from '#transformers/administration/user_transformer'
import {
  inviteUserValidator,
  listUsersValidator,
  updateUserValidator,
} from '#validators/administration/user'

@inject()
export default class UsersController {
  constructor(
    protected userService: UserService,
    protected userInvitationService: UserInvitationService
  ) {}

  async index({ request, serialize }: HttpContext) {
    const filters = await request.validateUsing(listUsersValidator, { data: request.qs() })

    const users = await this.userService.list(filters)

    return serialize(UserTransformer.paginate(users.all(), users.getMeta()))
  }

  async show({ params, serialize }: HttpContext) {
    const user = await this.userService.find(Number(params.id))

    return serialize(UserTransformer.transform(user))
  }

  /** Cadastra só pelo e-mail e envia o convite para a pessoa criar a senha */
  async store({ request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(inviteUserValidator)

    const user = await this.userInvitationService.invite(payload)

    return response.created(await serialize(UserTransformer.transform(user)))
  }

  async resendInvitation({ params, serialize }: HttpContext) {
    const user = await this.userInvitationService.resend(Number(params.id))

    return serialize(UserTransformer.transform(user))
  }

  async update({ params, request, serialize }: HttpContext) {
    const userId = Number(params.id)
    const payload = await request.validateUsing(updateUserValidator, { meta: { userId } })

    const user = await this.userService.update(userId, payload)

    return serialize(UserTransformer.transform(user))
  }

  async deactivate({ auth, params, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id

    const user = await this.userService.deactivate(actorId, Number(params.id))

    return serialize(UserTransformer.transform(user))
  }
}
