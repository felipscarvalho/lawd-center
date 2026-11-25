import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const smtpUsername = env.get('SMTP_USERNAME')
// Vazio (ex.: SMTP_PASSWORD="") conta como sem senha
const smtpPassword = env.get('SMTP_PASSWORD')?.release() || undefined
const smtpPort = env.get('SMTP_PORT')

/**
 * Envio de e-mails por SMTP. Em produção, o SMTP do Google (smtp.gmail.com) com uma senha de app
 * da conta remetente; em desenvolvimento, qualquer servidor SMTP local (ex.: Mailpit, sem login).
 */
const mailConfig = defineConfig({
  default: env.get('MAIL_MAILER'),

  /** Remetente padrão: no Gmail precisa ser a própria conta (ou um alias verificado dela) */
  from: {
    address: env.get('MAIL_FROM_ADDRESS'),
    name: env.get('MAIL_FROM_NAME'),
  },

  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST'),
      port: smtpPort,
      // Porta 465 usa TLS direto; nas outras (587) a conexão começa aberta e sobe para TLS (STARTTLS)
      secure: smtpPort === 465,
      // Login só quando configurado: servidores locais de teste não pedem autenticação
      auth:
        smtpUsername && smtpPassword
          ? { type: 'login', user: smtpUsername, pass: smtpPassword }
          : undefined,
      // Os padrões do nodemailer esperam até 2 min pela conexão e 10 min com o socket parado: a
      // requisição ficava pendurada (botão carregando) quando a rede bloqueia a porta do SMTP
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
