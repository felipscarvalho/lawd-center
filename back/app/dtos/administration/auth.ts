import type User from '#models/administration/user'
import type { EffectivePermission } from '#dtos/administration/permission'

export interface LoginInput {
  email: string
  password: string
}

export interface LoginOutput {
  user: User
  /** Token em texto puro; só está disponível no momento da criação */
  token: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface CurrentUserOutput {
  user: User
  permissions: EffectivePermission[]
}
