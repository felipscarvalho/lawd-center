"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/base/input/input";
import { toast } from "@/components/feedback/toast";
import { FormModal } from "@/components/overlays/form_modal";
import { useUpdateTechnicalScore } from "@/hooks/administration/use_profiles";
import { handleApiError } from "@/lib/form_errors";
import { technicalScoreSchema, type TechnicalScoreForm } from "@/schemas/administration";
import type { Profile } from "@/types/administration";

interface TechnicalScoreModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  profile: Profile;
}

/** Nota técnica (0 a 10), definida por CORP ou pelo diretor da pessoa; vazio remove a nota */
export function TechnicalScoreModal({ isOpen, onOpenChange, profile }: TechnicalScoreModalProps) {
  const updateScore = useUpdateTechnicalScore(profile.user.id);

  const { control, handleSubmit, setError, reset } = useForm<TechnicalScoreForm>({
    resolver: zodResolver(technicalScoreSchema),
  });

  useEffect(() => {
    if (isOpen)
      reset({
        technicalScore: profile.technicalScore === null ? "" : String(profile.technicalScore),
      });
  }, [isOpen, profile.technicalScore, reset]);

  const onSubmit = handleSubmit(({ technicalScore }) => {
    // Aceita vírgula ou ponto como separador decimal
    const score = technicalScore === "" ? null : Number(technicalScore.replace(",", "."));

    updateScore.mutate(score, {
      onSuccess: () => {
        toast.success("Nota técnica atualizada", {
          description: profile.user.fullName,
        });
        onOpenChange(false);
      },
      onError: (error) => handleApiError(error, setError),
    });
  });

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Nota técnica"
      description={`Avaliação de ${profile.user.fullName}. Visível só para quem avalia.`}
      onSubmit={onSubmit}
      isSubmitting={updateScore.isPending}
    >
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
            hint={fieldState.error?.message ?? "Deixe vazio para remover a nota"}
          />
        )}
      />
    </FormModal>
  );
}
