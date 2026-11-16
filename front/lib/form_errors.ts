import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "@/components/feedback/toast";
import { ApiError } from "@/lib/api";

/**
 * Mostra o erro de uma mutation: erros de validação por campo vão para o formulário
 * (quando informado); qualquer outro erro vira um toast.
 */
export function handleApiError<T extends FieldValues>(error: unknown, setError?: UseFormSetError<T>) {
  const apiError =
    error instanceof ApiError ? error : new ApiError("Ocorreu um erro inesperado", 0, null, {});
  const fieldEntries = Object.entries(apiError.fieldErrors);

  if (setError && fieldEntries.length > 0) {
    for (const [field, message] of fieldEntries) {
      setError(field as Path<T>, { type: "server", message });
    }

    return;
  }

  toast.error(apiError.message);
}
