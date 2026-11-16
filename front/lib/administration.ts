import type {
  CareerPath,
  Course,
  DirectorateKind,
  MaturityLevel,
  Position,
  SoftSkill,
  WeeklyAvailability,
} from "@/types/administration";

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

// Rótulos do perfil (os valores vêm do backend em inglês)

export const courseLabels: Record<Course, string> = {
  information_systems: "Sistemas de Informação",
  computer_science: "Ciência da Computação",
  computer_engineering: "Engenharia da Computação",
  design: "Design",
  advertising: "Publicidade e Propaganda",
  other: "Outro",
};

export const weeklyAvailabilityLabels: Record<WeeklyAvailability, string> = {
  under_6h: "Menos de 6 horas semanais",
  from_6_to_8h: "De 6 a 8 horas semanais",
  from_9_to_12h: "De 9 a 12 horas semanais",
  over_12h: "Mais de 12 horas semanais",
};

export const maturityLabels: Record<MaturityLevel, string> = {
  beginner: "Iniciante",
  developing: "Em desenvolvimento",
  autonomous: "Autônomo",
  mentor: "Mentor",
};

export const maturityDescriptions: Record<MaturityLevel, string> = {
  beginner: "Ainda aprendendo os fundamentos",
  developing: "Já executa tarefas com apoio",
  autonomous: "Resolve problemas sozinho",
  mentor: "Ajuda outros membros",
};

export const careerPathLabels: Record<CareerPath, string> = {
  full_stack: "Full Stack",
  frontend: "Desenvolvimento Front-end",
  backend: "Desenvolvimento Back-end",
  devops: "DevOps",
  ui_ux: "UI/UX",
  project_management: "Gestão de Projetos / Scrum",
  research: "Pesquisa / Documentação",
};

export const softSkillLabels: Record<SoftSkill, string> = {
  communication: "Comunicação",
  teamwork: "Trabalho em equipe",
  leadership: "Liderança",
  organization: "Organização",
  proactivity: "Proatividade",
  autonomy: "Autonomia",
};

/** Máximo de opções que cada pessoa escolhe em carreira de interesse e em atributos (igual ao backend) */
export const maxProfileChoices = 3;

/** Transforma um mapa de rótulos em opções de Select ({ id, label }) */
export const toOptions = <T extends string>(labels: Record<T, string>) =>
  (Object.entries(labels) as [T, string][]).map(([id, label]) => ({ id, label }));
