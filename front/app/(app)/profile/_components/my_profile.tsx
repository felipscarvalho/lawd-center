"use client";

import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Input } from "@/components/base/input/input";
import { ProfileForm } from "./profile_form";
import { Alert } from "@/components/feedback/alert";
import { PageHeader } from "@/components/layout/page_header";
import { useProfile } from "@/hooks/administration/use_profiles";
import { useUserStore } from "@/stores/user_store";
import { AccountCard } from "./account_card";

/**
 * Perfil do usuário logado: à esquerda a conta (foto e senha), à direita o formulário do perfil.
 * O AppShell só renderiza esta página com a sessão carregada.
 */
export function MyProfile() {
  const userId = useUserStore((state) => state.user?.id ?? 0);
  const profile = useProfile(userId);

  if (profile.isPending) {
    return (
      <div className="flex justify-center py-16">
        <LoadingIndicator type="line-spinner" size="md" label="Carregando perfil..." />
      </div>
    );
  }

  if (profile.isError) {
    return <Alert color="error" title="Não foi possível carregar o perfil" description={profile.error.message} />;
  }

  return (
    <>
      <PageHeader title="Meu perfil" />

      <div className="glass grid overflow-hidden rounded-2xl ring-1 ring-secondary lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <AccountCard profile={profile.data} />
        <ProfileForm
          profile={profile.data}
          canEditPrivate
          isSelf
          personalFields={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome completo" value={profile.data.user.fullName} isDisabled />
              <Input label="E-mail" value={profile.data.user.email} isDisabled />
            </div>
          }
        />
      </div>
    </>
  );
}
