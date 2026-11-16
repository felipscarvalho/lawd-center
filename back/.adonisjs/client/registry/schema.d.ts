/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractRawResponse, ExtractResponse, Method, PathWithRegistry, PatternsByMethod, RouteWithRegistry } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'
import type { routes } from './index.ts'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'administration.auth.login': {
    methods: ["POST"]
    pattern: '/api/v1/administration/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/administration/auth').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/administration/auth').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/auth_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/auth_controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/auth_controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administration.auth.logout': {
    methods: ["POST"]
    pattern: '/api/v1/administration/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/auth_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/auth_controller').default['logout']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/auth_controller').default['logout']>>>
    }
  }
  'administration.auth.me': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/administration/auth/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/auth_controller').default['me']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/auth_controller').default['me']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/auth_controller').default['me']>>>
    }
  }
  'administration.users.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/administration/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/administration/user').listUsersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administration.users.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/administration/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['show']>>>
    }
  }
  'administration.users.store': {
    methods: ["POST"]
    pattern: '/api/v1/administration/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/administration/user').createUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/administration/user').createUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administration.users.update': {
    methods: ["PUT"]
    pattern: '/api/v1/administration/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/administration/user').updateUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/administration/user').updateUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administration.users.deactivate': {
    methods: ["POST"]
    pattern: '/api/v1/administration/users/:id/deactivate'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['deactivate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['deactivate']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/users_controller').default['deactivate']>>>
    }
  }
  'administration.directorates.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/administration/directorates'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/directorates_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/directorates_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/directorates_controller').default['index']>>>
    }
  }
  'administration.directorates.store': {
    methods: ["POST"]
    pattern: '/api/v1/administration/directorates'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/administration/directorate').createDirectorateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/administration/directorate').createDirectorateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/directorates_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/directorates_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/directorates_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administration.directorates.update': {
    methods: ["PUT"]
    pattern: '/api/v1/administration/directorates/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/administration/directorate').updateDirectorateValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/administration/directorate').updateDirectorateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/directorates_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/directorates_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/directorates_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administration.organizationChart': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/administration/organization-chart'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/memberships_controller').default['organizationChart']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/memberships_controller').default['organizationChart']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/memberships_controller').default['organizationChart']>>>
    }
  }
  'administration.memberships.history': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/administration/users/:id/memberships'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/memberships_controller').default['history']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/memberships_controller').default['history']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/memberships_controller').default['history']>>>
    }
  }
  'administration.memberships.store': {
    methods: ["POST"]
    pattern: '/api/v1/administration/memberships'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/administration/membership').assignMembershipValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/administration/membership').assignMembershipValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/memberships_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/memberships_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/memberships_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'administration.memberships.end': {
    methods: ["POST"]
    pattern: '/api/v1/administration/memberships/:id/end'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/administration/membership').endMembershipValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/administration/membership').endMembershipValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/administration/memberships_controller').default['end']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/administration/memberships_controller').default['end']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/administration/memberships_controller').default['end']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}

export namespace Route {
  export type Request<Name extends keyof typeof routes> = RouteWithRegistry.Request<typeof routes, Name>
  export type Response<Name extends keyof typeof routes> = RouteWithRegistry.Response<typeof routes, Name>
  export type Params<Name extends keyof typeof routes> = RouteWithRegistry.Params<typeof routes, Name>
  export type Body<Name extends keyof typeof routes> = RouteWithRegistry.Body<typeof routes, Name>
  export type Query<Name extends keyof typeof routes> = RouteWithRegistry.Query<typeof routes, Name>
  export type Error<Name extends keyof typeof routes> = RouteWithRegistry.Error<typeof routes, Name>
}

export namespace Path {
  export type Request<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Request<typeof routes, M, P>
  export type Response<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Response<typeof routes, M, P>
  export type Params<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Params<typeof routes, M, P>
  export type Body<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Body<typeof routes, M, P>
  export type Query<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Query<typeof routes, M, P>
  export type Error<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Error<typeof routes, M, P>
}
