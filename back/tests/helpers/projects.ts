import { DateTime } from 'luxon'
import Project, { type ProjectStatus } from '#models/projects/project'
import ProjectMember, { type ProjectRole } from '#models/projects/project_member'
import type Directorate from '#models/administration/directorate'
import type User from '#models/administration/user'

/** Prefixo das rotas do módulo */
export const PROJECTS_API = '/api/v1/projects'

/** Cria um projeto direto no banco (preparo de cenário, sem passar pelas permissões) */
export async function createProject(
  directorate: Directorate,
  overrides: Partial<{ name: string; status: ProjectStatus }> = {}
): Promise<Project> {
  return Project.create({
    name: overrides.name ?? `Projeto ${Date.now()}`,
    status: overrides.status ?? 'in_progress',
    priority: null,
    directorateId: directorate.id,
    startsAt: DateTime.now().minus({ months: 2 }).startOf('day'),
  })
}

/** Coloca a pessoa na equipe direto no banco */
export async function addToTeam(
  project: Project,
  user: User,
  role: ProjectRole = 'member'
): Promise<ProjectMember> {
  return ProjectMember.create({
    projectId: project.id,
    userId: user.id,
    role,
    startsAt: DateTime.now().minus({ days: 10 }).startOf('day'),
    endsAt: null,
  })
}
