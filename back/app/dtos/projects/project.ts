import type { DateTime } from 'luxon'
import type Directorate from '#models/administration/directorate'
import type User from '#models/administration/user'
import type Project from '#models/projects/project'
import type { ProjectPriority, ProjectStatus } from '#models/projects/project'
import type ProjectMember from '#models/projects/project_member'
import type { ProjectRole } from '#models/projects/project_member'
import type ProjectInterest from '#models/projects/project_interest'

export const projectSorts = ['activity', 'team', 'name'] as const

/** activity: em andamento primeiro e times maiores antes; team: tamanho do time; name: nome */
export type ProjectSort = (typeof projectSorts)[number]

export interface ListProjectsInput {
  /** Trecho do nome do projeto ou do nome/e-mail de alguém da equipe */
  search?: string
  status?: ProjectStatus
  priority?: ProjectPriority
  directorateId?: number
  /** Padrão: activity */
  sort?: ProjectSort
  /** Página, a partir de 1 (padrão 1) */
  page?: number
  /** Itens por página (padrão 20) */
  perPage?: number
}

export interface CreateProjectInput {
  name: string
  description?: string | null
  /** Padrão: not_started */
  status?: ProjectStatus
  priority?: ProjectPriority | null
  directorateId: number
  startsAt?: DateTime | null
  expectedEndAt?: DateTime | null
  /** Só vale para projetos finalizados; padrão: hoje, ao finalizar */
  endedAt?: DateTime | null
}

export type UpdateProjectInput = Partial<CreateProjectInput>

/** O que quem consulta pode fazer no projeto (o front mostra os botões conforme isso) */
export interface ProjectAbilities {
  /** Editar dados e status do projeto */
  canEdit: boolean
  /** Adicionar e remover integrantes (coordenador incluído, com canEdit) */
  canManageTeam: boolean
}

/** Projeto com os dados de outros módulos (diretoria, coordenador) já montados para a resposta */
export interface ProjectView {
  project: Project
  directorate: Directorate
  coordinator: User | null
  /** Integrantes ativos, coordenador incluído */
  teamSize: number
  interestCount: number
}

/** Projeto aberto no detalhe: inclui o que quem consulta pode fazer e a relação dele com o projeto */
export interface ProjectDetail extends ProjectView {
  abilities: ProjectAbilities
  /** Quem consulta está na equipe */
  isMember: boolean
  /** Quem consulta marcou interesse */
  isInterested: boolean
}

export interface ProjectPage {
  items: ProjectView[]
  meta: Record<string, unknown>
}

export interface AddProjectMemberInput {
  userId: number
  role: ProjectRole
  /** Data de entrada; padrão: hoje */
  startsAt?: DateTime
}

export interface EndProjectMemberInput {
  /** Data de saída; padrão: hoje */
  endsAt?: DateTime
}

/** Participação com a pessoa (e, nos projetos de uma pessoa, o projeto) */
export interface ProjectMemberView {
  member: ProjectMember
  user: User
  project?: Project
}

export interface ProjectInterestView {
  interest: ProjectInterest
  user: User
}

/** Projetos de uma pessoa: participações (atuais e passadas) e interesses em projetos abertos */
export interface UserProjects {
  participations: ProjectMemberView[]
  interests: Project[]
}
