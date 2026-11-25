"use client";

import { Input } from "@/components/base/input/input";
import { ProfileForm } from "./profile_form";
import { PageHeader } from "@/components/layout/page_header";
import { LoadingState, ErrorState } from "@/components/layout/query_states";
import { SplitCard } from "@/components/layout/card";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useProfile } from "@/hooks/administration/use_profiles";
import { UserProjectsCard } from "@/components/projects/user_projects_card";
import { useUserStore } from "@/stores/user_store";
import { AccountColumn } from "./account_column";

/**
 * Perfil do usuário logado: à esquerda a conta (foto e senha), à direita o formulário do perfil.
 * O AppShell só renderiza esta página com a sessão carregada.
 */
export function MyProfile() {
  const userId = useUserStore((state) => state.user?.id ?? 0);
  const profile = useProfile(userId);
  const { can } = usePermissions();

  if (profile.isPending) {
    return <LoadingState label="Carregando perfil..." />;
  }

  if (profile.isError) {
    return <ErrorState title="Não foi possível carregar o perfil" error={profile.error} />;
  }

  return (
    <>
      <PageHeader title="Meu perfil" />

      <SplitCard aside={<AccountColumn profile={profile.data} />}>
        <ProfileForm
          profile={profile.data}
          canEditPrivate
          isSelf
          personalFields={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome completo" value={profile.data.user.fullName ?? ""} isDisabled />
              <Input label="E-mail" value={profile.data.user.email} isDisabled />
            </div>
          }
        />
      </SplitCard>

      {/* Quem ainda não tem cargo não vê projetos (o backend exige projects.project.view) */}
      {can("projects.project.view") && <UserProjectsCard userId={userId} />}
    </>
  );
}
