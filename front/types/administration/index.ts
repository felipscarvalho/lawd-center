// Tipos espelhando os DTOs e transformers do módulo administration do backend

export type PermissionKey =
  | "administration.user.view"
  | "administration.user.create"
  | "administration.user.update"
  | "administration.user.deactivate"
  | "administration.directorate.view"
  | "administration.directorate.manage"
  | "administration.membership.view"
  | "administration.membership.manage";

export type PermissionScope = "global" | "directorate";

export interface EffectivePermission {
  permission: PermissionKey;
  scope: PermissionScope;
  directorateId: number | null;
}

export type Position = "president" | "vice_president" | "general_secretary" | "director" | "member";

export type DirectorateKind = "core" | "standard";

export interface User {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
  deactivatedAt: string | null;
  createdAt: string;
}

export interface Membership {
  id: number;
  position: Position;
  positionLabel: string;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
  userId: number;
  directorateId: number;
  user?: User;
  directorate?: Directorate;
}

export interface Directorate {
  id: number;
  key: string;
  name: string;
  kind: DirectorateKind;
  memberships?: Membership[];
}

export interface CurrentUser {
  user: User;
  permissions: EffectivePermission[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Payloads

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  password?: string;
}

export interface CreateDirectoratePayload {
  key: string;
  name: string;
  kind: DirectorateKind;
}

export interface UpdateDirectoratePayload {
  name?: string;
}

export interface AssignMembershipPayload {
  userId: number;
  directorateId: number;
  position: Position;
  /** YYYY-MM-DD */
  startsAt?: string;
}

export interface EndMembershipPayload {
  /** YYYY-MM-DD */
  endsAt?: string;
}
