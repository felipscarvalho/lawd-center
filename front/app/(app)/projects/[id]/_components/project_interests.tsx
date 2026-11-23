"use client";

import { UserPlus01 } from "@untitledui/icons";
import { Table, TableCard } from "@/components/application/table/table";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { PersonLink } from "@/components/administration/person_link";
import { ErrorState, LoadingState } from "@/components/layout/query_states";
import { useProjectInterests } from "@/hooks/projects/use_project_interests";
import { maturityLabels, weeklyAvailabilityShortLabels } from "@/lib/administration";
import { formatDate } from "@/lib/moment";
import type { User } from "@/types/administration";
import type { Project } from "@/types/projects";

interface ProjectInterestsProps {
  project: Project;
  /** Quem gerencia a equipe pode trazer o interessado para o projeto */
  canAllocate: boolean;
  onAllocate: (user: User) => void;
}

const emptyValue = <span className="text-quaternary">—</span>;

/** Pessoas que marcaram interesse, com o que ajuda a decidir a alocação (maturidade e disponibilidade) */
export function ProjectInterests({ project, canAllocate, onAllocate }: ProjectInterestsProps) {
  const interests = useProjectInterests(project.id);

  return (
    <TableCard.Root>
      <TableCard.Header title="Interessados" description="Quem quer participar, do interesse mais antigo ao mais novo." />

      {interests.isPending && <LoadingState size="sm" />}

      {interests.isError && (
        <div className="p-4">
          <ErrorState title="Não foi possível carregar os interessados" error={interests.error} />
        </div>
      )}

      {interests.data?.length === 0 && (
        <p className="px-6 py-8 text-sm text-tertiary">Ninguém marcou interesse neste projeto ainda.</p>
      )}

      {interests.data && interests.data.length > 0 && (
        <Table aria-label="Interessados no projeto">
          <Table.Header>
            <Table.Head id="person" label="Pessoa" isRowHeader />
            <Table.Head id="maturity" label="Maturidade" className="hidden md:table-cell" />
            <Table.Head id="availability" label="Disponibilidade" className="hidden lg:table-cell" />
            <Table.Head id="since" label="Desde" className="hidden sm:table-cell" />
            <Table.Head id="actions" />
          </Table.Header>
          <Table.Body items={interests.data}>
            {(interest) => (
              <Table.Row id={interest.id}>
                <Table.Cell className="w-full">
                  <PersonLink userId={interest.user.id} person={interest.user} subtitle={interest.user.email} />
                </Table.Cell>
                <Table.Cell className="hidden whitespace-nowrap md:table-cell">
                  {interest.user.profile?.maturity ? maturityLabels[interest.user.profile.maturity] : emptyValue}
                </Table.Cell>
                <Table.Cell className="hidden whitespace-nowrap lg:table-cell">
                  {interest.user.profile?.weeklyAvailability
                    ? weeklyAvailabilityShortLabels[interest.user.profile.weeklyAvailability]
                    : emptyValue}
                </Table.Cell>
                <Table.Cell className="hidden whitespace-nowrap sm:table-cell">{formatDate(interest.createdAt)}</Table.Cell>
                <Table.Cell className="px-4">
                  {canAllocate && (
                    <ButtonUtility
                      size="xs"
                      color="tertiary"
                      icon={UserPlus01}
                      tooltip="Adicionar à equipe"
                      aria-label="Adicionar à equipe"
                      onClick={() => onAllocate(interest.user)}
                    />
                  )}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      )}
    </TableCard.Root>
  );
}
