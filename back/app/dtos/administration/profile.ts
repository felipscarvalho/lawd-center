import type { DateTime } from 'luxon'
import type User from '#models/administration/user'
import type Profile from '#models/administration/profile'
import type {
  CareerPath,
  Course,
  MaturityLevel,
  SoftSkill,
  WeeklyAvailability,
} from '#models/administration/profile'

/** Campos editáveis do perfil; ausente = não altera, null = limpa */
export interface UpdateProfileInput {
  birthDate?: DateTime | null
  registrationNumber?: string | null
  course?: Course | null
  universityEntryPeriod?: string | null
  weeklyAvailability?: WeeklyAvailability | null
  maturity?: MaturityLevel | null
  careerPaths?: CareerPath[]
  softSkills?: SoftSkill[]
  goal?: string | null
  /** Nomes; os que não existem no catálogo são criados */
  technologies?: string[]
  interestAreas?: string[]
}

/** O que quem está consultando pode fazer com o perfil */
export interface ProfileAbilities {
  canUpdate: boolean
  canViewPrivate: boolean
  canEvaluate: boolean
}

export interface ProfileOutput {
  user: User
  /** Nulo enquanto o perfil nunca foi preenchido */
  profile: Profile | null
  technologies: string[]
  interestAreas: string[]
  abilities: ProfileAbilities
  /** Dados privados (nascimento, objetivo) visíveis para quem consulta */
  showPrivate: boolean
  /** Nota técnica visível para quem consulta */
  showTechnicalScore: boolean
}
