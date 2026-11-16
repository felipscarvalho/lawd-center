"use client";

import type { ReactNode } from "react";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Alert } from "@/components/feedback/alert";
import { ProfilePhotoEditor } from "@/components/administration/profile_photo_editor";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useProfile } from "@/hooks/administration/use_profiles";
import { formatDate } from "@/lib/moment";
import { useUserStore } from "@/stores/user_store";
import type { Membership, User } from "@/types/administration";
import { TechnicalScoreForm } from "./technical_score_form";
import { UserPasswordForm } from "./user_password_form";
import { UserEditForm } from "./user_edit_form";
import { UserProfileDetails } from "./user_profile_details";

interface UserCardProps {
  user: User;
  activeMemberships: Membership[];
}

/**
 * Card único do detalhe do usuário, no mesmo layout de "Meu perfil". À esquerda: foto, situação,
 * cargos, cadastro, senha (gestão) e nota técnica. À direita: conta e perfil, já editáveis para quem pode editar
 * (sem botão "Editar") e só leitura para os demais.
 */
export function UserCard({ user, activeMemberships }: UserCardProps) {
  const profile = useProfile(user.id);
  const currentUserId = useUserStore((state) => state.user?.id);
  const { can } = usePermissions();

  if (profile.isPending) {
    return (
      <div className="flex justify-center py-10">
        <LoadingIndicator type="line-spinner" size="md" label="Carregando perfil..." />
      </div>
    );
  }

  if (profile.isError) {
    return <Alert color="error" title="Não foi possível carregar o perfil" description={profile.error.message} />;
  }

  const { data } = profile;
  const isSelf = currentUserId === user.id;
  // Nascimento, matrícula e objetivo são privados: só a própria pessoa e quem tem view_private recebem
  const showPrivate = isSelf || data.abilities.canViewPrivate;
  const canEditAccount = can("administration.user.update");

  return (
    <section className="glass grid overflow-hidden rounded-2xl ring-1 ring-secondary lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6 border-b border-secondary p-5 sm:p-6 lg:border-r lg:border-b-0">
        <ProfilePhotoEditor profile={data} canEdit={data.abilities.canUpdate} />

        <dl className="flex flex-col gap-4">
          <AsideField label="Situação">
            <BadgeWithDot size="md" type="modern" color={user.isActive ? "success" : "gray"}>
              {user.isActive ? "Ativo" : `Desativado em ${formatDate(user.deactivatedAt ?? "")}`}
            </BadgeWithDot>
          </AsideField>

          <AsideField label="Cargos atuais">
            {activeMemberships.length === 0 ? (
              <span className="text-sm text-quaternary">Nenhum cargo ativo</span>
            ) : (
              <span className="flex flex-wrap gap-1.5">
                {activeMemberships.map((membership) => (
                  <Badge key={membership.id} color="brand" size="sm">
                    {membership.positionLabel} · {membership.directorate?.name}
                  </Badge>
                ))}
              </span>
            )}
          </AsideField>

          <AsideField label="Cadastrado em">
            <span className="text-sm text-primary">{formatDate(user.createdAt)}</span>
          </AsideField>
        </dl>

        {canEditAccount && <UserPasswordForm user={user} />}

        {data.abilities.canViewPrivate && (
          <div className="flex flex-col gap-3 border-t border-secondary pt-6">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-md font-semibold text-primary">Nota técnica</h3>
              <p className="text-sm text-tertiary">Visível só para quem avalia.</p>
            </div>

            {data.abilities.canEvaluate ? (
              <TechnicalScoreForm profile={data} />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-display-xs font-semibold text-primary">
                  {data.technicalScore === null ? "—" : data.technicalScore.toLocaleString("pt-BR")}
                </span>
                <span className="text-sm text-tertiary">
                  {data.technicalScoreUpdatedAt ? `atualizada em ${formatDate(data.technicalScoreUpdatedAt)}` : "sem nota"}
                </span>
              </div>
            )}
          </div>
        )}
      </aside>

      {data.abilities.canUpdate ? (
        <UserEditForm user={user} profile={data} canEditAccount={canEditAccount} canEditPrivate={showPrivate} />
      ) : (
        <UserProfileDetails profile={data} showPrivate={showPrivate} />
      )}
    </section>
  );
}

function AsideField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-sm text-tertiary">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
