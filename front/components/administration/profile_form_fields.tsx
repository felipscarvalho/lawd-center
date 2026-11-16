"use client";

import type { ReactNode } from "react";
import { Controller, type Control } from "react-hook-form";
import { parseDate } from "@internationalized/date";
import { Badge } from "@/components/base/badges/badges";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { HintText } from "@/components/base/input/hint-text";
import { FormInput } from "@/components/forms/form_input";
import { InputDate } from "@/components/base/input/input-date";
import { InputTags } from "@/components/base/input/input-tags";
import { Label } from "@/components/base/input/label";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { FormSelect } from "@/components/forms/form_select";
import { Section } from "@/components/layout/detail_section";
import { useInterestAreaCatalog, useTechnologyCatalog } from "@/hooks/administration/use_profiles";
import {
  careerPathLabels,
  courseLabels,
  maturityDescriptions,
  maturityLabels,
  maxProfileChoices,
  softSkillLabels,
  toOptions,
  weeklyAvailabilityLabels,
} from "@/lib/administration";
import type { ProfileForm } from "@/schemas/administration";
import type { Profile, UpdateProfilePayload } from "@/types/administration";
import { cx } from "@/utils/cx";

export const toProfileFormValues = (profile: Profile): ProfileForm => ({
  birthDate: profile.birthDate,
  registrationNumber: profile.registrationNumber ?? "",
  course: profile.course,
  universityEntryPeriod: profile.universityEntryPeriod ?? "",
  weeklyAvailability: profile.weeklyAvailability,
  maturity: profile.maturity,
  careerPaths: profile.careerPaths,
  softSkills: profile.softSkills,
  goal: profile.goal ?? "",
  technologies: profile.technologies,
  interestAreas: profile.interestAreas,
});

/** Converte o formulário no payload da API; sem acesso aos dados privados, eles não são enviados */
export const toProfilePayload = (values: ProfileForm, canEditPrivate: boolean): UpdateProfilePayload => ({
  ...values,
  registrationNumber: values.registrationNumber || null,
  universityEntryPeriod: values.universityEntryPeriod || null,
  goal: values.goal || null,
  ...(canEditPrivate ? {} : { birthDate: undefined, registrationNumber: undefined, goal: undefined }),
});

interface ProfileFormFieldsProps {
  control: Control<ProfileForm>;
  /** Nascimento, matrícula e objetivo: só a própria pessoa ou quem pode ver dados privados */
  canEditPrivate: boolean;
  /** Campos extras no início de "Dados pessoais" (ex.: nome e e-mail só leitura na página Meu perfil) */
  personalFields?: ReactNode;
  /** Descrição de "Dados pessoais" (ex.: avisar que nome e e-mail são alterados pela gestão) */
  personalDescription?: string;
  /** Descrições das seções falam com a pessoa ("você"): só aparecem no próprio perfil */
  showDescriptions?: boolean;
}

/**
 * Campos do perfil em seções temáticas, separadas por linha; usados no modal de edição e na página "Meu perfil".
 * Seção sem nenhum campo visível não aparece.
 */
