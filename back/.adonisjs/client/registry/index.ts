/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

export type { Route, Path } from './schema.d.ts'

const placeholder: any = {}

const routes = {
  'drive.fs.serve': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/uploads/*',
    tokens: [[0,"api"],[0,"v1"],[0,"uploads"],[2,"*"]],
    types: placeholder as Registry['drive.fs.serve']['types'],
  },
  'health.live': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/health/live',
    tokens: [[0,"api"],[0,"v1"],[0,"health"],[0,"live"]],
    types: placeholder as Registry['health.live']['types'],
  },
  'health.ready': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/health/ready',
    tokens: [[0,"api"],[0,"v1"],[0,"health"],[0,"ready"]],
    types: placeholder as Registry['health.ready']['types'],
  },
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
  'administration.auth.changePassword': {
    methods: ["PUT"],
    pattern: '/api/v1/administration/auth/password',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"auth"],[0,"password"]],
    types: placeholder as Registry['administration.auth.changePassword']['types'],
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
  'administration.profiles.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/administration/users/:id/profile',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"users"],[1,"id"],[0,"profile"]],
    types: placeholder as Registry['administration.profiles.show']['types'],
  },
  'administration.profiles.update': {
    methods: ["PUT"],
    pattern: '/api/v1/administration/users/:id/profile',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"users"],[1,"id"],[0,"profile"]],
    types: placeholder as Registry['administration.profiles.update']['types'],
  },
  'administration.profiles.updatePhoto': {
    methods: ["POST"],
    pattern: '/api/v1/administration/users/:id/profile/photo',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"users"],[1,"id"],[0,"profile"],[0,"photo"]],
    types: placeholder as Registry['administration.profiles.updatePhoto']['types'],
  },
  'administration.profiles.removePhoto': {
    methods: ["DELETE"],
    pattern: '/api/v1/administration/users/:id/profile/photo',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"users"],[1,"id"],[0,"profile"],[0,"photo"]],
    types: placeholder as Registry['administration.profiles.removePhoto']['types'],
  },
  'administration.profiles.updateTechnicalScore': {
    methods: ["PUT"],
    pattern: '/api/v1/administration/users/:id/technical-score',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"users"],[1,"id"],[0,"technical-score"]],
    types: placeholder as Registry['administration.profiles.updateTechnicalScore']['types'],
  },
  'administration.profileCatalogs.technologies': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/administration/technologies',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"technologies"]],
    types: placeholder as Registry['administration.profileCatalogs.technologies']['types'],
  },
  'administration.profileCatalogs.interestAreas': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/administration/interest-areas',
    tokens: [[0,"api"],[0,"v1"],[0,"administration"],[0,"interest-areas"]],
    types: placeholder as Registry['administration.profileCatalogs.interestAreas']['types'],
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
  'projects.projects.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/projects/projects',
    tokens: [[0,"api"],[0,"v1"],[0,"projects"],[0,"projects"]],
    types: placeholder as Registry['projects.projects.index']['types'],
  },
  'projects.projects.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/projects/projects/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"projects"],[0,"projects"],[1,"id"]],
    types: placeholder as Registry['projects.projects.show']['types'],
  },
  'projects.projects.store': {
    methods: ["POST"],
    pattern: '/api/v1/projects/projects',
    tokens: [[0,"api"],[0,"v1"],[0,"projects"],[0,"projects"]],
    types: placeholder as Registry['projects.projects.store']['types'],
  },
  'projects.projects.update': {
    methods: ["PUT"],
    pattern: '/api/v1/projects/projects/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"projects"],[0,"projects"],[1,"id"]],
    types: placeholder as Registry['projects.projects.update']['types'],
  },
  'projects.projectMembers.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/projects/projects/:id/members',
    tokens: [[0,"api"],[0,"v1"],[0,"projects"],[0,"projects"],[1,"id"],[0,"members"]],
    types: placeholder as Registry['projects.projectMembers.index']['types'],
  },
  'projects.projectMembers.store': {
    methods: ["POST"],
    pattern: '/api/v1/projects/projects/:id/members',
    tokens: [[0,"api"],[0,"v1"],[0,"projects"],[0,"projects"],[1,"id"],[0,"members"]],
    types: placeholder as Registry['projects.projectMembers.store']['types'],
  },
  'projects.projectMembers.end': {
    methods: ["POST"],
    pattern: '/api/v1/projects/project-members/:id/end',
    tokens: [[0,"api"],[0,"v1"],[0,"projects"],[0,"project-members"],[1,"id"],[0,"end"]],
    types: placeholder as Registry['projects.projectMembers.end']['types'],
  },
  'projects.projectMembers.forUser': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/projects/users/:id/projects',
    tokens: [[0,"api"],[0,"v1"],[0,"projects"],[0,"users"],[1,"id"],[0,"projects"]],
    types: placeholder as Registry['projects.projectMembers.forUser']['types'],
  },
  'projects.projectInterests.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/projects/projects/:id/interests',
    tokens: [[0,"api"],[0,"v1"],[0,"projects"],[0,"projects"],[1,"id"],[0,"interests"]],
    types: placeholder as Registry['projects.projectInterests.index']['types'],
  },
  'projects.projectInterests.store': {
    methods: ["POST"],
    pattern: '/api/v1/projects/projects/:id/interest',
    tokens: [[0,"api"],[0,"v1"],[0,"projects"],[0,"projects"],[1,"id"],[0,"interest"]],
    types: placeholder as Registry['projects.projectInterests.store']['types'],
  },
  'projects.projectInterests.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/projects/projects/:id/interest',
    tokens: [[0,"api"],[0,"v1"],[0,"projects"],[0,"projects"],[1,"id"],[0,"interest"]],
    types: placeholder as Registry['projects.projectInterests.destroy']['types'],
  },
  'projects.analytics.summary': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/projects/analytics',
    tokens: [[0,"api"],[0,"v1"],[0,"projects"],[0,"analytics"]],
    types: placeholder as Registry['projects.analytics.summary']['types'],
  },
  'projects.analytics.radar': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/projects/radar',
    tokens: [[0,"api"],[0,"v1"],[0,"projects"],[0,"radar"]],
    types: placeholder as Registry['projects.analytics.radar']['types'],
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
