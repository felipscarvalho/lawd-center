import type { BadgeColors } from "@/components/base/badges/badge-types";
import type { ProjectPriority, ProjectRole, ProjectSort, ProjectStatus } from "@/types/projects";

// Rótulos e cores do módulo projects

export const projectStatusLabels: Record<ProjectStatus, string> = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  suspended: "Suspenso",
  finished: "Finalizado",
};

export const projectStatusColors: Record<ProjectStatus, BadgeColors> = {
  not_started: "purple",
  in_progress: "success",
  suspended: "warning",
  finished: "blue",
};

export const projectPriorityLabels: Record<ProjectPriority, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

export const projectPriorityColors: Record<ProjectPriority, BadgeColors> = {
  high: "error",
  medium: "orange",
  low: "sky",
};

export const projectRoleLabels: Record<ProjectRole, string> = {
  coordinator: "Coordenador",
  member: "Integrante",
};

export const projectSortLabels: Record<ProjectSort, string> = {
  activity: "Atividade",
  team: "Tamanho do time",
  name: "Nome",
};

/** Diretoria sugerida para projetos novos */
export const defaultProjectDirectorateKey = "projects";
