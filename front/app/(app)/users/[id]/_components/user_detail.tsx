"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { SlashCircle01, UserPlus01 } from "@untitledui/icons";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Button } from "@/components/base/buttons/button";
import { Alert } from "@/components/feedback/alert";
import { toast } from "@/components/feedback/toast";
import { AssignMembershipModal } from "@/components/administration/assign_membership_modal";
import { PageHeader } from "@/components/layout/page_header";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ConfirmModal } from "@/components/overlays/confirm_modal";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useUserMemberships } from "@/hooks/administration/use_memberships";
import { useDeactivateUser, useUser } from "@/hooks/administration/use_users";
import { handleApiError } from "@/lib/form_errors";
import { useUserStore } from "@/stores/user_store";
import { MembershipHistory } from "./membership_history";
import { UserCard } from "./user_card";

export function UserDetail() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);

  const user = useUser(userId);
  const memberships = useUserMemberships(userId);
  const deactivate = useDeactivateUser();
  const currentUser = useUserStore((state) => state.user);
  const { can, canAnywhere } = usePermissions();

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  if (user.isPending) {
    return (
      <div className="flex justify-center py-16">
        <LoadingIndicator type="line-spinner" size="md" label="Carregando usuário..." />
      </div>
    );
  }

  if (user.isError) {
    return <Alert color="error" title="Não foi possível carregar o usuário" description={user.error.message} />;
  }

  const { data } = user;
  const activeMemberships = (memberships.data ?? []).filter((membership) => membership.isActive);
  const isSelf = currentUser?.id === data.id;

  const confirmDeactivate = () => {
    deactivate.mutate(data.id, {
      onSuccess: () => {
        toast.success("Usuário desativado", { description: data.fullName });
        setIsDeactivateOpen(false);
      },
      onError: (error) => handleApiError(error),
    });
  };

  return (
    <>
      <PageHeader
        title={data.fullName}
        actions={
          <>
            {can("administration.user.deactivate") && data.isActive && !isSelf && (
              <Button color="secondary-destructive" iconLeading={SlashCircle01} onClick={() => setIsDeactivateOpen(true)}>
                Desativar
              </Button>
            )}
            {canAnywhere("administration.membership.manage") && data.isActive && (
              <Button iconLeading={UserPlus01} onClick={() => setIsAssignOpen(true)}>
                Atribuir cargo
              </Button>
            )}
          </>
        }
      >
        <Breadcrumbs items={[{ label: "Usuários", href: "/users" }, { label: data.fullName }]} />
      </PageHeader>

      <UserCard user={data} activeMemberships={activeMemberships} />

      <MembershipHistory memberships={memberships} />

      <AssignMembershipModal isOpen={isAssignOpen} onOpenChange={setIsAssignOpen} user={data} />
      <ConfirmModal
        isOpen={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        title="Desativar usuário?"
        description={`${data.fullName} não poderá mais entrar no sistema e todos os cargos ativos serão encerrados hoje. O histórico é mantido.`}
        confirmLabel="Desativar"
        onConfirm={confirmDeactivate}
        isConfirming={deactivate.isPending}
      />
    </>
  );
}
