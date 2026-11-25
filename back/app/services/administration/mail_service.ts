import mail from '@adonisjs/mail/services/main'
import type { BaseMail } from '@adonisjs/mail'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import MailDeliveryException from '#exceptions/administration/mail_delivery_exception'

/**
 * Envio de e-mails de qualquer módulo. Os e-mails são classes em `app/mails/<module>/`; aqui eles
 * saem pelo mailer padrão (SMTP), e uma falha do servidor de e-mail vira MailDeliveryException (503).
 */
export default class MailService {
  /** Envia na hora, para quem chamou saber se o e-mail saiu (e desfazer o que depende dele) */
  async send(message: BaseMail): Promise<void> {
    try {
      await mail.send(message)
    } catch (error) {
      // Host e porta no log: timeout de conexão costuma ser porta SMTP bloqueada pela rede do servidor
      const smtp = `${env.get('SMTP_HOST')}:${env.get('SMTP_PORT')}`
      logger.error({ err: error, smtp }, `Falha ao enviar e-mail por ${smtp}`)

      throw new MailDeliveryException()
    }
  }

  /** Endereço absoluto de uma página do front, para links dentro dos e-mails */
  frontUrl(path: string): string {
    return new URL(path, env.get('FRONT_URL')).toString()
  }
}
