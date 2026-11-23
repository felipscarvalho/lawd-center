import vine from '@vinejs/vine'
import { projectPriorities, projectStatuses } from '#models/projects/project'
import { projectRoles } from '#models/projects/project_member'
import { projectSorts } from '#dtos/projects/project'

/** Máximo de projetos por página */
export const maxProjectsPerPage = 100

const id = () => vine.number().withoutDecimals().positive()
const date = () => vine.date({ formats: ['YYYY-MM-DD'] })

/** Filtros, ordem e página da lista; a busca procura no nome do projeto e nas pessoas da equipe */
export const listProjectsValidator = vine.create({
  search: vine.string().trim().maxLength(100).optional(),
  status: vine.enum(projectStatuses).optional(),
  priority: vine.enum(projectPriorities).optional(),
  directorateId: id().optional(),
  sort: vine.enum(projectSorts).optional(),
  page: id().optional(),
  perPage: id().max(maxProjectsPerPage).optional(),
})

const projectFields = {
  description: vine.string().trim().maxLength(5000).nullable().optional(),
  status: vine.enum(projectStatuses).optional(),
  priority: vine.enum(projectPriorities).nullable().optional(),
  startsAt: date().nullable().optional(),
  expectedEndAt: date().nullable().optional(),
  endedAt: date().nullable().optional(),
}

export const createProjectValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(255),
  directorateId: id(),
  ...projectFields,
})

/** Todos os campos são opcionais; null limpa o valor */
export const updateProjectValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(255).optional(),
  directorateId: id().optional(),
  ...projectFields,
})

export const addProjectMemberValidator = vine.create({
  userId: id(),
  role: vine.enum(projectRoles),
  startsAt: date().optional(),
})

export const endProjectMemberValidator = vine.create({
  endsAt: date().optional(),
})
