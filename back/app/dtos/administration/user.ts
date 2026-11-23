import type { Course } from '#models/administration/profile'

export interface CreateUserInput {
  fullName: string
  email: string
  password: string
}

export interface UpdateUserInput {
  fullName?: string
  email?: string
  password?: string
}

export interface ListUsersInput {
  /** true: só ativos; false: só desativados; omitido: todos */
  active?: boolean
  /** Trecho do nome ou do e-mail */
  search?: string
  /** Só quem tem cargo ativo nesta diretoria */
  directorateId?: number
  course?: Course
  /** Página, a partir de 1 (padrão 1) */
  page?: number
  /** Itens por página (padrão 20) */
  perPage?: number
}
