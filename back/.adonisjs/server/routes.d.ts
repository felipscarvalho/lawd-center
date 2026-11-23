import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'health.live': { paramsTuple?: []; params?: {} }
    'health.ready': { paramsTuple?: []; params?: {} }
    'recruitment.selectionSubscribers.store': { paramsTuple?: []; params?: {} }
    'administration.auth.login': { paramsTuple?: []; params?: {} }
    'administration.auth.logout': { paramsTuple?: []; params?: {} }
    'administration.auth.me': { paramsTuple?: []; params?: {} }
    'administration.auth.changePassword': { paramsTuple?: []; params?: {} }
    'administration.users.index': { paramsTuple?: []; params?: {} }
    'administration.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.users.store': { paramsTuple?: []; params?: {} }
    'administration.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.users.deactivate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.directorates.index': { paramsTuple?: []; params?: {} }
    'administration.directorates.store': { paramsTuple?: []; params?: {} }
    'administration.directorates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.organizationChart': { paramsTuple?: []; params?: {} }
    'administration.memberships.history': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.profiles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.profiles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.profiles.updatePhoto': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.profiles.removePhoto': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.profiles.updateTechnicalScore': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.profileCatalogs.technologies': { paramsTuple?: []; params?: {} }
    'administration.profileCatalogs.interestAreas': { paramsTuple?: []; params?: {} }
    'administration.memberships.store': { paramsTuple?: []; params?: {} }
    'administration.memberships.end': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projects.index': { paramsTuple?: []; params?: {} }
    'projects.projects.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projects.store': { paramsTuple?: []; params?: {} }
    'projects.projects.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectMembers.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectMembers.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectMembers.end': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectMembers.forUser': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectInterests.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectInterests.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectInterests.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.analytics.summary': { paramsTuple?: []; params?: {} }
    'projects.analytics.radar': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'health.live': { paramsTuple?: []; params?: {} }
    'health.ready': { paramsTuple?: []; params?: {} }
    'administration.auth.me': { paramsTuple?: []; params?: {} }
    'administration.users.index': { paramsTuple?: []; params?: {} }
    'administration.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.directorates.index': { paramsTuple?: []; params?: {} }
    'administration.organizationChart': { paramsTuple?: []; params?: {} }
    'administration.memberships.history': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.profiles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.profileCatalogs.technologies': { paramsTuple?: []; params?: {} }
    'administration.profileCatalogs.interestAreas': { paramsTuple?: []; params?: {} }
    'projects.projects.index': { paramsTuple?: []; params?: {} }
    'projects.projects.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectMembers.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectMembers.forUser': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectInterests.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.analytics.summary': { paramsTuple?: []; params?: {} }
    'projects.analytics.radar': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'health.live': { paramsTuple?: []; params?: {} }
    'health.ready': { paramsTuple?: []; params?: {} }
    'administration.auth.me': { paramsTuple?: []; params?: {} }
    'administration.users.index': { paramsTuple?: []; params?: {} }
    'administration.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.directorates.index': { paramsTuple?: []; params?: {} }
    'administration.organizationChart': { paramsTuple?: []; params?: {} }
    'administration.memberships.history': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.profiles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.profileCatalogs.technologies': { paramsTuple?: []; params?: {} }
    'administration.profileCatalogs.interestAreas': { paramsTuple?: []; params?: {} }
    'projects.projects.index': { paramsTuple?: []; params?: {} }
    'projects.projects.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectMembers.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectMembers.forUser': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectInterests.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.analytics.summary': { paramsTuple?: []; params?: {} }
    'projects.analytics.radar': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'recruitment.selectionSubscribers.store': { paramsTuple?: []; params?: {} }
    'administration.auth.login': { paramsTuple?: []; params?: {} }
    'administration.auth.logout': { paramsTuple?: []; params?: {} }
    'administration.users.store': { paramsTuple?: []; params?: {} }
    'administration.users.deactivate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.directorates.store': { paramsTuple?: []; params?: {} }
    'administration.profiles.updatePhoto': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.memberships.store': { paramsTuple?: []; params?: {} }
    'administration.memberships.end': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projects.store': { paramsTuple?: []; params?: {} }
    'projects.projectMembers.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectMembers.end': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectInterests.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'administration.auth.changePassword': { paramsTuple?: []; params?: {} }
    'administration.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.directorates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.profiles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.profiles.updateTechnicalScore': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projects.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'administration.profiles.removePhoto': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'projects.projectInterests.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}