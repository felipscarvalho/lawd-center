// Tipos espelhando os DTOs e transformers do módulo administration do backend

export type PermissionKey =
  | "administration.user.view"
  | "administration.user.create"
  | "administration.user.update"
  | "administration.user.deactivate"
  | "administration.directorate.view"
  | "administration.directorate.manage"
  | "administration.membership.view"
  | "administration.membership.manage"
  | "administration.profile.view"
  | "administration.profile.view_private"
  | "administration.profile.update"
  | "administration.profile.evaluate";

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
  photoUrl: string | null;
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

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
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

// Perfil

export type Course =
  | "information_systems"
  | "computer_science"
  | "computer_engineering"
  | "design"
  | "advertising"
  | "other";

export type WeeklyAvailability = "under_6h" | "from_6_to_8h" | "from_9_to_12h" | "over_12h";

export type MaturityLevel = "beginner" | "developing" | "autonomous" | "mentor";

export type CareerPath = "full_stack" | "frontend" | "backend" | "devops" | "ui_ux" | "project_management" | "research";

export type SoftSkill = "communication" | "teamwork" | "leadership" | "organization" | "proactivity" | "autonomy";

/** O que quem está vendo o perfil pode fazer com ele */
export interface ProfileAbilities {
  canUpdate: boolean;
  canViewPrivate: boolean;
  canEvaluate: boolean;
}

/** Perfil visto por quem consulta: campos privados vêm null quando não liberados */
export interface Profile {
  user: User;
  birthDate: string | null;
  course: Course | null;
  universityEntryPeriod: string | null;
  graduated: boolean;
  photoUrl: string | null;
  weeklyAvailability: WeeklyAvailability | null;
  maturity: MaturityLevel | null;
  careerPaths: CareerPath[];
  softSkills: SoftSkill[];
  goal: string | null;
  technicalScore: number | null;
  technicalScoreUpdatedAt: string | null;
  technologies: string[];
  interestAreas: string[];
  abilities: ProfileAbilities;
}

export interface UpdateProfilePayload {
  birthDate?: string | null;
  course?: Course | null;
  universityEntryPeriod?: string | null;
  graduated?: boolean;
  weeklyAvailability?: WeeklyAvailability | null;
  maturity?: MaturityLevel | null;
  careerPaths?: CareerPath[];
  softSkills?: SoftSkill[];
  goal?: string | null;
  technologies?: string[];
  interestAreas?: string[];
}
