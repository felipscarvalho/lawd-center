import type User from '#models/administration/user'
import type Project from '#models/projects/project'
import type { ProjectPriority, ProjectStatus } from '#models/projects/project'

/** Um projeto e um número (tamanho do time, interessados) */
export interface ProjectCount {
  project: Project
  value: number
}

export interface ProjectsAnalytics {
  total: number
  byStatus: Record<ProjectStatus, number>
  /** Projetos não finalizados por prioridade; `none` = sem prioridade */
  byPriority: Record<ProjectPriority | 'none', number>
  /** Pessoas ativas na liga que estão em alguma equipe */
  allocatedPeople: number
  /** Pessoas ativas na liga fora de qualquer equipe */
  unallocatedPeople: number
  /** Projetos em andamento, do maior time para o menor */
  teamSizes: ProjectCount[]
  /** Projetos não finalizados com interessados, do mais procurado para o menos */
  interests: ProjectCount[]
}

/** Pessoa sem projeto, para o radar de alocação */
export interface RadarEntry {
  /** Com perfil, tecnologias, áreas de interesse e cargos ativos carregados */
  user: User
  /** Só preenchida para quem pode ver os dados privados da pessoa */
  technicalScore: number | null
  /** Projetos abertos em que a pessoa marcou interesse */
  interestedProjects: Project[]
}
