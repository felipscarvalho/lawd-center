"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail01 } from "@untitledui/icons";
import { z } from "zod";
import { Button } from "@/components/base/buttons/button";
import { toast } from "@/components/feedback/toast";
import { FormInput } from "@/components/forms/form_input";
import { useSubscribeToSelection } from "@/hooks/recruitment/use_selection_subscribers";
import { handleApiError } from "@/lib/form_errors";
import { cx } from "@/utils/cx";

const selectionNoticeSchema = z.object({
  email: z.email("Informe um e-mail válido").max(254),
});

type SelectionNoticeForm = z.infer<typeof selectionNoticeSchema>;

const emptyValues: SelectionNoticeForm = { email: "" };

/** Pedido de aviso da abertura do processo seletivo: e-mail e botão numa barra só */
export function SelectionNoticeForm({ className }: { className?: string }) {
  const subscribe = useSubscribeToSelection();
  const { control, handleSubmit, reset, setError } = useForm<SelectionNoticeForm>({
    resolver: zodResolver(selectionNoticeSchema),
    defaultValues: emptyValues,
  });

  const onSubmit = handleSubmit((values) => {
    subscribe.mutate(values, {
      onSuccess: ({ email }) => {
        toast.success("Você está na lista de aviso", {
          description: `Vamos escrever para ${email} quando o processo seletivo abrir.`,
        });

        reset(emptyValues);
      },
      onError: (error) => handleApiError(error, setError),
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cx(
        "glass flex w-full flex-col gap-2 rounded-2xl p-2 text-left ring-1 ring-secondary sm:flex-row sm:items-start",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <FormInput
          control={control}
          name="email"
          aria-label="E-mail"
          type="email"
          size="lg"
          autoComplete="email"
          placeholder="Seu melhor e-mail"
          icon={Mail01}
        />
      </div>

      <Button type="submit" size="lg" isLoading={subscribe.isPending} showTextWhileLoading>
        Entrar na lista de aviso
      </Button>
    </form>
  );
}
