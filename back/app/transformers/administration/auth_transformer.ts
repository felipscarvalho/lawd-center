import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from '#transformers/administration/user_transformer'
import type { CurrentUserOutput, LoginOutput } from '#dtos/administration/auth'

/** Resposta do login: token (só disponível neste momento) e usuário */
export class LoginTransformer extends BaseTransformer<LoginOutput> {
  toObject() {
    return {
      token: this.resource.token,
      user: UserTransformer.transform(this.resource.user),
    }
  }
}

/** Usuário autenticado com as permissões efetivas */
export class CurrentUserTransformer extends BaseTransformer<CurrentUserOutput> {
  toObject() {
    return {
      user: UserTransformer.transform(this.resource.user),
      permissions: this.resource.permissions,
    }
  }
}
