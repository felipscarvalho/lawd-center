"use client";

import { SplitCard } from "@/components/layout/card";
import { DetailField } from "@/components/layout/detail_section";
import { PersonLink } from "@/components/administration/person_link";
import { pluralize } from "@/lib/format";
import { formatDate } from "@/lib/moment";
import type { Project } from "@/types/projects";
import { ProjectDetails } from "./project_details";
import { ProjectEditForm } from "./project_edit_form";

const people = (count: number) => pluralize(count, "pessoa", "pessoas");

/**
 * Card único do projeto: à esquerda quem coordena e os números da equipe; à direita os dados,
 * já editáveis para quem pode editar (sem botão "Editar") e só leitura para os demais.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <SplitCard
      aside={
        <dl className="flex flex-col gap-4">
          <DetailField label="Coordenação">
            {project.coordinator ? (
              <PersonLink userId={project.coordinator.id} person={project.coordinator} size="md" />
            ) : (
              <span className="text-quaternary">Sem coordenador</span>
            )}
          </DetailField>

          <DetailField label="Equipe atual">{people(project.teamSize)}</DetailField>

          <DetailField label="Interessados">{people(project.interestCount)}</DetailField>

          <DetailField label="Cadastrado em">{formatDate(project.createdAt)}</DetailField>
        </dl>
      }
    >
      {project.abilities?.canEdit ? <ProjectEditForm project={project} /> : <ProjectDetails project={project} />}
    </SplitCard>
  );
}
