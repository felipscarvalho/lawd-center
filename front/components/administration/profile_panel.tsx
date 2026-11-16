"use client";

import { useState, type ReactNode } from "react";
import { Edit05, Star01 } from "@untitledui/icons";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Alert } from "@/components/feedback/alert";
import { ProfileFormModal } from "@/components/administration/profile_form_modal";
import { ProfilePhotoButton } from "@/components/administration/profile_photo_button";
import { TechnicalScoreModal } from "@/components/administration/technical_score_modal";
import { useProfile } from "@/hooks/administration/use_profiles";
import {
  careerPathLabels,
  courseLabels,
  getInitials,
  maturityDescriptions,
  maturityLabels,
  softSkillLabels,
  weeklyAvailabilityLabels,
} from "@/lib/administration";
import { formatDate } from "@/lib/moment";
import { useUserStore } from "@/stores/user_store";

/** Perfil de uma pessoa: foto, dados acadêmicos, interesses e (para quem avalia) a nota técnica */
export function ProfilePanel({ userId }: { userId: number }) {
  const profile = useProfile(userId);
  const currentUserId = useUserStore((state) => state.user?.id);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isScoreOpen, setIsScoreOpen] = useState(false);

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
  const isSelf = currentUserId === data.user.id;
  // Nascimento, matrícula e objetivo são privados: só a própria pessoa e quem tem view_private recebem
  const showPrivate = isSelf || data.abilities.canViewPrivate;

  const academic = [
    data.course && courseLabels[data.course],
    data.universityEntryPeriod && `Entrada em ${data.universityEntryPeriod}`,
  ].filter(Boolean);

  return (
    <section className="glass flex flex-col gap-6 rounded-2xl p-5 ring-1 ring-secondary sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar
            size="2xl"
            src={data.photoUrl}
            alt={data.user.fullName}
            initials={getInitials(data.user.fullName)}
            border
          />
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-lg font-semibold text-primary">Perfil</h2>
            <p className="text-sm text-tertiary">
              {academic.length > 0 ? academic.join(" · ") : "Curso não informado"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.abilities.canUpdate && (
            <ProfilePhotoButton userId={data.user.id} hasPhoto={Boolean(data.photoUrl)} size="sm" />
          )}
          {data.abilities.canUpdate && (
            <Button color="secondary" size="sm" iconLeading={Edit05} onClick={() => setIsEditOpen(true)}>
              Editar perfil
            </Button>
          )}
        </div>
      </header>

      <dl className="grid gap-5 sm:grid-cols-2">
        <Field label="Disponibilidade">
          {data.weeklyAvailability ? weeklyAvailabilityLabels[data.weeklyAvailability] : null}
        </Field>

        <Field label="Maturidade técnica">
          {data.maturity ? (
            <span>
              {maturityLabels[data.maturity]}
              <span className="text-tertiary"> · {maturityDescriptions[data.maturity]}</span>
            </span>
          ) : null}
        </Field>

        {showPrivate && <Field label="Data de nascimento">{data.birthDate ? formatDate(data.birthDate) : null}</Field>}

        {showPrivate && <Field label="Matrícula">{data.registrationNumber}</Field>}

        <TagsField
          label="Carreira de interesse"
          items={data.careerPaths.map((item) => careerPathLabels[item])}
          color="brand"
        />
        <TagsField label="Atributos" items={data.softSkills.map((item) => softSkillLabels[item])} color="brand" />
        <TagsField label="Tecnologias" items={data.technologies} color="gray" />
        <TagsField label="Áreas de interesse" items={data.interestAreas} color="gray" />

        {showPrivate && (
          <Field label="Objetivo na LAWD" className="sm:col-span-2">
            {data.goal ? <span className="whitespace-pre-line">{data.goal}</span> : null}
          </Field>
        )}
      </dl>

      {data.abilities.canViewPrivate && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary px-4 py-3 ring-1 ring-secondary">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-tertiary">Nota técnica (visível só para quem avalia)</span>
            <span className="text-md font-semibold text-primary">
              {data.technicalScore === null ? "Sem nota" : data.technicalScore.toLocaleString("pt-BR")}
              {data.technicalScoreUpdatedAt && (
                <span className="text-sm font-normal text-tertiary">
                  {" "}
                  · atualizada em {formatDate(data.technicalScoreUpdatedAt)}
                </span>
              )}
            </span>
          </div>

          {data.abilities.canEvaluate && (
            <Button color="secondary" size="sm" iconLeading={Star01} onClick={() => setIsScoreOpen(true)}>
              Avaliar
            </Button>
          )}
        </div>
      )}

      <ProfileFormModal isOpen={isEditOpen} onOpenChange={setIsEditOpen} profile={data} />
      {data.abilities.canEvaluate && (
        <TechnicalScoreModal isOpen={isScoreOpen} onOpenChange={setIsScoreOpen} profile={data} />
      )}
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-sm text-tertiary">{label}</dt>
      <dd className="mt-1.5 text-sm text-secondary">
        {children ?? <span className="text-quaternary">Não informado</span>}
      </dd>
    </div>
  );
}

function TagsField({ label, items, color }: { label: string; items: string[]; color: "brand" | "gray" }) {
  return (
    <Field label={label}>
      {items.length > 0 ? (
        <span className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <Badge key={item} size="sm" color={color}>
              {item}
            </Badge>
          ))}
        </span>
      ) : null}
    </Field>
  );
}
