"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, XClose } from "@untitledui/icons";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
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
import { cx } from "@/utils/cx";

interface DirectorateCardProps {
  directorate: Directorate;
  /** Pode atribuir e encerrar cargos nesta diretoria */
  canManage: boolean;
  /** Gestão global: pode mexer em qualquer cargo; sem ela, só em membros efetivos */
  canManageAllPositions: boolean;
  onAddMember: () => void;
  className?: string;
}

export function DirectorateCard({ directorate, canManage, canManageAllPositions, onAddMember, className }: DirectorateCardProps) {
  const endMembership = useEndMembership();
  const [membershipToEnd, setMembershipToEnd] = useState<Membership | null>(null);
  const memberships = directorate.memberships ?? [];

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

  return (
    <section className={cx("glass flex flex-col gap-4 rounded-2xl p-5 ring-1 ring-secondary", className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-primary">{directorate.name}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge type="modern" size="sm">
              {directorateKindLabels[directorate.kind]}
            </Badge>
            <Badge color="brand" size="sm">
              {memberships.length} {memberships.length === 1 ? "pessoa" : "pessoas"}
            </Badge>
          </div>
        </div>

        {canManage && (
          <Button color="secondary" size="sm" iconLeading={Plus} onClick={onAddMember}>
            Adicionar
          </Button>
        )}
      </header>

      {memberships.length === 0 ? (
        <p className="text-sm text-tertiary">Nenhum cargo ativo nesta diretoria.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {memberships.map((membership) => (
            <li
              key={membership.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-primary px-3 py-2.5 ring-1 ring-secondary"
            >
              <Link
                href={`/users/${membership.userId}`}
                className="min-w-0 flex-1 rounded-lg outline-focus-ring focus-visible:outline-2"
                aria-label={`Ver perfil de ${membership.user?.fullName}`}
              >
                <AvatarLabelGroup
                  size="md"
                  src={membership.user?.photoUrl}
                  alt={membership.user?.fullName}
                  initials={getInitials(membership.user?.fullName ?? "")}
                  title={membership.user?.fullName}
                  subtitle={`${membership.positionLabel} · desde ${formatDate(membership.startsAt)}`}
                  className="transition-opacity hover:opacity-80"
                />
              </Link>

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
