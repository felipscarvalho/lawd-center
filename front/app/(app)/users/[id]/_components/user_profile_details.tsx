import { DetailField, DetailTags, Section } from "@/components/layout/detail_section";
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
        <dl className="grid gap-5 sm:grid-cols-2">
          <DetailField label="Nome completo">{profile.user.fullName}</DetailField>
          <DetailField label="E-mail">{profile.user.email}</DetailField>
          {showPrivate && (
            <DetailField label="Data de nascimento">
              {profile.birthDate ? formatDate(profile.birthDate) : null}
            </DetailField>
          )}
          {showPrivate && <DetailField label="Matrícula">{profile.registrationNumber}</DetailField>}
        </dl>
      </Section>

      <Section title="Formação">
        <dl className="grid gap-5 sm:grid-cols-2">
          <DetailField label="Curso">{profile.course ? courseLabels[profile.course] : null}</DetailField>
          <DetailField label="Entrada na UFS">{profile.universityEntryPeriod}</DetailField>
        </dl>
      </Section>

      <Section title="Dedicação e nível">
        <dl className="grid gap-5 sm:grid-cols-2">
          <DetailField label="Disponibilidade">
            {profile.weeklyAvailability ? weeklyAvailabilityLabels[profile.weeklyAvailability] : null}
          </DetailField>
          <DetailField label="Maturidade técnica">
            {profile.maturity ? (
              <span className="flex flex-col">
                {maturityLabels[profile.maturity]}
                <span className="text-xs text-tertiary">{maturityDescriptions[profile.maturity]}</span>
              </span>
            ) : null}
          </DetailField>
        </dl>
      </Section>

      <Section title="Interesses">
        <dl className="grid gap-5 sm:grid-cols-2">
          <DetailTags
            label="Carreira de interesse"
            items={profile.careerPaths.map((item) => careerPathLabels[item])}
            color="brand"
          />
          <DetailTags label="Áreas de interesse" items={profile.interestAreas} color="gray" />
        </dl>
      </Section>

      <Section title="Habilidades">
        <dl className="grid gap-5 sm:grid-cols-2">
          <DetailTags label="Atributos" items={profile.softSkills.map((item) => softSkillLabels[item])} color="brand" />
          <DetailTags label="Tecnologias" items={profile.technologies} color="gray" />
        </dl>
      </Section>

      {showPrivate && (
        <Section title="Objetivo na LAWD">
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailField label="Objetivo" className="sm:col-span-2">
              {profile.goal ? <span className="whitespace-pre-line">{profile.goal}</span> : null}
            </DetailField>
          </dl>
        </Section>
      )}
    </div>
  );
}
