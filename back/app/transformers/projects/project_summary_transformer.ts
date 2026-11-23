import { BaseTransformer } from '@adonisjs/core/transformers'
import type Project from '#models/projects/project'

/** Dados do próprio projeto, sem equipe nem contagens (usado dentro de outras respostas) */
export default class ProjectSummaryTransformer extends BaseTransformer<Project> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      description: this.resource.description,
      status: this.resource.status,
      priority: this.resource.priority,
      directorateId: this.resource.directorateId,
      startsAt: this.resource.startsAt?.toISODate() ?? null,
      expectedEndAt: this.resource.expectedEndAt?.toISODate() ?? null,
      endedAt: this.resource.endedAt?.toISODate() ?? null,
      createdAt: this.resource.createdAt.toISO(),
    }
  }
}
