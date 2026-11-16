import type { ApiResponse } from '@japa/api-client'

/** Conteúdo de `data` da resposta da API, já tipado (o api-client devolve o corpo sem tipo) */
export function responseData<T = Record<string, unknown>>(response: ApiResponse): T {
  return (response.body() as { data: T }).data
}
