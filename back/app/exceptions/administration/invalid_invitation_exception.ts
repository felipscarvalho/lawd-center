import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Link de convite que não serve mais (HTTP 404): token errado, expirado, substituído por um convite
 * mais novo, já usado, ou usuário desativado. Mensagem única para não revelar qual foi o caso.
 */
export default class InvalidInvitationException extends Exception {
  static status = 404
  static code = 'E_INVALID_INVITATION'

  constructor() {
    super('Este convite é inválido ou expirou. Peça um novo convite à gestão da liga.')
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response
      .status(error.status)
      .send({ errors: [{ message: error.message, code: error.code }] })
  }
}
