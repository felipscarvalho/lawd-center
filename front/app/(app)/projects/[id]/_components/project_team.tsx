"use client";

import { useState } from "react";
import { XClose } from "@untitledui/icons";
import { Table, TableCard } from "@/components/application/table/table";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { PersonLink } from "@/components/administration/person_link";
import { toast } from "@/components/feedback/toast";
import { ErrorState, LoadingState } from "@/components/layout/query_states";
import { ConfirmModal } from "@/components/overlays/confirm_modal";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useEndProjectMember, useProjectMembers } from "@/hooks/projects/use_project_team";
import { handleApiError } from "@/lib/form_errors";
import { formatDate } from "@/lib/moment";
import { isTeamLocked } from "@/lib/projects";
import type { Project, ProjectMember } from "@/types/projects";
import { displayName } from "@/lib/administration";

/**
 * Equipe com o histórico (ativos primeiro, coordenador antes). Tirar alguém encerra a participação hoje:
 * integrantes, quem gerencia a equipe (coordenador incluído); o coordenador, só a gestão de equipes.
 */
export function ProjectTeam({ project }: { project: Project }) {
  const members = useProjectMembers(project.id);
  const endMember = useEndProjectMember();
  const { can } = usePermissions();
  const [memberToEnd, setMemberToEnd] = useState<ProjectMember | null>(null);

  const canManageTeams = can("projects.team.manage", project.directorateId);
  const isLocked = isTeamLocked(project.status);
  const canEnd = (member: ProjectMember) =>
    member.isActive &&
    !isLocked &&
    Boolean(project.abilities?.canManageTeam) &&
    (member.role === "member" || canManageTeams);

  const confirmEnd = () => {
    if (!memberToEnd) return;

    endMember.mutate(
      { id: memberToEnd.id },
      {
        onSuccess: () => {
          toast.success("Pessoa retirada da equipe", { description: displayName(memberToEnd.user) });
          setMemberToEnd(null);
        },
        onError: (error) => handleApiError(error),
      },
    );
  };

  return (
    <>
      <TableCard.Root>
        <TableCard.Header
          title="Equipe"
          description={
            project.status === "suspended"
              ? "Projeto suspenso: a equipe não muda até ele ser retomado."
              : "Quem está no projeto e quem já passou por ele."
          }
        />

        {members.isPending && <LoadingState size="sm" />}

        {members.isError && (
          <div className="p-4">
            <ErrorState title="Não foi possível carregar a equipe" error={members.error} />
          </div>
        )}

        {members.data?.length === 0 && <p className="px-6 py-8 text-sm text-tertiary">Ninguém na equipe ainda.</p>}

        {members.data && members.data.length > 0 && (
          <Table aria-label="Equipe do projeto">
            <Table.Header>
              <Table.Head id="person" label="Pessoa" isRowHeader />
              <Table.Head id="startsAt" label="Entrada" className="hidden md:table-cell" />
              <Table.Head id="endsAt" label="Saída" className="hidden md:table-cell" />
              <Table.Head id="status" label="Situação" className="hidden sm:table-cell" />
              <Table.Head id="actions" />
            </Table.Header>
            <Table.Body items={members.data}>
              {(member) => (
                <Table.Row id={member.id}>
                  <Table.Cell className="w-full">
                    <PersonLink
                      userId={member.userId}
                      person={member.user}
                      // No celular a situação some: quem saiu mostra a data embaixo do nome
                      subtitle={member.endsAt ? `${member.roleLabel} · saiu em ${formatDate(member.endsAt)}` : member.roleLabel}
                    />
                  </Table.Cell>
                  <Table.Cell className="hidden whitespace-nowrap md:table-cell">{formatDate(member.startsAt)}</Table.Cell>
                  <Table.Cell className="hidden whitespace-nowrap md:table-cell">
                    {member.endsAt ? formatDate(member.endsAt) : "—"}
                  </Table.Cell>
                  <Table.Cell className="hidden sm:table-cell">
                    <BadgeWithDot size="sm" type="modern" color={member.isActive ? "success" : "gray"}>
                      {member.isActive ? "Na equipe" : "Saiu"}
                    </BadgeWithDot>
                  </Table.Cell>
                  <Table.Cell className="px-4">
                    {canEnd(member) && (
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        icon={XClose}
                        tooltip="Tirar da equipe"
                        aria-label="Tirar da equipe"
                        onClick={() => setMemberToEnd(member)}
                      />
                    )}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </TableCard.Root>

      <ConfirmModal
        isOpen={memberToEnd !== null}
        onOpenChange={(isOpen) => !isOpen && setMemberToEnd(null)}
        title="Tirar da equipe?"
        description={
          memberToEnd
            ? `${memberToEnd.user.fullName} deixará de ser ${memberToEnd.roleLabel.toLowerCase()} de ${project.name} a partir de hoje. O histórico é mantido.`
            : ""
        }
        confirmLabel="Tirar da equipe"
        onConfirm={confirmEnd}
        isConfirming={endMember.isPending}
      />
    </>
  );
}
