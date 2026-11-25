"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { toast } from "@/components/feedback/toast";
import { FormInput } from "@/components/forms/form_input";
import { useUpdateTechnicalScore } from "@/hooks/administration/use_profiles";
import { useEditForm } from "@/hooks/use_edit_form";
import { handleApiError } from "@/lib/form_errors";
import { formatDate } from "@/lib/moment";
import { technicalScoreSchema, type TechnicalScoreForm as TechnicalScoreValues } from "@/schemas/administration";
import type { Profile } from "@/types/administration";
import { displayName } from "@/lib/administration";

const toFormValues = (profile: Profile): TechnicalScoreValues => ({
  technicalScore: profile.technicalScore === null ? "" : String(profile.technicalScore).replace(".", ","),
});

/** Nota técnica (0 a 10) editável direto no card, para CORP ou o diretor da pessoa; vazio remove a nota */
export function TechnicalScoreForm({ profile }: { profile: Profile }) {
  const updateScore = useUpdateTechnicalScore(profile.user.id);

  const { control, handleSubmit, setError, formState } = useEditForm<TechnicalScoreValues>({
    resolver: zodResolver(technicalScoreSchema),
    values: () => toFormValues(profile),
    deps: [profile],
  });

  const onSubmit = handleSubmit(({ technicalScore }) => {
    // Aceita vírgula ou ponto como separador decimal
    const score = technicalScore === "" ? null : Number(technicalScore.replace(",", "."));

    updateScore.mutate(score, {
      onSuccess: () => toast.success("Nota técnica atualizada", { description: displayName(profile.user) }),
      onError: (error) => handleApiError(error, setError),
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      <FormInput
        control={control}
        name="technicalScore"
        label="Nota (0 a 10)"
        placeholder="Ex.: 7,5"
        inputMode="decimal"
        hint={(profile.technicalScoreUpdatedAt ? `Atualizada em ${formatDate(profile.technicalScoreUpdatedAt)}. Vazio remove a nota.` : "Sem nota. Vazio remove a nota.")}
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
