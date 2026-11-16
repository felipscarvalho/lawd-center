import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProfileCatalogService, {
  type ProfileCatalog,
} from '#services/administration/profile_catalog_service'
import { searchCatalogValidator } from '#validators/administration/profile'

/** Busca nos catálogos abertos do perfil, para autocompletar no formulário */
@inject()
export default class ProfileCatalogsController {
  constructor(protected catalogService: ProfileCatalogService) {}

  async technologies(ctx: HttpContext) {
    return this.search(ctx, 'technologies')
  }

  async interestAreas(ctx: HttpContext) {
    return this.search(ctx, 'interestAreas')
  }

  // Lista simples de nomes: devolvida já no formato { data } da API (o serializer não embrulha listas de texto)
  private async search({ request }: HttpContext, catalog: ProfileCatalog) {
    const { search } = await request.validateUsing(searchCatalogValidator, { data: request.qs() })

    const names = await this.catalogService.search(catalog, search)

    return { data: names }
  }
}
