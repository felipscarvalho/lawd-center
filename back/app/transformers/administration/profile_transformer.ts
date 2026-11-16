import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from '#transformers/administration/user_transformer'
import type { ProfileOutput } from '#dtos/administration/profile'

/**
 * Perfil visto por quem consulta: campos privados só aparecem quando liberados pelo service
 * (showPrivate / showTechnicalScore); caso contrário saem como null.
 */
export default class ProfileTransformer extends BaseTransformer<ProfileOutput> {
  toObject() {
    const { profile, showPrivate, showTechnicalScore } = this.resource

    return {
      user: UserTransformer.transform(this.resource.user),
      birthDate: showPrivate ? (profile?.birthDate?.toISODate() ?? null) : null,
      course: profile?.course ?? null,
      universityEntryPeriod: profile?.universityEntryPeriod ?? null,
      graduated: profile?.graduated ?? false,
      photoUrl: profile?.photoUrl ?? null,
      weeklyAvailability: profile?.weeklyAvailability ?? null,
      maturity: profile?.maturity ?? null,
      careerPaths: profile?.careerPaths ?? [],
      softSkills: profile?.softSkills ?? [],
      goal: showPrivate ? (profile?.goal ?? null) : null,
      technicalScore: showTechnicalScore ? (profile?.technicalScore ?? null) : null,
      technicalScoreUpdatedAt: showTechnicalScore
        ? (profile?.technicalScoreUpdatedAt?.toISO() ?? null)
        : null,
      technologies: this.resource.technologies,
      interestAreas: this.resource.interestAreas,
      abilities: this.resource.abilities,
    }
  }
}
