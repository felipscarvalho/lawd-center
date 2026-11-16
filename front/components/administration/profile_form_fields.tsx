"use client";

import type { ReactNode } from "react";
import { Controller, type Control } from "react-hook-form";
import { parseDate } from "@internationalized/date";
import { Badge } from "@/components/base/badges/badges";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { HintText } from "@/components/base/input/hint-text";
import { Input } from "@/components/base/input/input";
import { InputDate } from "@/components/base/input/input-date";
import { InputTags } from "@/components/base/input/input-tags";
import { Label } from "@/components/base/input/label";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { useInterestAreaCatalog, useTechnologyCatalog } from "@/hooks/administration/use_profiles";
import {
  careerPathLabels,
  courseLabels,
  maturityDescriptions,
  maturityLabels,
  softSkillLabels,
  toOptions,
  weeklyAvailabilityLabels,
} from "@/lib/administration";
import type { ProfileForm } from "@/schemas/administration";
import type { Profile, UpdateProfilePayload } from "@/types/administration";

export const toProfileFormValues = (profile: Profile): ProfileForm => ({
  birthDate: profile.birthDate,
  course: profile.course,
  universityEntryPeriod: profile.universityEntryPeriod ?? "",
  graduated: profile.graduated,
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
  universityEntryPeriod: values.universityEntryPeriod || null,
  goal: values.goal || null,
  ...(canEditPrivate ? {} : { birthDate: undefined, goal: undefined }),
});

interface ProfileFormFieldsProps {
  control: Control<ProfileForm>;
  /** Nascimento e objetivo: só a própria pessoa ou quem pode ver dados privados */
  canEditPrivate: boolean;
}

/** Campos do perfil agrupados em seções; usados no modal de edição e na página "Meu perfil" */
export function ProfileFormFields({ control, canEditPrivate }: ProfileFormFieldsProps) {
  return (
    <>
      <FormSection title="Formação">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="course"
            render={({ field, fieldState }) => (
              <Select
                label="Curso"
                placeholder="Selecione o curso"
                items={toOptions(courseLabels)}
                selectedKey={field.value ?? null}
                onSelectionChange={(key) => field.onChange(key ?? null)}
                isInvalid={Boolean(fieldState.error)}
                hint={fieldState.error?.message}
              >
                {(item) => <Select.Item id={item.id} label={item.label} />}
              </Select>
            )}
          />

          <Controller
            control={control}
            name="universityEntryPeriod"
            render={({ field, fieldState }) => (
              <Input
                label="Entrada na UFS"
                placeholder="Ex.: 2022.1"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                isInvalid={Boolean(fieldState.error)}
                hint={fieldState.error?.message ?? "Ano e semestre de entrada"}
              />
            )}
          />

          {canEditPrivate && (
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
          )}

          <Controller
            control={control}
            name="graduated"
            render={({ field }) => (
              <div className="flex items-end pb-2.5">
                <Checkbox label="Já me formei" isSelected={field.value} onChange={field.onChange} />
              </div>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Atuação na LAWD">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="weeklyAvailability"
            render={({ field }) => (
              <Select
                label="Disponibilidade"
                placeholder="Horas por semana"
                items={toOptions(weeklyAvailabilityLabels)}
                selectedKey={field.value ?? null}
                onSelectionChange={(key) => field.onChange(key ?? null)}
              >
                {(item) => <Select.Item id={item.id} label={item.label} />}
              </Select>
            )}
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
                hint={field.value ? maturityDescriptions[field.value] : "Como você se vê tecnicamente hoje"}
              >
                {(item) => <Select.Item id={item.id} label={item.label} />}
              </Select>
            )}
          />
        </div>

        <CheckboxList control={control} name="careerPaths" label="Carreira de interesse" labels={careerPathLabels} />
        <CheckboxList control={control} name="softSkills" label="Atributos" labels={softSkillLabels} />

        <CatalogTags control={control} name="technologies" label="Tecnologias" />
        <CatalogTags control={control} name="interestAreas" label="Áreas de interesse" />
      </FormSection>

      {canEditPrivate && (
        <FormSection title="Sobre você">
          <Controller
            control={control}
            name="goal"
            render={({ field, fieldState }) => (
              <TextArea
                label="Objetivo na LAWD"
                placeholder="O que você quer aprender ou construir na liga?"
                rows={4}
                value={field.value ?? ""}
                onChange={field.onChange}
                isInvalid={Boolean(fieldState.error)}
                hint={fieldState.error?.message}
              />
            )}
          />
        </FormSection>
      )}
    </>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-md font-semibold text-primary">{title}</h3>
      {children}
    </section>
  );
}

/** Lista de checkboxes para campos de múltipla escolha com opções fixas */
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
      render={({ field }) => {
        const selected = (field.value ?? []) as string[];

        const toggle = (value: string, isSelected: boolean) =>
          field.onChange(isSelected ? [...selected, value] : selected.filter((item) => item !== value));

        return (
          <fieldset className="flex flex-col gap-2">
            <Label>{label}</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {toOptions(labels).map((option) => (
                <Checkbox
                  key={option.id}
                  label={option.label}
                  isSelected={selected.includes(option.id)}
                  onChange={(isSelected) => toggle(option.id, isSelected)}
                />
              ))}
            </div>
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
