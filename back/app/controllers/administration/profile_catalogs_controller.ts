import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProfileCatalogService from '#services/administration/profile_catalog_service'
import { searchCatalogValidator } from '#validators/administration/profile'

/** Busca nos catálogos abertos do perfil, para autocompletar no formulário */
@inject()
export default class ProfileCatalogsController {
  constructor(protected catalogService: ProfileCatalogService) {}

  // Lista simples de nomes: devolvida já no formato { data } da API (o serializer não embrulha listas de texto)
  async technologies({ request }: HttpContext) {
    const { search } = await request.validateUsing(searchCatalogValidator, { data: request.qs() })

    const names = await this.catalogService.search('technologies', search)

    return { data: names }
  }

  async interestAreas({ request }: HttpContext) {
    const { search } = await request.validateUsing(searchCatalogValidator, { data: request.qs() })

    const names = await this.catalogService.search('interestAreas', search)

    return { data: names }
  }
}
