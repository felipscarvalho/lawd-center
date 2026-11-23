import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProjectTeamService from '#services/projects/project_team_service'
import ProjectMemberTransformer from '#transformers/projects/project_member_transformer'
import UserProjectsTransformer from '#transformers/projects/user_projects_transformer'
import { addProjectMemberValidator, endProjectMemberValidator } from '#validators/projects/project'

@inject()
export default class ProjectMembersController {
  constructor(protected projectTeamService: ProjectTeamService) {}

  /** Equipe do projeto com o histórico */
  async index({ params, serialize }: HttpContext) {
    const members = await this.projectTeamService.history(Number(params.id))

    return serialize(ProjectMemberTransformer.transform(members))
  }

  async store({ auth, params, request, response, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id
    const payload = await request.validateUsing(addProjectMemberValidator)

    const member = await this.projectTeamService.add(actorId, Number(params.id), payload)

    return response.created(await serialize(ProjectMemberTransformer.transform(member)))
  }

  async end({ auth, params, request, serialize }: HttpContext) {
    const actorId = auth.getUserOrFail().id
    const payload = await request.validateUsing(endProjectMemberValidator)

    const member = await this.projectTeamService.end(actorId, Number(params.id), payload)

    return serialize(ProjectMemberTransformer.transform(member))
  }

  /** Projetos de uma pessoa (participações e interesses) */
  async forUser({ params, serialize }: HttpContext) {
    const projects = await this.projectTeamService.forUser(Number(params.id))

    return serialize(UserProjectsTransformer.transform(projects))
  }
}
