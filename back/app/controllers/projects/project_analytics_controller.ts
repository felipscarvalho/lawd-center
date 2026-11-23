import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProjectAnalyticsService from '#services/projects/project_analytics_service'
import ProjectsAnalyticsTransformer from '#transformers/projects/projects_analytics_transformer'
import RadarEntryTransformer from '#transformers/projects/radar_entry_transformer'

@inject()
export default class ProjectAnalyticsController {
  constructor(protected projectAnalyticsService: ProjectAnalyticsService) {}

  async summary({ serialize }: HttpContext) {
    const analytics = await this.projectAnalyticsService.summary()

    return serialize(ProjectsAnalyticsTransformer.transform(analytics))
  }

  /** Radar de alocação: quem está fora das equipes */
  async radar({ auth, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id

    const entries = await this.projectAnalyticsService.radar(actorId)

    return serialize(RadarEntryTransformer.transform(entries))
  }
}
