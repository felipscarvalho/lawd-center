import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import Membership from '#models/administration/membership'
import type Directorate from '#models/administration/directorate'
import type User from '#models/administration/user'
import DirectorateService from '#services/administration/directorate_service'
import UserService from '#services/administration/user_service'
import MembershipService from '#services/administration/membership_service'
import { corePositions, type Position } from '#permissions/positions'

let sequence = 0

/** Garante as diretorias usadas nos testes (idempotente, dentro da transação do teste) */
export async function setupDirectorates() {
  const service = await app.container.make(DirectorateService)
  const [corp, projects, events] = await service.upsertMany([
    { key: 'corp', name: 'CORP', kind: 'core' },
    { key: 'projects', name: 'Projetos', kind: 'standard' },
    { key: 'events', name: 'Eventos', kind: 'standard' },
  ])
  return { corp, projects, events }
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
 * Cria um usuário com um cargo ativo na diretoria. Para cargos únicos do núcleo,
 * encerra antes quem estiver ocupando (só dentro da transação do teste).
 */
export async function createUserWithPosition(
  position: Position,
  directorate: Directorate
): Promise<User> {
  if (corePositions.includes(position)) {
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
