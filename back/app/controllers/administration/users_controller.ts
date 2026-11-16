import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import UserService from '#services/administration/user_service'
import UserTransformer from '#transformers/administration/user_transformer'
import {
  createUserValidator,
  listUsersValidator,
  updateUserValidator,
} from '#validators/administration/user'

@inject()
export default class UsersController {
  constructor(protected userService: UserService) {}

  async index({ request, serialize }: HttpContext) {
    const filters = await request.validateUsing(listUsersValidator, { data: request.qs() })

    const users = await this.userService.list(filters)

    return serialize(UserTransformer.transform(users))
  }

  async show({ params, serialize }: HttpContext) {
    const user = await this.userService.find(Number(params.id))

    return serialize(UserTransformer.transform(user))
  }

  async store({ request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)

    const user = await this.userService.create(payload)

    return response.created(await serialize(UserTransformer.transform(user)))
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
