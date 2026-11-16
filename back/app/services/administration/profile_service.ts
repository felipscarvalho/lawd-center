import { inject } from '@adonisjs/core'
import { randomUUID } from 'node:crypto'
import drive from '@adonisjs/drive/services/main'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import User from '#models/administration/user'
import Profile from '#models/administration/profile'
import PermissionService from '#services/administration/permission_service'
import ProfileCatalogService from '#services/administration/profile_catalog_service'
import ImageCompressionService from '#services/administration/image_compression_service'
import BusinessRuleException from '#exceptions/administration/business_rule_exception'
import ForbiddenException from '#exceptions/administration/forbidden_exception'
import type {
  ProfileAbilities,
  ProfileOutput,
  UpdateProfileInput,
} from '#dtos/administration/profile'

@inject()
export default class ProfileService {
  constructor(
    protected permissionService: PermissionService,
    protected catalogService: ProfileCatalogService,
    protected imageService: ImageCompressionService
  ) {}

  /**
   * Perfil de um usuário visto por quem consulta: dados privados (nascimento e objetivo) só para
   * a própria pessoa ou quem tem view_private sobre ela; a nota técnica só para quem tem view_private.
   */
  async getForUser(actorId: number, userId: number): Promise<ProfileOutput> {
    const isSelf = actorId === userId

    if (
      !isSelf &&
      !(await this.permissionService.canOnUser(actorId, 'administration.profile.view', userId))
    ) {
      throw new ForbiddenException()
    }

    const user = await User.query()
      .where('id', userId)
      .preload('profile')
      .preload('technologies', (query) => query.orderBy('name'))
      .preload('interestAreas', (query) => query.orderBy('name'))
      .firstOrFail()

    const abilities = await this.getAbilities(actorId, userId)

    return {
      user,
      profile: user.profile ?? null,
      technologies: user.technologies.map((item) => item.name),
      interestAreas: user.interestAreas.map((item) => item.name),
      abilities,
      showPrivate: isSelf || abilities.canViewPrivate,
      showTechnicalScore: abilities.canViewPrivate,
    }
  }

  /** Edita o perfil: a própria pessoa, ou quem tem profile.update sobre ela (CORP ou diretor da diretoria) */
  async update(actorId: number, userId: number, input: UpdateProfileInput): Promise<ProfileOutput> {
    await this.authorize(actorId, userId, 'canUpdate')

    const { technologies, interestAreas, ...fields } = input

    await db.transaction(async (trx) => {
      const profile = await this.findOrNew(userId)
      profile.useTransaction(trx)
      profile.merge(fields)
      await profile.save()

      const user = await User.findOrFail(userId, { client: trx })

      if (technologies) {
        const ids = await this.catalogService.resolveIds('technologies', technologies, trx)
        await user.related('technologies').sync(ids, true, trx)
      }

      if (interestAreas) {
        const ids = await this.catalogService.resolveIds('interestAreas', interestAreas, trx)
        await user.related('interestAreas').sync(ids, true, trx)
      }
    })

    return this.getForUser(actorId, userId)
  }

  /** Troca a foto: comprime para WebP 512×512, grava no disco e apaga a anterior */
  async updatePhoto(actorId: number, userId: number, sourcePath: string): Promise<ProfileOutput> {
    await this.authorize(actorId, userId, 'canUpdate')

    const image = await this.imageService.compressAvatar(sourcePath)
    const key = `profiles/${userId}/${randomUUID()}.${image.extension}`

    await drive.use().put(key, image.buffer, { contentType: image.contentType })

    const profile = await this.findOrNew(userId)
    const previousKey = profile.photoPath

    profile.photoPath = key
    await profile.save()

    if (previousKey) {
      await drive.use().delete(previousKey)
    }

    return this.getForUser(actorId, userId)
  }

  /** Remove a foto (registro e arquivo) */
  async removePhoto(actorId: number, userId: number): Promise<ProfileOutput> {
    await this.authorize(actorId, userId, 'canUpdate')

    const profile = await Profile.findBy('user_id', userId)
    const previousKey = profile?.photoPath

    if (profile && previousKey) {
      profile.photoPath = null
      await profile.save()

      await drive.use().delete(previousKey)
    }

    return this.getForUser(actorId, userId)
  }

  /** Define (ou limpa) a nota técnica; ninguém avalia a si mesmo */
  async updateTechnicalScore(
    actorId: number,
    userId: number,
    score: number | null
  ): Promise<ProfileOutput> {
    if (actorId === userId) {
      throw new BusinessRuleException(
        'Você não pode definir a própria nota técnica',
        'E_SELF_EVALUATION'
      )
    }

    await this.authorize(actorId, userId, 'canEvaluate')

    const profile = await this.findOrNew(userId)

    profile.technicalScore = score
    profile.technicalScoreUpdatedBy = actorId
    profile.technicalScoreUpdatedAt = DateTime.now()
    await profile.save()

    return this.getForUser(actorId, userId)
  }

  private async getAbilities(actorId: number, userId: number): Promise<ProfileAbilities> {
    const isSelf = actorId === userId

    const [canUpdate, canViewPrivate, canEvaluate] = await Promise.all([
      this.permissionService.canOnUser(actorId, 'administration.profile.update', userId),
      this.permissionService.canOnUser(actorId, 'administration.profile.view_private', userId),
      this.permissionService.canOnUser(actorId, 'administration.profile.evaluate', userId),
    ])

    return {
      canUpdate: isSelf || canUpdate,
      canViewPrivate,
      canEvaluate: !isSelf && canEvaluate,
    }
  }

  private async authorize(actorId: number, userId: number, ability: keyof ProfileAbilities) {
    await User.findOrFail(userId)

    const abilities = await this.getAbilities(actorId, userId)

    if (!abilities[ability]) {
      throw new ForbiddenException()
    }
  }

  /** O perfil é criado no primeiro preenchimento */
  private async findOrNew(userId: number): Promise<Profile> {
    const existing = await Profile.findBy('user_id', userId)

    if (existing) return existing

    const profile = new Profile()
    profile.userId = userId
    profile.careerPaths = []
    profile.softSkills = []
    profile.graduated = false

    return profile
  }
}
