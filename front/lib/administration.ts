import type { DirectorateKind, Position } from "@/types/administration";

// Rótulos e regras de cargos, espelhando app/permissions/positions.ts do backend

export const positionLabels: Record<Position, string> = {
  president: "Presidente",
  vice_president: "Vice-presidente",
  general_secretary: "Secretário-geral",
  director: "Diretor",
  member: "Membro efetivo",
};

/** Cargos permitidos por tipo de diretoria (núcleo institucional ou diretoria comum) */
export const positionsByKind: Record<DirectorateKind, Position[]> = {
  core: ["president", "vice_president", "general_secretary"],
  standard: ["director", "member"],
};

export const directorateKindLabels: Record<DirectorateKind, string> = {
  core: "Núcleo institucional",
  standard: "Diretoria",
};

/** Iniciais para o avatar (ex.: "Maria Souza" → "MS") */
export const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
