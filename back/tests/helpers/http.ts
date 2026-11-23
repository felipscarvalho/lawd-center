import type { ApiResponse } from '@japa/api-client'

/** Conteúdo de `data` da resposta da API, já tipado (o api-client devolve o corpo sem tipo) */
export function responseData<T = Record<string, unknown>>(response: ApiResponse): T {
  return (response.body() as { data: T }).data
}

/** Erros de uma resposta de falha da API (validação, regra de negócio, limite de requisições) */
export function responseErrors(response: ApiResponse): { message: string; field?: string }[] {
  return (response.body() as { errors: { message: string; field?: string }[] }).errors
}

/** Corpo de uma resposta paginada: os itens em `data` e a paginação em `metadata` */
export function responsePage<T = Record<string, unknown>>(
  response: ApiResponse
): {
  data: T[]
  metadata: { total: number; perPage: number; currentPage: number; lastPage: number }
} {
  return response.body() as never
}
