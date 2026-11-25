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
  | "administration.profile.evaluate"
  | "projects.project.view"
  | "projects.project.manage"
  | "projects.team.manage";

export type PermissionScope = "global" | "directorate";

export interface EffectivePermission {
  permission: PermissionKey;
  scope: PermissionScope;
  directorateId: number | null;
}

export type Position = "president" | "vice_president" | "general_secretary" | "counselor" | "director" | "member";

export type DirectorateKind = "core" | "standard";

export interface User {
  id: number;
  /** null enquanto a pessoa não aceita o convite (o nome é informado por ela ao criar a senha) */
  fullName: string | null;
  email: string;
  isActive: boolean;
  /** Convite ainda não aceito: sem senha, não entra no sistema */
  isPending: boolean;
  deactivatedAt: string | null;
  createdAt: string;
  photoUrl: string | null;
  /** Resumo público do perfil: só na lista de usuários (null se nunca preenchido) */
  profile?: UserProfileSummary | null;
  /** Cargos ativos: só na lista de usuários */
  memberships?: Membership[];
}

export interface UserProfileSummary {
  course: Course | null;
  universityEntryPeriod: string | null;
  weeklyAvailability: WeeklyAvailability | null;
  maturity: MaturityLevel | null;
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

/** Cadastro por convite: só o e-mail; a pessoa recebe o link para criar a senha */
export interface CreateUserPayload {
  email: string;
}

/** Convite visto na página pública, antes de criar a senha */
export interface Invitation {
  email: string;
  /** Nome já informado pela gestão, para vir preenchido */
  fullName: string | null;
}

export interface AcceptInvitationPayload {
  fullName: string;
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
  registrationNumber: string | null;
  course: Course | null;
  universityEntryPeriod: string | null;
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
  registrationNumber?: string | null;
  course?: Course | null;
  universityEntryPeriod?: string | null;
  weeklyAvailability?: WeeklyAvailability | null;
  maturity?: MaturityLevel | null;
  careerPaths?: CareerPath[];
  softSkills?: SoftSkill[];
  goal?: string | null;
  technologies?: string[];
  interestAreas?: string[];
}
