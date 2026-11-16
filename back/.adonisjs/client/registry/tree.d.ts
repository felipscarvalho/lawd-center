/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  administration: {
    auth: {
      login: typeof routes['administration.auth.login']
      logout: typeof routes['administration.auth.logout']
      me: typeof routes['administration.auth.me']
      changePassword: typeof routes['administration.auth.changePassword']
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
    profiles: {
      show: typeof routes['administration.profiles.show']
      update: typeof routes['administration.profiles.update']
      updatePhoto: typeof routes['administration.profiles.updatePhoto']
      removePhoto: typeof routes['administration.profiles.removePhoto']
      updateTechnicalScore: typeof routes['administration.profiles.updateTechnicalScore']
    }
    profileCatalogs: {
      technologies: typeof routes['administration.profileCatalogs.technologies']
      interestAreas: typeof routes['administration.profileCatalogs.interestAreas']
    }
  }
}
