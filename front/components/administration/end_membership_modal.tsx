"use client";

import { toast } from "@/components/feedback/toast";
import { ConfirmModal } from "@/components/overlays/confirm_modal";
import { useEndMembership } from "@/hooks/administration/use_memberships";
import { handleApiError } from "@/lib/form_errors";
import type { Membership } from "@/types/administration";

interface EndMembershipModalProps {
  /** Vínculo a encerrar; null fecha o modal */
  membership: Membership | null;
  /** Nome da diretoria, quando o vínculo não vem com ela carregada */
  directorateName?: string;
  onClose: () => void;
}

/** Confirmação de encerrar um vínculo (organograma e histórico de cargos) */
export function EndMembershipModal({ membership, directorateName, onClose }: EndMembershipModalProps) {
  const endMembership = useEndMembership();

  const confirmEnd = () => {
    if (!membership) return;

    endMembership.mutate(
      { id: membership.id },
      {
        onSuccess: () => {
          toast.success("Vínculo encerrado", { description: membership.user?.fullName });
          onClose();
        },
        onError: (error) => handleApiError(error),
      },
    );
  };

  const position = membership?.positionLabel.toLowerCase();
  const directorate = directorateName ?? membership?.directorate?.name;
  // No organograma o vínculo vem com a pessoa; no histórico do usuário, não
  const description = !membership
    ? ""
    : membership.user
      ? `${membership.user.fullName} deixará de ser ${position} em ${directorate} a partir de hoje. O histórico é mantido.`
      : `O cargo de ${position} em ${directorate} será encerrado a partir de hoje. O histórico é mantido.`;

  return (
    <ConfirmModal
      isOpen={membership !== null}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title="Encerrar vínculo?"
      description={description}
      confirmLabel="Encerrar"
      onConfirm={confirmEnd}
      isConfirming={endMembership.isPending}
    />
  );
}
