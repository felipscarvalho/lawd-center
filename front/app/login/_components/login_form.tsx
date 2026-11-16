"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail01 } from "@untitledui/icons";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { ThemeToggle } from "@/components/theme/theme_toggle";
import { handleApiError } from "@/lib/form_errors";
import { loginSchema, type LoginForm as LoginFormValues } from "@/schemas/administration";
import { useUserStore } from "@/stores/user_store";

/** Página para onde o usuário vai depois de entrar */
const HOME_AFTER_LOGIN = "/organization";

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
        <div className="glass flex w-full max-w-md flex-col gap-6 rounded-2xl p-8 ring-1 ring-secondary sm:p-10">
          <div className="flex flex-col gap-1">
            <h1 className="text-display-xs font-semibold text-primary">Entrar</h1>
            <p className="text-md text-tertiary">Acesse o Lawd Center com seu e-mail e senha.</p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Input
                  label="E-mail"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  icon={Mail01}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  isInvalid={Boolean(fieldState.error)}
                  hint={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Input
                  label="Senha"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  isInvalid={Boolean(fieldState.error)}
                  hint={fieldState.error?.message}
                />
              )}
            />

            <Button type="submit" size="lg" className="mt-2" isLoading={isSubmitting} showTextWhileLoading>
              Entrar
            </Button>
          </form>

          <Button color="link-gray" size="sm" iconLeading={ArrowLeft} href="/" className="self-center">
            Voltar para o início
          </Button>
        </div>
      </section>
    </main>
  );
}
