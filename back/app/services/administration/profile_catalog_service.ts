import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Technology from '#models/administration/technology'
import InterestArea from '#models/administration/interest_area'

type CatalogModel = typeof Technology | typeof InterestArea

const catalogs = {
  technologies: Technology,
  interestAreas: InterestArea,
} satisfies Record<string, CatalogModel>

export type ProfileCatalog = keyof typeof catalogs

/**
 * Catálogos abertos do perfil (tecnologias e áreas de interesse): busca para autocompletar
 * e resolução de nomes, criando os que ainda não existem. A comparação ignora maiúsculas,
 * então "react" e "React" viram o mesmo item.
 */
export default class ProfileCatalogService {
  async search(catalog: ProfileCatalog, term = '', limit = 20): Promise<string[]> {
    const query = catalogs[catalog].query().orderBy('name', 'asc').limit(limit)

    if (term.trim()) {
      query.whereILike('name', `%${term.trim()}%`)
    }

    const items = await query

    return items.map((item) => item.name)
  }

  /** Devolve os ids dos nomes informados, criando no catálogo os que não existem */
  async resolveIds(
    catalog: ProfileCatalog,
    names: string[],
    trx: TransactionClientContract
  ): Promise<number[]> {
    const model = catalogs[catalog]
    // Remove repetidos ignorando maiúsculas, mantendo a primeira grafia informada
    const uniqueNames = new Map<string, string>()

    for (const name of names.map((item) => item.trim()).filter(Boolean)) {
      if (!uniqueNames.has(name.toLowerCase())) uniqueNames.set(name.toLowerCase(), name)
    }

    const ids: number[] = []

    for (const name of uniqueNames.values()) {
      const existing = await model
        .query({ client: trx })
        .whereRaw('lower(name) = ?', [name.toLowerCase()])
        .first()
      const item = existing ?? (await model.create({ name }, { client: trx }))

      ids.push(item.id)
    }

    return ids
  }
}
