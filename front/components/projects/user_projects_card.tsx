"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "@untitledui/icons";
import { Table, TableCard } from "@/components/application/table/table";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ErrorState, LoadingState } from "@/components/layout/query_states";
import { AddProjectMemberModal } from "@/components/projects/add_project_member_modal";
import { ProjectStatusBadge } from "@/components/projects/project_badges";
import { useUserProjects } from "@/hooks/projects/use_project_team";
import { formatDate } from "@/lib/moment";
import type { User } from "@/types/administration";

interface UserProjectsCardProps {
  userId: number;
  /** Pessoa que pode ser colocada em projetos por quem consulta (detalhe do usuário, com gestão de equipes) */
  addableUser?: User;
}

/** Projetos de uma pessoa (Meu perfil e detalhe do usuário): participações e interesses */
export function UserProjectsCard({ userId, addableUser }: UserProjectsCardProps) {
  const projects = useUserProjects(userId);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const participations = projects.data?.participations ?? [];
  const interests = projects.data?.interests ?? [];

  return (
    <TableCard.Root>
      <TableCard.Header
        title="Projetos"
        description="Equipes de que a pessoa faz ou fez parte, das atuais às antigas."
        contentTrailing={
          addableUser && (
            <Button size="sm" color="secondary" iconLeading={Plus} onClick={() => setIsAddOpen(true)}>
              Adicionar a projeto
            </Button>
          )
        }
      />

      {projects.isPending && <LoadingState size="sm" />}

      {projects.isError && (
        <div className="p-4">
          <ErrorState title="Não foi possível carregar os projetos" error={projects.error} />
        </div>
      )}

      {projects.data && participations.length === 0 && (
        <p className="px-6 py-8 text-sm text-tertiary">Ainda não participou de nenhum projeto.</p>
      )}

      {participations.length > 0 && (
        <Table aria-label="Projetos da pessoa">
          <Table.Header>
            <Table.Head id="project" label="Projeto" isRowHeader />
            <Table.Head id="role" label="Papel" className="hidden sm:table-cell" />
            <Table.Head id="period" label="Período" className="hidden md:table-cell" />
            <Table.Head id="status" label="Situação" />
          </Table.Header>
          <Table.Body items={participations}>
            {(participation) => (
              <Table.Row id={participation.id}>
                <Table.Cell className="w-full">
                  <Link
                    href={`/projects/${participation.projectId}`}
                    className="font-medium text-primary outline-focus-ring hover:underline focus-visible:outline-2"
                  >
                    {participation.project?.name}
                  </Link>
                  {/* No celular o papel aparece embaixo do nome */}
                  <span className="block text-sm text-tertiary sm:hidden">{participation.roleLabel}</span>
                </Table.Cell>
                <Table.Cell className="hidden whitespace-nowrap sm:table-cell">{participation.roleLabel}</Table.Cell>
                <Table.Cell className="hidden whitespace-nowrap md:table-cell">
                  {formatDate(participation.startsAt)} – {participation.endsAt ? formatDate(participation.endsAt) : "hoje"}
                </Table.Cell>
                <Table.Cell>
                  {participation.isActive && participation.project ? (
                    <ProjectStatusBadge status={participation.project.status} />
                  ) : (
                    <span className="text-sm whitespace-nowrap text-tertiary">Saiu da equipe</span>
                  )}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      )}

      {interests.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-secondary px-4 py-4 md:px-6">
          <span className="text-sm text-tertiary">Tem interesse em</span>
          <span className="flex flex-wrap gap-1.5">
            {interests.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="rounded-full outline-focus-ring focus-visible:outline-2">
                <Badge size="sm" color="brand">
                  {project.name}
                </Badge>
              </Link>
            ))}
          </span>
        </div>
      )}

      {addableUser && <AddProjectMemberModal user={addableUser} isOpen={isAddOpen} onOpenChange={setIsAddOpen} />}
    </TableCard.Root>
  );
}
