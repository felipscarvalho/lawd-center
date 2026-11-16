/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  administration: {
    auth: {
      login: typeof routes['administration.auth.login']
      logout: typeof routes['administration.auth.logout']
      me: typeof routes['administration.auth.me']
    }
    users: {
      index: typeof routes['administration.users.index']
      show: typeof routes['administration.users.show']
      store: typeof routes['administration.users.store']
      update: typeof routes['administration.users.update']
      deactivate: typeof routes['administration.users.deactivate']
    }
    directorates: {
      index: typeof routes['administration.directorates.index']
      store: typeof routes['administration.directorates.store']
      update: typeof routes['administration.directorates.update']
    }
    organizationChart: typeof routes['administration.organizationChart']
    memberships: {
      history: typeof routes['administration.memberships.history']
      store: typeof routes['administration.memberships.store']
      end: typeof routes['administration.memberships.end']
    }
  }
}
