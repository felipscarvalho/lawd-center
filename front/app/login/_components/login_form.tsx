"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail01 } from "@untitledui/icons";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/base/buttons/button";
import { FormInput } from "@/components/forms/form_input";
import { ThemeToggle } from "@/components/theme/theme_toggle";
import { Card } from "@/components/layout/card";
import { HOME_AFTER_LOGIN } from "@/lib/administration";
import { handleApiError } from "@/lib/form_errors";
import { loginSchema, type LoginForm as LoginFormValues } from "@/schemas/administration";
import { useUserStore } from "@/stores/user_store";

export function LoginForm() {
  const router = useRouter();
  const token = useUserStore((state) => state.token);
  const login = useUserStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setError } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Quem já tem sessão não precisa ver o login
  useEffect(() => {
    if (token) router.replace(HOME_AFTER_LOGIN);
  }, [token, router]);

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      await login(values);
      router.replace(HOME_AFTER_LOGIN);
    } catch (error) {
      handleApiError(error, setError);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <main className="flex min-h-dvh flex-col px-4 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <Logo />
        <ThemeToggle />
      </header>

      <section className="flex flex-1 items-center justify-center py-12">
        <Card className="flex w-full max-w-md flex-col gap-6 p-8 sm:p-10">
          <div className="flex flex-col gap-1">
            <h1 className="text-display-xs font-semibold text-primary">Entrar</h1>
            <p className="text-md text-tertiary">Acesse o Lawd Center com seu e-mail e senha.</p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <FormInput
              control={control}
              name="email"
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              icon={Mail01}
            />

            <FormInput
              control={control}
              name="password"
              label="Senha"
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
            />

            <Button type="submit" size="lg" className="mt-2" isLoading={isSubmitting} showTextWhileLoading>
              Entrar
            </Button>
          </form>

          <Button color="link-gray" size="sm" iconLeading={ArrowLeft} href="/" className="self-center">
            Voltar para o início
          </Button>
        </Card>
      </section>
    </main>
  );
}
