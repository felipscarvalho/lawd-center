"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Edit05, SlashCircle01, UserPlus01 } from "@untitledui/icons";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Alert } from "@/components/feedback/alert";
import { toast } from "@/components/feedback/toast";
import { AssignMembershipModal } from "@/components/administration/assign_membership_modal";
import { ProfilePanel } from "@/components/administration/profile_panel";
import { UserFormModal } from "@/components/administration/user_form_modal";
import { PageHeader } from "@/components/layout/page_header";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ConfirmModal } from "@/components/overlays/confirm_modal";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useUserMemberships } from "@/hooks/administration/use_memberships";
import { useDeactivateUser, useUser } from "@/hooks/administration/use_users";
import { getInitials } from "@/lib/administration";
import { handleApiError } from "@/lib/form_errors";
import { formatDate } from "@/lib/moment";
import { useUserStore } from "@/stores/user_store";
import { MembershipHistory } from "./membership_history";

export function UserDetail() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);

  const user = useUser(userId);
  const memberships = useUserMemberships(userId);
  const deactivate = useDeactivateUser();
  const currentUser = useUserStore((state) => state.user);
  const { can, canAnywhere } = usePermissions();

  const [isEditOpen, setIsEditOpen] = useState(false);
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
        description={data.email}
        actions={
          <>
            {can("administration.user.update") && (
              <Button color="secondary" iconLeading={Edit05} onClick={() => setIsEditOpen(true)}>
                Editar
              </Button>
            )}
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

      <section className="glass flex flex-col gap-5 rounded-2xl p-5 ring-1 ring-secondary sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <AvatarLabelGroup
            size="lg"
            src={data.photoUrl}
            alt={data.fullName}
            initials={getInitials(data.fullName)}
            title={data.fullName}
            subtitle={data.email}
          />
          <BadgeWithDot size="md" type="modern" color={data.isActive ? "success" : "gray"}>
            {data.isActive ? "Ativo" : `Desativado em ${formatDate(data.deactivatedAt ?? "")}`}
          </BadgeWithDot>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <dt className="text-sm text-tertiary">Cargos atuais</dt>
            <dd className="flex flex-wrap gap-2">
              {activeMemberships.length === 0 ? (
                <span className="text-sm text-secondary">Nenhum cargo ativo</span>
              ) : (
                activeMemberships.map((membership) => (
                  <Badge key={membership.id} color="brand" size="md">
                    {membership.positionLabel} · {membership.directorate?.name}
                  </Badge>
                ))
              )}
            </dd>
          </div>

          <div className="flex flex-col gap-1.5">
            <dt className="text-sm text-tertiary">Cadastrado em</dt>
            <dd className="text-sm text-secondary">{formatDate(data.createdAt)}</dd>
          </div>
        </dl>
      </section>

      <ProfilePanel userId={data.id} />

      <MembershipHistory memberships={memberships} />

      <UserFormModal isOpen={isEditOpen} onOpenChange={setIsEditOpen} user={data} />
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
