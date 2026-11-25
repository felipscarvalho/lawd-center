import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import Membership from '#models/administration/membership'
import type Directorate from '#models/administration/directorate'
import type User from '#models/administration/user'
import DirectorateService from '#services/administration/directorate_service'
import UserService from '#services/administration/user_service'
import MembershipService from '#services/administration/membership_service'
import { corePositions, sharedPositions, type Position } from '#permissions/positions'

let sequence = 0

/** Garante as diretorias usadas nos testes (idempotente, dentro da transação do teste) */
export async function setupDirectorates() {
  const service = await app.container.make(DirectorateService)
  const [corp, projects, events, hr] = await service.upsertMany([
    { key: 'corp', name: 'CORP', kind: 'core' },
    { key: 'projects', name: 'Projetos', kind: 'standard' },
    { key: 'events', name: 'Eventos', kind: 'standard' },
    { key: 'hr', name: 'RH', kind: 'standard' },
  ])
  return { corp, projects, events, hr }
}

export const TEST_PASSWORD = 'password123'

export async function createUser(
  overrides: Partial<{ fullName: string; email: string }> = {}
): Promise<User> {
  sequence++
  const service = await app.container.make(UserService)
  return service.create({
    fullName: overrides.fullName ?? `Usuário Teste ${sequence}`,
    email: overrides.email ?? `user${sequence}.${Date.now()}@test.lawd`,
    password: TEST_PASSWORD,
  })
}

/**
 * Cria um usuário com um cargo ativo na diretoria. Para cargos únicos do núcleo (não o conselheiro),
 * encerra antes quem estiver ocupando (só dentro da transação do teste).
 */
export async function createUserWithPosition(
  position: Position,
  directorate: Directorate
): Promise<User> {
  if (corePositions.includes(position) && !sharedPositions.includes(position)) {
    await Membership.query()
      .whereNull('ends_at')
      .where('position', position)
      .update({ ends_at: DateTime.now().toSQLDate() })
  }

  const user = await createUser()
  const service = await app.container.make(MembershipService)
  await service.register({
    userId: user.id,
    directorateId: directorate.id,
    position,
    startsAt: DateTime.now().minus({ days: 30 }),
  })
  return user
}

/** Mailer falso do teste atual (ver fakeMail) */
let fakeMailer: ReturnType<typeof mail.fake> | null = null

/**
 * Troca o envio de e-mails por um mailer falso durante o teste (nada sai por SMTP).
 * Usar em `group.each.setup(fakeMail)`: o retorno restaura o mailer real ao fim de cada teste.
 */
export function fakeMail() {
  fakeMailer = mail.fake()

  return () => {
    mail.restore()
    fakeMailer = null
  }
}

/** E-mails enviados no teste atual (exige fakeMail no setup do grupo) */
export function sentMails() {
  if (!fakeMailer) throw new Error('Chame fakeMail no setup do grupo')

  return fakeMailer.mails
}

/** Token do último convite enviado para o e-mail (lido do link no corpo do e-mail falso) */
export function sentInvitationToken(email: string): string {
  const sent = sentMails().sent((message) => message.message.hasTo(email))
  const text = String(sent.at(-1)?.message.nodeMailerMessage.text ?? '')
  const match = text.match(/\/invitation\/(\S+)/)

  if (!match) throw new Error(`Nenhum convite enviado para ${email}`)

  return decodeURIComponent(match[1])
}
