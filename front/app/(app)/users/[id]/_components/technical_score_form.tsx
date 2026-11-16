"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { toast } from "@/components/feedback/toast";
import { useUpdateTechnicalScore } from "@/hooks/administration/use_profiles";
import { handleApiError } from "@/lib/form_errors";
import { formatDate } from "@/lib/moment";
import { technicalScoreSchema, type TechnicalScoreForm as TechnicalScoreValues } from "@/schemas/administration";
import type { Profile } from "@/types/administration";

const toFormValues = (profile: Profile): TechnicalScoreValues => ({
  technicalScore: profile.technicalScore === null ? "" : String(profile.technicalScore).replace(".", ","),
});

/** Nota técnica (0 a 10) editável direto no card, para CORP ou o diretor da pessoa; vazio remove a nota */
export function TechnicalScoreForm({ profile }: { profile: Profile }) {
  const updateScore = useUpdateTechnicalScore(profile.user.id);

  const { control, handleSubmit, setError, reset, formState } = useForm<TechnicalScoreValues>({
    resolver: zodResolver(technicalScoreSchema),
    defaultValues: toFormValues(profile),
  });

  useEffect(() => {
    reset(toFormValues(profile));
  }, [profile, reset]);

  const onSubmit = handleSubmit(({ technicalScore }) => {
    // Aceita vírgula ou ponto como separador decimal
    const score = technicalScore === "" ? null : Number(technicalScore.replace(",", "."));

    updateScore.mutate(score, {
      onSuccess: () => toast.success("Nota técnica atualizada", { description: profile.user.fullName }),
      onError: (error) => handleApiError(error, setError),
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      <Controller
        control={control}
        name="technicalScore"
        render={({ field, fieldState }) => (
          <Input
            label="Nota (0 a 10)"
            placeholder="Ex.: 7,5"
            inputMode="decimal"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={Boolean(fieldState.error)}
            hint={
              fieldState.error?.message ??
              (profile.technicalScoreUpdatedAt
                ? `Atualizada em ${formatDate(profile.technicalScoreUpdatedAt)}. Vazio remove a nota.`
                : "Sem nota. Vazio remove a nota.")
            }
          />
        )}
      />

      <Button
        type="submit"
        color="secondary"
        isDisabled={!formState.isDirty}
        isLoading={updateScore.isPending}
        showTextWhileLoading
      >
        Salvar nota
      </Button>
    </form>
  );
}
