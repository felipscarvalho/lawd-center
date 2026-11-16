/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

export type { Route, Path } from './schema.d.ts'

const placeholder: any = {}

const routes = {
  'administration.auth.login': {
    methods: ["POST"],
    pattern: '/api/v1/administration/auth/login',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"auth"],[0,"login"]],
    types: placeholder as Registry['administration.auth.login']['types'],
  },
  'administration.auth.logout': {
    methods: ["POST"],
    pattern: '/api/v1/administration/auth/logout',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"auth"],[0,"logout"]],
    types: placeholder as Registry['administration.auth.logout']['types'],
  },
  'administration.auth.me': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/administration/auth/me',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"auth"],[0,"me"]],
    types: placeholder as Registry['administration.auth.me']['types'],
  },
  'administration.users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/administration/users',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"users"]],
    types: placeholder as Registry['administration.users.index']['types'],
  },
  'administration.users.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/administration/users/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"users"],[1,"id"]],
    types: placeholder as Registry['administration.users.show']['types'],
  },
  'administration.users.store': {
    methods: ["POST"],
    pattern: '/api/v1/administration/users',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"users"]],
    types: placeholder as Registry['administration.users.store']['types'],
  },
  'administration.users.update': {
    methods: ["PUT"],
    pattern: '/api/v1/administration/users/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"users"],[1,"id"]],
    types: placeholder as Registry['administration.users.update']['types'],
  },
  'administration.users.deactivate': {
    methods: ["POST"],
    pattern: '/api/v1/administration/users/:id/deactivate',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"users"],[1,"id"],[0,"deactivate"]],
    types: placeholder as Registry['administration.users.deactivate']['types'],
  },
  'administration.directorates.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/administration/directorates',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"directorates"]],
    types: placeholder as Registry['administration.directorates.index']['types'],
  },
  'administration.directorates.store': {
    methods: ["POST"],
    pattern: '/api/v1/administration/directorates',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"directorates"]],
    types: placeholder as Registry['administration.directorates.store']['types'],
  },
  'administration.directorates.update': {
    methods: ["PUT"],
    pattern: '/api/v1/administration/directorates/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"directorates"],[1,"id"]],
    types: placeholder as Registry['administration.directorates.update']['types'],
  },
  'administration.organizationChart': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/administration/organization-chart',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"organization-chart"]],
    types: placeholder as Registry['administration.organizationChart']['types'],
  },
  'administration.memberships.history': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/administration/users/:id/memberships',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"users"],[1,"id"],[0,"memberships"]],
    types: placeholder as Registry['administration.memberships.history']['types'],
  },
  'administration.memberships.store': {
    methods: ["POST"],
    pattern: '/api/v1/administration/memberships',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"memberships"]],
    types: placeholder as Registry['administration.memberships.store']['types'],
  },
  'administration.memberships.end': {
    methods: ["POST"],
    pattern: '/api/v1/administration/memberships/:id/end',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"memberships"],[1,"id"],[0,"end"]],
    types: placeholder as Registry['administration.memberships.end']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
