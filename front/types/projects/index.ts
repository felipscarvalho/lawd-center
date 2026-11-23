import type { Directorate, User } from "@/types/administration";

// Tipos espelhando os DTOs e transformers do módulo projects do backend

export type ProjectStatus = "not_started" | "in_progress" | "suspended" | "finished";

export type ProjectPriority = "high" | "medium" | "low";

export type ProjectRole = "coordinator" | "member";

/** activity: em andamento primeiro e times maiores antes; team: tamanho do time; name: nome */
export type ProjectSort = "activity" | "team" | "name";

/** Dados do próprio projeto, sem equipe nem contagens */
export interface ProjectSummary {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority | null;
  directorateId: number;
  startsAt: string | null;
  expectedEndAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export interface ProjectAbilities {
  /** Editar dados e status */
  canEdit: boolean;
  /** Adicionar e tirar integrantes (coordenador incluído, com a gestão de equipes) */
  canManageTeam: boolean;
}

export interface Project extends ProjectSummary {
  directorate: Directorate;
  coordinator: User | null;
  /** Integrantes ativos, coordenador incluído */
  teamSize: number;
  interestCount: number;
  /** Só no detalhe: o que quem consulta pode fazer e a relação dela com o projeto */
  abilities?: ProjectAbilities;
  isMember?: boolean;
  isInterested?: boolean;
}

export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  role: ProjectRole;
  roleLabel: string;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
  user: User;
  /** Só nos projetos de uma pessoa */
  project?: ProjectSummary;
}

export interface ProjectInterest {
  id: number;
  createdAt: string;
  user: User;
}

/** Projetos de uma pessoa: participações (ativas primeiro) e interesses em projetos abertos */
export interface UserProjects {
  participations: ProjectMember[];
  interests: ProjectSummary[];
}

export interface ProjectCount {
  project: ProjectSummary;
  value: number;
}

export interface ProjectsAnalytics {
  total: number;
  byStatus: Record<ProjectStatus, number>;
  /** Só projetos não finalizados; none = sem prioridade */
  byPriority: Record<ProjectPriority | "none", number>;
  allocatedPeople: number;
  unallocatedPeople: number;
  /** Projetos em andamento, do maior time ao menor */
  teamSizes: ProjectCount[];
  /** Projetos abertos com interessados, do mais procurado ao menos */
  interests: ProjectCount[];
}

/** Pessoa fora das equipes, no radar de alocação */
export interface RadarEntry {
  /** Com perfil resumido e cargos ativos */
  user: User;
  /** Só para quem pode ver os dados privados da pessoa */
  technicalScore: number | null;
  technologies: string[];
  interestAreas: string[];
  interestedProjects: ProjectSummary[];
}

export interface ProjectPayload {
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority | null;
  directorateId: number;
  startsAt: string | null;
  expectedEndAt: string | null;
  endedAt?: string | null;
}

export interface AddProjectMemberPayload {
  userId: number;
  role: ProjectRole;
  /** YYYY-MM-DD; omitido = hoje */
  startsAt?: string;
}

export interface EndProjectMemberPayload {
  /** YYYY-MM-DD; omitido = hoje */
  endsAt?: string;
}
