"use client";

import { Send01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { toast } from "@/components/feedback/toast";
import { useResendInvitation } from "@/hooks/administration/use_users";
import { handleApiError } from "@/lib/form_errors";
import type { User } from "@/types/administration";

/** Convite ainda não aceito: no lugar da troca de senha, a gestão reenvia o link por e-mail */
export function UserInvitationSection({ user }: { user: User }) {
  const resend = useResendInvitation();

  const onResend = () => {
    resend.mutate(user.id, {
      onSuccess: () => toast.success("Convite reenviado", { description: `Novo link enviado para ${user.email}.` }),
      onError: (error) => handleApiError(error),
    });
  };

  return (
    <div className="flex flex-col gap-3 border-t border-secondary pt-6">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-md font-semibold text-primary">Convite</h3>
        <p className="text-sm text-tertiary">
          A pessoa ainda não criou a senha. Reenviar gera um link novo e o anterior deixa de valer.
        </p>
      </div>

      <Button color="secondary" iconLeading={Send01} onClick={onResend} isLoading={resend.isPending} showTextWhileLoading>
        Reenviar convite
      </Button>
    </div>
  );
}
