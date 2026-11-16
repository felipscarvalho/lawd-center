import type { ReactNode } from "react";
import { Badge } from "@/components/base/badges/badges";
import {
  careerPathLabels,
  courseLabels,
  maturityDescriptions,
  maturityLabels,
  softSkillLabels,
  weeklyAvailabilityLabels,
} from "@/lib/administration";
import { formatDate } from "@/lib/moment";
import type { Profile } from "@/types/administration";

/** Leitura do usuário e do perfil, nas mesmas seções do formulário, para quem não pode editar */
export function UserProfileDetails({ profile, showPrivate }: { profile: Profile; showPrivate: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-6 p-5 sm:p-6">
      <Section title="Dados pessoais">
        <Field label="Nome completo">{profile.user.fullName}</Field>
        <Field label="E-mail">{profile.user.email}</Field>
        {showPrivate && <Field label="Data de nascimento">{profile.birthDate ? formatDate(profile.birthDate) : null}</Field>}
        {showPrivate && <Field label="Matrícula">{profile.registrationNumber}</Field>}
      </Section>

      <Section title="Formação">
        <Field label="Curso">{profile.course ? courseLabels[profile.course] : null}</Field>
        <Field label="Entrada na UFS">{profile.universityEntryPeriod}</Field>
      </Section>

      <Section title="Dedicação e nível">
        <Field label="Disponibilidade">
          {profile.weeklyAvailability ? weeklyAvailabilityLabels[profile.weeklyAvailability] : null}
        </Field>
        <Field label="Maturidade técnica">
          {profile.maturity ? (
            <span className="flex flex-col">
              {maturityLabels[profile.maturity]}
              <span className="text-xs text-tertiary">{maturityDescriptions[profile.maturity]}</span>
            </span>
          ) : null}
        </Field>
      </Section>

      <Section title="Interesses">
        <TagsField label="Carreira de interesse" items={profile.careerPaths.map((item) => careerPathLabels[item])} color="brand" />
        <TagsField label="Áreas de interesse" items={profile.interestAreas} color="gray" />
      </Section>

      <Section title="Habilidades">
        <TagsField label="Atributos" items={profile.softSkills.map((item) => softSkillLabels[item])} color="brand" />
        <TagsField label="Tecnologias" items={profile.technologies} color="gray" />
      </Section>

      {showPrivate && (
        <Section title="Objetivo na LAWD">
          <Field label="Objetivo" className="sm:col-span-2">
            {profile.goal ? <span className="whitespace-pre-line">{profile.goal}</span> : null}
          </Field>
        </Section>
      )}
    </div>
  );
}

/** Seção com título e linha separando da anterior, igual às do formulário */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-secondary pt-6 first:border-t-0 first:pt-0">
      <h3 className="text-md font-semibold text-primary">{title}</h3>
      <dl className="grid gap-5 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-sm text-tertiary">{label}</dt>
      <dd className="mt-1.5 text-sm text-primary">{children ?? <span className="text-quaternary">Não informado</span>}</dd>
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
