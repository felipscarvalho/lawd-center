import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'administration.auth.login': { paramsTuple?: []; params?: {} }
    'administration.auth.logout': { paramsTuple?: []; params?: {} }
    'administration.auth.me': { paramsTuple?: []; params?: {} }
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
    'administration.memberships.store': { paramsTuple?: []; params?: {} }
    'administration.memberships.end': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'administration.auth.login': { paramsTuple?: []; params?: {} }
    'administration.auth.logout': { paramsTuple?: []; params?: {} }
    'administration.users.store': { paramsTuple?: []; params?: {} }
    'administration.users.deactivate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.directorates.store': { paramsTuple?: []; params?: {} }
    'administration.memberships.store': { paramsTuple?: []; params?: {} }
    'administration.memberships.end': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'administration.auth.me': { paramsTuple?: []; params?: {} }
    'administration.users.index': { paramsTuple?: []; params?: {} }
    'administration.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.directorates.index': { paramsTuple?: []; params?: {} }
    'administration.organizationChart': { paramsTuple?: []; params?: {} }
    'administration.memberships.history': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'administration.auth.me': { paramsTuple?: []; params?: {} }
    'administration.users.index': { paramsTuple?: []; params?: {} }
    'administration.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.directorates.index': { paramsTuple?: []; params?: {} }
    'administration.organizationChart': { paramsTuple?: []; params?: {} }
    'administration.memberships.history': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'administration.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'administration.directorates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}