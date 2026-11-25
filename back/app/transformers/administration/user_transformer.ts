import { BaseTransformer } from '@adonisjs/core/transformers'
import type User from '#models/administration/user'
import MembershipTransformer from '#transformers/administration/membership_transformer'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    const profile = this.resource.profile

    return {
      id: this.resource.id,
      fullName: this.resource.fullName,
      email: this.resource.email,
      isActive: this.resource.isActive,
      // Convite ainda não aceito: sem senha (e talvez sem nome) até a pessoa abrir o link do e-mail
      isPending: this.resource.isPending,
      deactivatedAt: this.resource.deactivatedAt?.toISO() ?? null,
      createdAt: this.resource.createdAt.toISO(),
      // Disponível quando o perfil é carregado junto (listas, organograma, sessão)
      photoUrl: profile?.photoUrl ?? null,
      // Resumo público do perfil, quando carregado; null se a pessoa nunca preencheu o perfil
      profile:
        this.resource.$preloaded.profile === undefined
          ? undefined
          : {
              course: profile?.course ?? null,
              universityEntryPeriod: profile?.universityEntryPeriod ?? null,
              weeklyAvailability: profile?.weeklyAvailability ?? null,
              maturity: profile?.maturity ?? null,
            },
      // Cargos, quando carregados (na lista de usuários, só os ativos)
      memberships: MembershipTransformer.transform(
        this.whenLoaded(this.resource.memberships)
      )?.depth(2),
    }
  }
}