export function ProfileFormFields({
  control,
  canEditPrivate,
  personalFields,
  personalDescription,
  showDescriptions = true,
}: ProfileFormFieldsProps) {
  const describe = (text: string) => (showDescriptions ? text : undefined);

  return (
    <>
      {(personalFields || canEditPrivate) && (
        <Section title="Dados pessoais" description={personalDescription}>
          {personalFields}

          {canEditPrivate && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="birthDate"
                render={({ field, fieldState }) => (
                  <InputDate
                    label="Data de nascimento"
                    value={field.value ? parseDate(field.value) : null}
                    onChange={(value) => field.onChange(value?.toString() ?? null)}
                    isInvalid={Boolean(fieldState.error)}
                    hint={fieldState.error?.message}
                  />
                )}
              />

              <FormInput
                control={control}
                name="registrationNumber"
                label="Matrícula"
                placeholder="Ex.: 202200012345"
                inputMode="numeric"
              />
            </div>
          )}
        </Section>
      )}

      <Section title="Formação" description={describe("Seu curso e quando você entrou na UFS.")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            control={control}
            name="course"
            label="Curso"
            placeholder="Selecione o curso"
            items={toOptions(courseLabels)}
          />

          <FormInput
            control={control}
            name="universityEntryPeriod"
            label="Entrada na UFS"
            placeholder="Ex.: 2022.1"
            hint="Ano e semestre de entrada"
          />
        </div>
      </Section>

      <Section
        title="Dedicação e nível"
        description={describe("Quanto tempo você dedica à LAWD e como se vê tecnicamente hoje.")}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            control={control}
            name="weeklyAvailability"
            label="Disponibilidade"
            placeholder="Horas por semana"
            items={toOptions(weeklyAvailabilityLabels)}
          />

          <Controller
            control={control}
            name="maturity"
            render={({ field }) => (
              // A descrição fica na dica abaixo do campo: como texto de apoio do item, ela cortava o nome do nível
              <Select
                label="Maturidade técnica"
                placeholder="Selecione"
                items={toOptions(maturityLabels)}
                selectedKey={field.value ?? null}
                onSelectionChange={(key) => field.onChange(key ?? null)}
                hint={field.value ? maturityDescriptions[field.value] : undefined}
              >
                {(item) => <Select.Item id={item.id} label={item.label} />}
              </Select>
            )}
          />
        </div>
      </Section>

      <Section
        title="Interesses"
        description={describe(
          `O que você quer seguir na carreira (até ${maxProfileChoices}) e os temas que te atraem.`,
        )}
      >
        <CheckboxList control={control} name="careerPaths" label="Carreira de interesse" labels={careerPathLabels} />
        <CatalogTags control={control} name="interestAreas" label="Áreas de interesse" />
      </Section>

      <Section
        title="Habilidades"
        description={describe(`Seus pontos fortes (até ${maxProfileChoices}) e as tecnologias que você usa.`)}
      >
        <CheckboxList control={control} name="softSkills" label="Atributos" labels={softSkillLabels} />
        <CatalogTags control={control} name="technologies" label="Tecnologias" />
      </Section>

      {canEditPrivate && (
        <Section title="Objetivo na LAWD" description={describe("O que você quer aprender ou construir na liga.")}>
          <Controller
            control={control}
            name="goal"
            render={({ field, fieldState }) => (
              <TextArea
                aria-label="Objetivo na LAWD"
                placeholder="Ex.: aprender React e participar de um projeto com cliente real"
                rows={4}
                value={field.value ?? ""}
                onChange={field.onChange}
                isInvalid={Boolean(fieldState.error)}
                hint={fieldState.error?.message}
              />
            )}
          />
        </Section>
      )}
    </>
  );
}

/** Checkboxes de múltipla escolha com opções fixas; ao atingir o máximo, as demais ficam desabilitadas */
function CheckboxList<T extends string>({
  control,
  name,
  label,
  labels,
}: {
  control: Control<ProfileForm>;
  name: "careerPaths" | "softSkills";
  label: string;
  labels: Record<T, string>;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected = (field.value ?? []) as string[];
        const isFull = selected.length >= maxProfileChoices;

        const toggle = (value: string, isSelected: boolean) =>
          field.onChange(isSelected ? [...selected, value] : selected.filter((item) => item !== value));

        return (
          <fieldset className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label>{label}</Label>
              <span className={cx("text-xs", isFull ? "font-semibold text-brand-secondary" : "text-tertiary")}>
                {selected.length}/{maxProfileChoices}
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {toOptions(labels).map((option) => {
                const isSelected = selected.includes(option.id);

                return (
                  <Checkbox
                    key={option.id}
                    label={option.label}
                    isSelected={isSelected}
                    isDisabled={isFull && !isSelected}
                    onChange={(checked) => toggle(option.id, checked)}
                  />
                );
              })}
            </div>

            {fieldState.error && <HintText isInvalid>{fieldState.error.message}</HintText>}
          </fieldset>
        );
      }}
    />
  );
}

/** Tags livres com sugestões do catálogo (itens que outras pessoas já usaram) */
function CatalogTags({
  control,
  name,
  label,
}: {
  control: Control<ProfileForm>;
  name: "technologies" | "interestAreas";
  label: string;
}) {
  const technologies = useTechnologyCatalog();
  const interestAreas = useInterestAreaCatalog();
  const catalog = (name === "technologies" ? technologies.data : interestAreas.data) ?? [];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected = field.value ?? [];
        const selectedLower = selected.map((item) => item.toLowerCase());
        const suggestions = catalog.filter((item) => !selectedLower.includes(item.toLowerCase())).slice(0, 12);

        return (
          <div className="flex flex-col gap-2">
            <InputTags
              label={label}
              placeholder="Digite e pressione Enter"
              value={selected}
              onChange={field.onChange}
              isInvalid={Boolean(fieldState.error)}
            />

            {suggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-tertiary">Sugestões:</span>
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="cursor-pointer rounded-full outline-focus-ring focus-visible:outline-2"
                    onClick={() => field.onChange([...selected, item])}
                  >
                    <Badge size="sm" color="gray">
                      + {item}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {fieldState.error && <HintText isInvalid>{fieldState.error.message}</HintText>}
          </div>
        );
      }}
    />
  );
}
