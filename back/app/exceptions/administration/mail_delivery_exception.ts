import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/** O servidor de e-mail (SMTP) recusou ou não respondeu ao envio (HTTP 503). Compartilhada pelos módulos */
export default class MailDeliveryException extends Exception {
  static status = 503
  static code = 'E_MAIL_DELIVERY_FAILED'

  constructor(message = 'Não foi possível enviar o e-mail. Tente de novo em alguns minutos.') {
    super(message)
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response
      .status(error.status)
      .send({ errors: [{ message: error.message, code: error.code }] })
  }
}
