import LawdMail from '#mails/administration/lawd_mail'

interface UserInvitationMailData {
  email: string
  /** Nome já informado pela gestão, quando houver (o convite pode ser reenviado depois de editado) */
  fullName: string | null
  /** Link da página do front que cria a senha, já com o token */
  link: string
  /** Dias até o link expirar */
  expiresInDays: number
}

/** Convite para quem já é da liga criar a senha e entrar no Lawd Center */
export default class UserInvitationMail extends LawdMail {
  subject = 'Crie sua senha do Lawd Center'

  constructor(private data: UserInvitationMailData) {
    super()
  }

  prepare() {
    const { email, fullName, link, expiresInDays } = this.data
    const firstName = fullName?.trim().split(/\s+/)[0]

    this.message.to(email)

    this.compose({
      preheader: 'Seu acesso foi liberado, falta só criar a senha.',
      eyebrow: 'Acesso ao Lawd Center',
      title: firstName ? `Oi, ${firstName}! Seu acesso está pronto` : 'Seu acesso está pronto',
      paragraphs: [
        'A diretoria liberou seu acesso ao Lawd Center, o sistema interno da liga.',
        'Para entrar, é só criar sua senha pelo botão abaixo. Você vai usar este e-mail e essa senha nos próximos acessos.',
      ],
      action: { label: 'Criar minha senha', url: link },
      footnotes: [
        `O link vale por ${expiresInDays} dias e só pode ser usado uma vez. Se expirar, peça um novo à diretoria.`,
        'Se não reconhece este convite, ignore o e-mail: sem a senha, ninguém entra.',
      ],
      reason: `Enviado para ${email} porque a diretoria da LAWD liberou seu acesso ao Lawd Center.`,
    })
  }
}
