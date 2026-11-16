import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Violação de regra de negócio (HTTP 422). Compartilhada por todos os módulos:
 * services lançam com uma mensagem legível e um código específico da regra.
 */
export default class BusinessRuleException extends Exception {
  static status = 422

  constructor(message: string, code = 'E_BUSINESS_RULE') {
    super(message, { code })
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response
      .status(error.status)
      .send({ errors: [{ message: error.message, code: error.code }] })
  }
}
