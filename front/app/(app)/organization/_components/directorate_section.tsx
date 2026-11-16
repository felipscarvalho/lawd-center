"use client";

import { useState } from "react";
import { Plus, XClose } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { EndMembershipModal } from "@/components/administration/end_membership_modal";
import { PersonLink } from "@/components/administration/person_link";
import { useCanEndMembership } from "@/hooks/administration/use_memberships";
import { directorateKindLabels } from "@/lib/administration";
import { formatDate } from "@/lib/moment";
import type { Directorate, Membership } from "@/types/administration";
import { DirectorateIcon } from "./directorate_icon";

interface DirectorateSectionProps {
  directorate: Directorate;
  /** Pode atribuir cargos nesta diretoria (encerrar segue useCanEndMembership) */
  canManage: boolean;
  onAddMember: () => void;
}

/** Seção de uma diretoria na visualização em lista: cabeçalho e uma linha por pessoa com cargo ativo */
export function DirectorateSection({ directorate, canManage, onAddMember }: DirectorateSectionProps) {
  const canEnd = useCanEndMembership();
  const [membershipToEnd, setMembershipToEnd] = useState<Membership | null>(null);
  const memberships = directorate.memberships ?? [];
  const isCore = directorate.kind === "core";


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
              <PersonLink
                userId={membership.userId}
                person={membership.user}
                subtitle={membership.user?.email}
                size="md"
              />

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

      <EndMembershipModal
        membership={membershipToEnd}
        directorateName={directorate.name}
        onClose={() => setMembershipToEnd(null)}
      />
    </section>
  );
}
