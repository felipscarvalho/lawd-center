import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import {
  projectPriorityColors,
  projectPriorityLabels,
  projectStatusColors,
  projectStatusLabels,
} from "@/lib/projects";
import type { ProjectPriority, ProjectStatus } from "@/types/projects";

/** Status do projeto, com a cor de cada fase */
export function ProjectStatusBadge({ status, size = "sm" }: { status: ProjectStatus; size?: "sm" | "md" }) {
  return (
    <BadgeWithDot size={size} type="modern" color={projectStatusColors[status]}>
      {projectStatusLabels[status]}
    </BadgeWithDot>
  );
}

/** Prioridade do projeto; sem prioridade aparece em texto discreto */
export function ProjectPriorityBadge({ priority, size = "sm" }: { priority: ProjectPriority | null; size?: "sm" | "md" }) {
  if (!priority) {
    return <span className="text-sm whitespace-nowrap text-quaternary">Sem prioridade</span>;
  }

  return (
    <Badge size={size} color={projectPriorityColors[priority]}>
      {projectPriorityLabels[priority]}
    </Badge>
  );
}
