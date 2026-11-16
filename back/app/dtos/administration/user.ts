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
}
