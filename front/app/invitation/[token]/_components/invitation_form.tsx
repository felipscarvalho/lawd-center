"use client";

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail01 } from "@untitledui/icons";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { FormInput } from "@/components/forms/form_input";
import { ThemeToggle } from "@/components/theme/theme_toggle";
import { Card } from "@/components/layout/card";
import { LoadingState } from "@/components/layout/query_states";
import { useAcceptInvitation, useInvitation } from "@/hooks/administration/use_invitations";
import { HOME_AFTER_LOGIN } from "@/lib/administration";
import { handleApiError } from "@/lib/form_errors";
import { acceptInvitationSchema, type AcceptInvitationForm } from "@/schemas/administration";
import type { Invitation } from "@/types/administration";

const checkingLabel = "Conferindo o convite...";

/**
 * Aceite do convite enviado por e-mail: confere o link, pede nome e senha e já entra no sistema.
 * Cabeçalho e card aparecem de imediato; só o conteúdo do card espera o token da URL e a API.
 */
export function InvitationForm() {
  return (
    <main className="flex min-h-dvh flex-col px-4 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <Logo />
        <ThemeToggle />
      </header>

      <section className="flex flex-1 items-center justify-center py-12">
        <Card className="flex w-full max-w-md flex-col gap-6 p-8 sm:p-10">
          {/* O token vem da URL (useParams), que só é conhecido na requisição: precisa de um Suspense em volta */}
          <Suspense fallback={<LoadingState label={checkingLabel} />}>
            <InvitationContent />
          </Suspense>

          <Button color="link-gray" size="sm" iconLeading={ArrowLeft} href="/" className="self-center">
            Voltar para o início
          </Button>
        </Card>
      </section>
    </main>
  );
}

function InvitationContent() {
  const params = useParams<{ token: string }>();
  const token = decodeURIComponent(params.token);
  const invitation = useInvitation(token);

  if (invitation.isPending) {
    return <LoadingState label={checkingLabel} />;
  }

  if (invitation.isError) {
    return (
      <>
        <div className="flex flex-col gap-1">
          <h1 className="text-display-xs font-semibold text-primary">Convite indisponível</h1>
          <p className="text-md text-tertiary">{invitation.error.message}</p>
        </div>

        <Button href="/login" size="lg">
          Ir para o login
        </Button>
      </>
    );
  }

  return <AcceptInvitationFields token={token} invitation={invitation.data} />;
}

function AcceptInvitationFields({ token, invitation }: { token: string; invitation: Invitation }) {
  const router = useRouter();
  const accept = useAcceptInvitation(token);

  const { control, handleSubmit, setError } = useForm<AcceptInvitationForm>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: { fullName: invitation.fullName ?? "", password: "", passwordConfirmation: "" },
  });

  const onSubmit = handleSubmit((values) => {
    accept.mutate(
      { fullName: values.fullName, password: values.password },
      {
        onSuccess: () => router.replace(HOME_AFTER_LOGIN),
        onError: (error) => handleApiError(error, setError),
      },
    );
  });

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-display-xs font-semibold text-primary">Criar sua senha</h1>
        <p className="text-md text-tertiary">Confirme seu nome e escolha a senha que vai usar para entrar.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Input label="E-mail" value={invitation.email} icon={Mail01} isDisabled />

        <FormInput
          control={control}
          name="fullName"
          label="Nome completo"
          autoComplete="name"
          placeholder="Nome e sobrenome"
        />

        <FormInput
          control={control}
          name="password"
          label="Senha"
          type="password"
          autoComplete="new-password"
          placeholder="Pelo menos 8 caracteres"
        />

        <FormInput
          control={control}
          name="passwordConfirmation"
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a senha"
        />

        <Button type="submit" size="lg" className="mt-2" isLoading={accept.isPending} showTextWhileLoading>
          Criar senha e entrar
        </Button>
      </form>
    </>
  );
}
