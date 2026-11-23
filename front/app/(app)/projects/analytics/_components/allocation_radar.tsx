"use client";

import Link from "next/link";
import { Table, TableCard } from "@/components/application/table/table";
import { Badge } from "@/components/base/badges/badges";
import { PersonLink } from "@/components/administration/person_link";
import { ErrorState, LoadingState } from "@/components/layout/query_states";
import { useProjectsRadar } from "@/hooks/projects/use_project_analytics";
import { maturityLabels, weeklyAvailabilityShortLabels } from "@/lib/administration";

const emptyValue = <span className="text-quaternary">—</span>;

/**
 * Quem está fora de qualquer equipe, das pessoas mais disponíveis e maduras para as menos. A nota
 * técnica só vem para quem pode vê-la (e não muda a ordem).
 */
export function AllocationRadar() {
  const radar = useProjectsRadar();

  return (
    <TableCard.Root>
      <TableCard.Header
        title="Radar de alocação"
        description="Pessoas ativas na liga sem projeto, das mais disponíveis e maduras para as menos."
      />

      {radar.isPending && <LoadingState size="sm" />}

      {radar.isError && (
        <div className="p-4">
          <ErrorState title="Não foi possível carregar o radar" error={radar.error} />
        </div>
      )}

      {radar.data?.length === 0 && <p className="px-6 py-8 text-sm text-tertiary">Todo mundo está em algum projeto.</p>}

      {radar.data && radar.data.length > 0 && (
        <Table aria-label="Radar de alocação">
          <Table.Header>
            <Table.Head id="person" label="Pessoa" isRowHeader />
            <Table.Head id="availability" label="Disponibilidade" className="hidden sm:table-cell" />
            <Table.Head id="maturity" label="Maturidade" className="hidden md:table-cell" />
            <Table.Head id="score" label="Nota" className="hidden md:table-cell" />
            <Table.Head id="technologies" label="Tecnologias" className="hidden 2xl:table-cell" />
            <Table.Head id="interests" label="Interesse em" className="hidden lg:table-cell" />
          </Table.Header>
          <Table.Body items={radar.data.map((entry) => ({ ...entry, id: entry.user.id }))}>
            {(entry) => {
              const profile = entry.user.profile;
              // Primeiro cargo e quantos mais, para o subtítulo não alargar a tabela
              const [first, ...others] = entry.user.memberships ?? [];
              const positions = first
                ? `${first.positionLabel} · ${first.directorate?.name}${others.length > 0 ? ` +${others.length}` : ""}`
                : undefined;

              return (
                <Table.Row id={entry.id}>
                  <Table.Cell className="w-full min-w-56">
                    <PersonLink userId={entry.user.id} person={entry.user} subtitle={positions} />
                  </Table.Cell>
                  <Table.Cell className="hidden whitespace-nowrap sm:table-cell">
                    {profile?.weeklyAvailability ? weeklyAvailabilityShortLabels[profile.weeklyAvailability] : emptyValue}
                  </Table.Cell>
                  <Table.Cell className="hidden whitespace-nowrap md:table-cell">
                    {profile?.maturity ? maturityLabels[profile.maturity] : emptyValue}
                  </Table.Cell>
                  <Table.Cell className="hidden whitespace-nowrap md:table-cell">
                    {entry.technicalScore === null ? emptyValue : entry.technicalScore.toLocaleString("pt-BR")}
                  </Table.Cell>
                  <Table.Cell className="hidden 2xl:table-cell">
                    {entry.technologies.length > 0 ? (
                      <span className="flex flex-wrap gap-1">
                        {entry.technologies.map((technology) => (
                          <Badge key={technology} size="sm" color="gray">
                            {technology}
                          </Badge>
                        ))}
                      </span>
                    ) : (
                      emptyValue
                    )}
                  </Table.Cell>
                  <Table.Cell className="hidden lg:table-cell">
                    {entry.interestedProjects.length > 0 ? (
                      <span className="flex flex-wrap gap-1">
                        {entry.interestedProjects.map((project) => (
                          <Link key={project.id} href={`/projects/${project.id}`} className="rounded-full outline-focus-ring focus-visible:outline-2">
                            <Badge size="sm" color="brand">
                              {project.name}
                            </Badge>
                          </Link>
                        ))}
                      </span>
                    ) : (
                      emptyValue
                    )}
                  </Table.Cell>
                </Table.Row>
              );
            }}
          </Table.Body>
        </Table>
      )}
    </TableCard.Root>
  );
}
