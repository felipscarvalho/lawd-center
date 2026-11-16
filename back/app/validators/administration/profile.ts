import vine from '@vinejs/vine'
import {
  careerPaths,
  courses,
  maturityLevels,
  maxProfileChoices,
  softSkills,
  universityEntryPeriodPattern,
  weeklyAvailabilities,
} from '#models/administration/profile'

const catalogNames = () =>
  vine.array(vine.string().trim().minLength(1).maxLength(100)).maxLength(50)

/** Todos os campos são opcionais; null limpa o valor. A matrícula é única, ignorando o próprio perfil */
export const updateProfileValidator = vine.withMetaData<{ userId: number }>().create({
  birthDate: vine
    .date({ formats: ['YYYY-MM-DD'] })
    .beforeOrEqual('today')
    .nullable()
    .optional(),
  registrationNumber: vine
    .string()
    .trim()
    .regex(/^\d{4,20}$/)
    .unique({
      table: 'profiles',
      column: 'registration_number',
      filter: (query, _, field) => {
        query.whereNot('user_id', field.meta.userId)
      },
    })
    .nullable()
    .optional(),
  course: vine.enum(courses).nullable().optional(),
  universityEntryPeriod: vine
    .string()
    .trim()
    .regex(universityEntryPeriodPattern)
    .nullable()
    .optional(),
  weeklyAvailability: vine.enum(weeklyAvailabilities).nullable().optional(),
  maturity: vine.enum(maturityLevels).nullable().optional(),
  careerPaths: vine
    .array(vine.enum(careerPaths))
    .distinct()
    .maxLength(maxProfileChoices)
    .optional(),
  softSkills: vine.array(vine.enum(softSkills)).distinct().maxLength(maxProfileChoices).optional(),
  goal: vine.string().trim().maxLength(2000).nullable().optional(),
  technologies: catalogNames().optional(),
  interestAreas: catalogNames().optional(),
})

export const updatePhotoValidator = vine.create({
  photo: vine.file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] }),
})

export const updateTechnicalScoreValidator = vine.create({
  technicalScore: vine.number().min(0).max(10).decimal([0, 2]).nullable(),
})

export const searchCatalogValidator = vine.create({
  search: vine.string().trim().maxLength(100).optional(),
})
