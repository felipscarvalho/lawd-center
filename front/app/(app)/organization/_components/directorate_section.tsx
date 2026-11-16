"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, XClose } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { toast } from "@/components/feedback/toast";
import { ConfirmModal } from "@/components/overlays/confirm_modal";
import { useEndMembership } from "@/hooks/administration/use_memberships";
import { directorateKindLabels, getInitials } from "@/lib/administration";
import { handleApiError } from "@/lib/form_errors";
import { formatDate } from "@/lib/moment";
import type { Directorate, Membership } from "@/types/administration";
import { DirectorateIcon } from "./directorate_icon";

interface DirectorateSectionProps {
  directorate: Directorate;
  /** Pode atribuir e encerrar cargos nesta diretoria */
  canManage: boolean;
  /** Gestão global: pode mexer em qualquer cargo; sem ela, só em membros efetivos */
  canManageAllPositions: boolean;
  onAddMember: () => void;
}

/** Seção de uma diretoria na visualização em lista: cabeçalho e uma linha por pessoa com cargo ativo */
export function DirectorateSection({ directorate, canManage, canManageAllPositions, onAddMember }: DirectorateSectionProps) {
  const endMembership = useEndMembership();
  const [membershipToEnd, setMembershipToEnd] = useState<Membership | null>(null);
  const memberships = directorate.memberships ?? [];
  const isCore = directorate.kind === "core";

  const canEnd = (membership: Membership) => canManage && (canManageAllPositions || membership.position === "member");

  const confirmEnd = () => {
    if (!membershipToEnd) return;

    endMembership.mutate(
      { id: membershipToEnd.id },
      {
        onSuccess: () => {
          toast.success("Vínculo encerrado", { description: membershipToEnd.user?.fullName });
          setMembershipToEnd(null);
        },
        onError: (error) => handleApiError(error),
      },
    );
  };

  const peopleCount = `${memberships.length} ${memberships.length === 1 ? "pessoa" : "pessoas"}`;

  return (
    <section>
      <header className="flex items-center gap-3 border-b border-secondary bg-brand-solid/5 px-4 py-3 sm:px-5">
        <DirectorateIcon kind={directorate.kind} className="size-9 rounded-lg" />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-md font-semibold text-primary">{directorate.name}</h2>
          <p className="text-xs text-tertiary">
            {isCore ? `${directorateKindLabels.core} · ${peopleCount}` : peopleCount}
          </p>
        </div>

        {canManage && (
          <Button color="secondary" size="sm" iconLeading={Plus} onClick={onAddMember}>
            Adicionar
          </Button>
        )}
      </header>

      {memberships.length === 0 ? (
        <p className="px-4 py-4 text-sm text-quaternary sm:px-5">Nenhum cargo ativo</p>
      ) : (
        <ul className="divide-y divide-secondary">
          {memberships.map((membership) => (
            <li
              key={membership.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-primary_hover sm:grid-cols-[minmax(0,1fr)_11rem_8rem_2rem] sm:px-5"
            >
              <Link
                href={`/users/${membership.userId}`}
                className="flex min-w-0 items-center gap-3 rounded-lg outline-focus-ring focus-visible:outline-2"
              >
                <Avatar
                  size="md"
                  src={membership.user?.photoUrl}
                  alt={membership.user?.fullName}
                  initials={getInitials(membership.user?.fullName ?? "")}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-primary">{membership.user?.fullName}</span>
                  <span className="truncate text-sm text-tertiary">{membership.user?.email}</span>
                </span>
              </Link>

              <span className="hidden sm:block">
                <Badge size="sm" color={membership.position === "member" ? "gray" : "brand"}>
                  {membership.positionLabel}
                </Badge>
              </span>

              <span className="hidden text-sm whitespace-nowrap text-tertiary sm:block">
                desde {formatDate(membership.startsAt)}
              </span>

              <span className="flex justify-end">
                {canEnd(membership) && (
                  <ButtonUtility
                    size="xs"
                    color="tertiary"
                    icon={XClose}
                    tooltip="Encerrar vínculo"
                    aria-label={`Encerrar vínculo de ${membership.user?.fullName}`}
                    onClick={() => setMembershipToEnd(membership)}
                  />
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        isOpen={membershipToEnd !== null}
        onOpenChange={(isOpen) => !isOpen && setMembershipToEnd(null)}
        title="Encerrar vínculo?"
        description={
          membershipToEnd
            ? `${membershipToEnd.user?.fullName} deixará de ser ${membershipToEnd.positionLabel.toLowerCase()} em ${directorate.name} a partir de hoje. O histórico é mantido.`
            : ""
        }
        confirmLabel="Encerrar"
        onConfirm={confirmEnd}
        isConfirming={endMembership.isPending}
      />
    </section>
  );
}
