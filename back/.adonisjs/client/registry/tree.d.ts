/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  health: {
    live: typeof routes['health.live']
    ready: typeof routes['health.ready']
  }
  projects: {
    projects: {
      index: typeof routes['projects.projects.index']
      show: typeof routes['projects.projects.show']
      store: typeof routes['projects.projects.store']
      update: typeof routes['projects.projects.update']
    }
    projectMembers: {
      index: typeof routes['projects.projectMembers.index']
      store: typeof routes['projects.projectMembers.store']
      end: typeof routes['projects.projectMembers.end']
      forUser: typeof routes['projects.projectMembers.forUser']
    }
    projectInterests: {
      index: typeof routes['projects.projectInterests.index']
      store: typeof routes['projects.projectInterests.store']
      destroy: typeof routes['projects.projectInterests.destroy']
    }
    analytics: {
      summary: typeof routes['projects.analytics.summary']
      radar: typeof routes['projects.analytics.radar']
    }
  }
  administration: {
    auth: {
      login: typeof routes['administration.auth.login']
      logout: typeof routes['administration.auth.logout']
      me: typeof routes['administration.auth.me']
      changePassword: typeof routes['administration.auth.changePassword']
    }
    invitations: {
      show: typeof routes['administration.invitations.show']
      accept: typeof routes['administration.invitations.accept']
    }
    users: {
      index: typeof routes['administration.users.index']
      show: typeof routes['administration.users.show']
      store: typeof routes['administration.users.store']
      resendInvitation: typeof routes['administration.users.resendInvitation']
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
  recruitment: {
    selectionSubscribers: {
      store: typeof routes['recruitment.selectionSubscribers.store']
    }
  }
}
