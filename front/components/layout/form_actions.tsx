import { Button } from "@/components/base/buttons/button";

interface FormActionsProps {
  /** Algo mudou em relação aos dados salvos */
  isDirty: boolean;
  isSubmitting: boolean;
  /** Volta o formulário para os dados salvos */
  onDiscard: () => void;
  submitLabel?: string;
}

/**
 * Rodapé dos formulários de edição direta (telas de detalhe): "Descartar" e "Salvar",
 * ativos só quando algo mudou.
 */
export const FormActions = ({
  isDirty,
  isSubmitting,
  onDiscard,
  submitLabel = "Salvar alterações",
}: FormActionsProps) => (
  <div className="flex flex-col-reverse gap-3 border-t border-secondary pt-6 sm:flex-row sm:justify-end">
    <Button color="secondary" onClick={onDiscard} isDisabled={!isDirty || isSubmitting}>
      Descartar
    </Button>
    <Button type="submit" isDisabled={!isDirty} isLoading={isSubmitting} showTextWhileLoading>
      {submitLabel}
    </Button>
  </div>
);
