import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import env from '#start/env'
import UserService from '#services/administration/user_service'
import DirectorateService from '#services/administration/directorate_service'
import MembershipService from '#services/administration/membership_service'

/**
 * Cria o primeiro administrador (presidente no CORP) a partir de ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD,
 * para que exista alguém capaz de cadastrar os demais usuários. Idempotente.
 */
export default class extends BaseSeeder {
  async run() {
    const name = env.get('ADMIN_NAME')
    const email = env.get('ADMIN_EMAIL')
    const password = env.get('ADMIN_PASSWORD')

    if (!name || !email || !password) {
      logger.warn(
        'ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD não definidos; primeiro administrador não foi criado'
      )
      return
    }

    const userService = await app.container.make(UserService)
    const directorateService = await app.container.make(DirectorateService)
    const membershipService = await app.container.make(MembershipService)

    const user =
      (await userService.findByEmail(email)) ??
      (await userService.create({ fullName: name, email, password }))

    const corp = await directorateService.findByKey('corp')

    if (!corp) {
      logger.warn('Diretoria CORP não encontrada; rode o seeder de diretorias antes')
      return
    }

    const chart = await membershipService.organizationChart()
    const hasPresident = chart.some((directorate) =>
      directorate.memberships.some((m) => m.position === 'president')
    )

    if (!hasPresident) {
      await membershipService.register({
        userId: user.id,
        directorateId: corp.id,
        position: 'president',
      })
    }
  }
}
