import { useEffect, type DependencyList } from "react";
import { useForm, type DefaultValues, type FieldValues, type Resolver } from "react-hook-form";

interface UseEditFormOptions<T extends FieldValues> {
  resolver: Resolver<T>;
  /** Valores do formulário montados a partir dos dados salvos */
  values: () => T;
  /** Dados salvos de onde vêm os valores (ex.: o retorno do useQuery) */
  deps: DependencyList;
}

/**
 * Formulário de edição direta (telas de detalhe): começa com os dados salvos, recarrega quando eles
 * mudam de fato (o TanStack Query mantém a referência se nada mudou) e oferece `discard` para o
 * botão Descartar.
 */
export function useEditForm<T extends FieldValues>({ resolver, values, deps }: UseEditFormOptions<T>) {
  const form = useForm<T>({ resolver, defaultValues: values() as DefaultValues<T> });
  const { reset } = form;

  useEffect(() => {
    reset(values());
    // As dependências são os dados salvos informados por quem chama
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset, ...deps]);

  const discard = () => reset(values());

  return { ...form, discard };
}
