import { BaseTransformer } from '@adonisjs/core/transformers'
import ProjectSummaryTransformer from '#transformers/projects/project_summary_transformer'
import type { ProjectCount, ProjectsAnalytics } from '#dtos/projects/analytics'

const counts = (items: ProjectCount[]) =>
  items.map((item) => ({
    project: new ProjectSummaryTransformer(item.project).toObject(),
    value: item.value,
  }))

/** Números gerais da análise de projetos */
export default class ProjectsAnalyticsTransformer extends BaseTransformer<ProjectsAnalytics> {
  toObject() {
    return {
      total: this.resource.total,
      byStatus: this.resource.byStatus,
      byPriority: this.resource.byPriority,
      allocatedPeople: this.resource.allocatedPeople,
      unallocatedPeople: this.resource.unallocatedPeople,
      teamSizes: counts(this.resource.teamSizes),
      interests: counts(this.resource.interests),
    }
  }
}
