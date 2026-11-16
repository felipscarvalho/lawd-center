import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/administration/auth_service'
import { loginValidator } from '#validators/administration/auth'
import {
  CurrentUserTransformer,
  LoginTransformer,
} from '#transformers/administration/auth_transformer'

@inject()
export default class AuthController {
  constructor(protected authService: AuthService) {}

  async login({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)

    const result = await this.authService.login(payload)

    return serialize(LoginTransformer.transform(result))
  }

  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    await this.authService.logout(user, user.currentAccessToken.identifier)

    return response.noContent()
  }

  async me({ auth, serialize }: HttpContext) {
    const result = await this.authService.currentUser(auth.getUserOrFail())

    return serialize(CurrentUserTransformer.transform(result))
  }
}
