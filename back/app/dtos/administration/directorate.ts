import type { DirectorateKind } from '#models/administration/directorate'

export interface CreateDirectorateInput {
  key: string
  name: string
  kind: DirectorateKind
}

export interface UpdateDirectorateInput {
  name?: string
}
