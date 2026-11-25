"use client";

import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { ProfilePhotoEditor } from "@/components/administration/profile_photo_editor";
import { LoadingState, ErrorState } from "@/components/layout/query_states";
import { SplitCard } from "@/components/layout/card";
import { DetailField } from "@/components/layout/detail_section";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useProfile } from "@/hooks/administration/use_profiles";
import { userStatus } from "@/lib/administration";
import { formatDate } from "@/lib/moment";
import { useUserStore } from "@/stores/user_store";
import type { Membership, User } from "@/types/administration";
import { TechnicalScoreForm } from "./technical_score_form";
import { UserPasswordForm } from "./user_password_form";
import { UserEditForm } from "./user_edit_form";
import { UserInvitationSection } from "./user_invitation_section";
import { UserProfileDetails } from "./user_profile_details";

interface UserCardProps {
  user: User;
  activeMemberships: Membership[];
}

/**
 * Card único do detalhe do usuário, no mesmo layout de "Meu perfil". À esquerda: foto, situação,
 * cargos, cadastro, senha ou convite (gestão) e nota técnica. À direita: conta e perfil, já editáveis para quem pode editar
 * (sem botão "Editar") e só leitura para os demais.
 */
export function UserCard({ user, activeMemberships }: UserCardProps) {
  const profile = useProfile(user.id);
  const currentUserId = useUserStore((state) => state.user?.id);
  const { can } = usePermissions();

  if (profile.isPending) {
    return <LoadingState label="Carregando perfil..." />;
  }

  if (profile.isError) {
    return <ErrorState title="Não foi possível carregar o perfil" error={profile.error} />;
  }

  const { data } = profile;
  const isSelf = currentUserId === user.id;
  // Nascimento, matrícula e objetivo são privados: só a própria pessoa e quem tem view_private recebem
  const showPrivate = isSelf || data.abilities.canViewPrivate;
  const canEditAccount = can("administration.user.update");

  return (
    <SplitCard
      aside={
        <>
          <ProfilePhotoEditor profile={data} canEdit={data.abilities.canUpdate} />

          <dl className="flex flex-col gap-4">
            <DetailField label="Situação">
              <BadgeWithDot size="md" type="modern" color={userStatus(user).color}>
                {user.isActive ? userStatus(user).label : `Desativado em ${formatDate(user.deactivatedAt ?? "")}`}
              </BadgeWithDot>
            </DetailField>

            <DetailField label="Cargos atuais">
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
            </DetailField>

            <DetailField label="Cadastrado em">
              <span className="text-sm text-primary">{formatDate(user.createdAt)}</span>
            </DetailField>
          </dl>

          {/* Quem não aceitou o convite cria a própria senha pelo link: aqui só dá para reenviar */}
          {user.isPending
            ? can("administration.user.create") && user.isActive && <UserInvitationSection user={user} />
            : canEditAccount && <UserPasswordForm user={user} />}

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
                    {data.technicalScoreUpdatedAt
                      ? `atualizada em ${formatDate(data.technicalScoreUpdatedAt)}`
                      : "sem nota"}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      }
    >
      {data.abilities.canUpdate ? (
        <UserEditForm user={user} profile={data} canEditAccount={canEditAccount} canEditPrivate={showPrivate} />
      ) : (
        <UserProfileDetails profile={data} showPrivate={showPrivate} />
      )}
    </SplitCard>
  );
}
