import { DetailField, Section } from "@/components/layout/detail_section";
import { ProjectPriorityBadge, ProjectStatusBadge } from "@/components/projects/project_badges";
import { formatDate } from "@/lib/moment";
import type { Project } from "@/types/projects";

const date = (value: string | null) => (value ? formatDate(value) : null);

/** Leitura do projeto, nas mesmas seções do formulário, para quem não pode editar */
export function ProjectDetails({ project }: { project: Project }) {
  return (
    <div className="flex min-w-0 flex-col gap-6 p-5 sm:p-6">
      <Section title="Projeto">
        <dl className="grid gap-5 sm:grid-cols-3">
          <DetailField label="Diretoria">{project.directorate.name}</DetailField>
          <DetailField label="Status">
            <ProjectStatusBadge status={project.status} />
          </DetailField>
          <DetailField label="Prioridade">
            <ProjectPriorityBadge priority={project.priority} />
          </DetailField>
        </dl>
      </Section>

      <Section title="Datas">
        <dl className="grid gap-5 sm:grid-cols-3">
          <DetailField label="Início">{date(project.startsAt)}</DetailField>
          <DetailField label="Previsão de término">{date(project.expectedEndAt)}</DetailField>
          {project.status === "finished" && <DetailField label="Término">{date(project.endedAt)}</DetailField>}
        </dl>
      </Section>

      <Section title="Descrição">
        <dl>
          <DetailField label="Sobre o projeto">
            {project.description ? <span className="whitespace-pre-line">{project.description}</span> : null}
          </DetailField>
        </dl>
      </Section>
    </div>
  );
}
