/** Termo de busca para ILIKE ("contém"), com os curingas `%` e `_` tratados como texto */
export const likeTerm = (search: string) => `%${search.trim().replace(/[\\%_]/g, '\\$&')}%`
