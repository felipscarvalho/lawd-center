import { BaseTransformer } from '@adonisjs/core/transformers'
import type Directorate from '#models/administration/directorate'
import MembershipTransformer from '#transformers/administration/membership_transformer'

export default class DirectorateTransformer extends BaseTransformer<Directorate> {
  toObject() {
    return {
      id: this.resource.id,
      key: this.resource.key,
      name: this.resource.name,
      kind: this.resource.kind,
      // Presente no organograma, onde os vínculos ativos são carregados. O depth fica na coleção
      // aninhada porque o serializer ignora o depth do nível de cima; 2 inclui o usuário de cada vínculo
      memberships: MembershipTransformer.transform(
        this.whenLoaded(this.resource.memberships)
      )?.depth(2),
    }
  }
}
