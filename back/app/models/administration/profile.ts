import { ProfileSchema } from '#database/schema'
import { column } from '@adonisjs/lucid/orm'
import env from '#start/env'

// Listas fixas do perfil (os rótulos em português ficam no front)

export const courses = [
  'information_systems',
  'computer_science',
  'computer_engineering',
  'design',
  'advertising',
  'other',
] as const

export const weeklyAvailabilities = [
  'under_6h',
  'from_6_to_8h',
  'from_9_to_12h',
  'over_12h',
] as const

export const maturityLevels = ['beginner', 'developing', 'autonomous', 'mentor'] as const

export const careerPaths = [
  'full_stack',
  'frontend',
  'backend',
  'devops',
  'ui_ux',
  'project_management',
  'research',
] as const

export const softSkills = [
  'communication',
  'teamwork',
  'leadership',
  'organization',
  'proactivity',
  'autonomy',
] as const

/** Máximo de opções que cada pessoa escolhe em carreira de interesse e em atributos */
export const maxProfileChoices = 3

export type Course = (typeof courses)[number]
export type WeeklyAvailability = (typeof weeklyAvailabilities)[number]
export type MaturityLevel = (typeof maturityLevels)[number]
export type CareerPath = (typeof careerPaths)[number]
export type SoftSkill = (typeof softSkills)[number]

/** Período de entrada na UFS: ano + semestre (ex.: 2022.1) */
export const universityEntryPeriodPattern = /^\d{4}\.[12]$/

// Listas guardadas em colunas jsonb: o driver pg devolve já convertido, mas precisa de JSON na escrita
const jsonList = {
  prepare: (value: string[] | null) => JSON.stringify(value ?? []),
}

export default class Profile extends ProfileSchema {
  declare course: Course | null
  declare weeklyAvailability: WeeklyAvailability | null
  declare maturity: MaturityLevel | null

  @column(jsonList)
  declare careerPaths: CareerPath[]

  @column(jsonList)
  declare softSkills: SoftSkill[]

  // Colunas ignoradas pelo gerador de schema (database/schema_rules.ts) e declaradas aqui com conversão.
  // O Postgres devolve decimal como texto
  @column({ consume: (value: string | null) => (value === null ? null : Number(value)) })
  declare technicalScore: number | null

  /** URL pública da foto (servida pelo Drive em /uploads) */
  get photoUrl(): string | null {
    return this.photoPath ? `${env.get('APP_URL')}/uploads/${this.photoPath}` : null
  }
}
