"use client";

import { useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { XClose } from "@untitledui/icons";
import { Table, TableCard } from "@/components/application/table/table";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { EndMembershipModal } from "@/components/administration/end_membership_modal";
import { ErrorState, LoadingState } from "@/components/layout/query_states";
import { useCanEndMembership } from "@/hooks/administration/use_memberships";
import { formatDate } from "@/lib/moment";
import type { Membership } from "@/types/administration";

interface MembershipHistoryProps {
  memberships: UseQueryResult<Membership[]>;
}

/** Histórico de cargos do usuário; vínculos ativos podem ser encerrados por quem gerencia a diretoria */
export function MembershipHistory({ memberships }: MembershipHistoryProps) {
  const canEnd = useCanEndMembership();
  const [membershipToEnd, setMembershipToEnd] = useState<Membership | null>(null);

  return (
    <>
      <TableCard.Root>
        <TableCard.Header title="Histórico de cargos" description="Todos os vínculos, do mais recente ao mais antigo." />

        {memberships.isPending && <LoadingState size="sm" />}

        {memberships.isError && (
          <div className="p-4">
            <ErrorState title="Não foi possível carregar o histórico" error={memberships.error} />
          </div>
        )}

        {memberships.data?.length === 0 && <p className="px-6 py-8 text-sm text-tertiary">Nenhum cargo atribuído ainda.</p>}

        {memberships.data && memberships.data.length > 0 && (
          <Table aria-label="Histórico de cargos">
            <Table.Header>
              <Table.Head id="directorate" label="Diretoria" isRowHeader />
              <Table.Head id="position" label="Cargo" className="hidden w-full sm:table-cell" />
              <Table.Head id="startsAt" label="Início" className="hidden sm:table-cell" />
              <Table.Head id="endsAt" label="Término" className="hidden sm:table-cell" />
              <Table.Head id="status" label="Situação" />
              <Table.Head id="actions" />
            </Table.Header>
            <Table.Body items={memberships.data}>
              {(membership) => (
                <Table.Row id={membership.id}>
                  <Table.Cell className="font-medium whitespace-nowrap text-primary">
                    {membership.directorate?.name}
                    {/* No celular a coluna de cargo some: o cargo aparece embaixo da diretoria */}
                    <span className="block text-sm font-normal text-tertiary sm:hidden">{membership.positionLabel}</span>
                  </Table.Cell>
                  <Table.Cell className="hidden whitespace-nowrap sm:table-cell">{membership.positionLabel}</Table.Cell>
                  <Table.Cell className="hidden whitespace-nowrap sm:table-cell">{formatDate(membership.startsAt)}</Table.Cell>
                  <Table.Cell className="hidden whitespace-nowrap sm:table-cell">{membership.endsAt ? formatDate(membership.endsAt) : "—"}</Table.Cell>
                  <Table.Cell>
                    <BadgeWithDot size="sm" type="modern" color={membership.isActive ? "success" : "gray"}>
                      {membership.isActive ? "Ativo" : "Encerrado"}
                    </BadgeWithDot>
                  </Table.Cell>
                  <Table.Cell className="px-4">
                    {canEnd(membership) && (
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        icon={XClose}
                        tooltip="Encerrar vínculo"
                        aria-label="Encerrar vínculo"
                        onClick={() => setMembershipToEnd(membership)}
                      />
                    )}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </TableCard.Root>

      <EndMembershipModal membership={membershipToEnd} onClose={() => setMembershipToEnd(null)} />
    </>
  );
}
