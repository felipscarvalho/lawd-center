import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProjectService from '#services/projects/project_service'
import ProjectTransformer from '#transformers/projects/project_transformer'
import {
  createProjectValidator,
  listProjectsValidator,
  updateProjectValidator,
} from '#validators/projects/project'

@inject()
export default class ProjectsController {
  constructor(protected projectService: ProjectService) {}

  async index({ request, serialize }: HttpContext) {
    const filters = await request.validateUsing(listProjectsValidator, { data: request.qs() })

    const page = await this.projectService.list(filters)

    return serialize(ProjectTransformer.paginate(page.items, page.meta))
  }

  async show({ auth, params, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id

    const project = await this.projectService.show(actorId, Number(params.id))

    return serialize(ProjectTransformer.transform(project))
  }

  async store({ auth, request, response, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id
    const payload = await request.validateUsing(createProjectValidator)

    const project = await this.projectService.create(actorId, payload)

    return response.created(await serialize(ProjectTransformer.transform(project)))
  }

  async update({ auth, params, request, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id
    const payload = await request.validateUsing(updateProjectValidator)

    const project = await this.projectService.update(actorId, Number(params.id), payload)

    return serialize(ProjectTransformer.transform(project))
  }
}
