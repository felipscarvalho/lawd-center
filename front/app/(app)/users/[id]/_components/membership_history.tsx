"use client";

import { useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { XClose } from "@untitledui/icons";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Table, TableCard } from "@/components/application/table/table";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Alert } from "@/components/feedback/alert";
import { toast } from "@/components/feedback/toast";
import { ConfirmModal } from "@/components/overlays/confirm_modal";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useEndMembership } from "@/hooks/administration/use_memberships";
import { handleApiError } from "@/lib/form_errors";
import { formatDate } from "@/lib/moment";
import type { Membership } from "@/types/administration";

interface MembershipHistoryProps {
  memberships: UseQueryResult<Membership[]>;
}

/** Histórico de cargos do usuário; vínculos ativos podem ser encerrados por quem gerencia a diretoria */
export function MembershipHistory({ memberships }: MembershipHistoryProps) {
  const { can } = usePermissions();
  const endMembership = useEndMembership();
  const [membershipToEnd, setMembershipToEnd] = useState<Membership | null>(null);

  // Gestão global: qualquer cargo; gestão só na diretoria (diretor): apenas membros efetivos dela
  const canEnd = (membership: Membership) =>
    membership.isActive &&
    (can("administration.membership.manage") ||
      (membership.position === "member" && can("administration.membership.manage", membership.directorateId)));

  const confirmEnd = () => {
    if (!membershipToEnd) return;

    endMembership.mutate(
      { id: membershipToEnd.id },
      {
        onSuccess: () => {
          toast.success("Vínculo encerrado");
          setMembershipToEnd(null);
        },
        onError: (error) => handleApiError(error),
      },
    );
  };

  return (
    <>
      <TableCard.Root>
        <TableCard.Header title="Histórico de cargos" description="Todos os vínculos, do mais recente ao mais antigo." />

        {memberships.isPending && (
          <div className="flex justify-center py-10">
            <LoadingIndicator type="line-spinner" size="sm" />
          </div>
        )}

        {memberships.isError && (
          <div className="p-4">
            <Alert color="error" title="Não foi possível carregar o histórico" description={memberships.error.message} />
          </div>
        )}

        {memberships.data?.length === 0 && <p className="px-6 py-8 text-sm text-tertiary">Nenhum cargo atribuído ainda.</p>}

        {memberships.data && memberships.data.length > 0 && (
          <Table aria-label="Histórico de cargos">
            <Table.Header>
              <Table.Head id="directorate" label="Diretoria" isRowHeader />
              <Table.Head id="position" label="Cargo" className="w-full" />
              <Table.Head id="startsAt" label="Início" />
              <Table.Head id="endsAt" label="Término" />
              <Table.Head id="status" label="Situação" />
              <Table.Head id="actions" />
            </Table.Header>
            <Table.Body items={memberships.data}>
              {(membership) => (
                <Table.Row id={membership.id}>
                  <Table.Cell className="font-medium whitespace-nowrap text-primary">{membership.directorate?.name}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{membership.positionLabel}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{formatDate(membership.startsAt)}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{membership.endsAt ? formatDate(membership.endsAt) : "—"}</Table.Cell>
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

      <ConfirmModal
        isOpen={membershipToEnd !== null}
        onOpenChange={(isOpen) => !isOpen && setMembershipToEnd(null)}
        title="Encerrar vínculo?"
        description={
          membershipToEnd
            ? `O cargo de ${membershipToEnd.positionLabel.toLowerCase()} em ${membershipToEnd.directorate?.name} será encerrado a partir de hoje. O histórico é mantido.`
            : ""
        }
        confirmLabel="Encerrar"
        onConfirm={confirmEnd}
        isConfirming={endMembership.isPending}
      />
    </>
  );
}
