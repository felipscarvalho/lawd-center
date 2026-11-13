"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { I18nProvider, RouterProvider } from "react-aria-components";

declare module "react-aria-components" {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
  }
}

// Providers globais da aplicação, renderizados uma vez no layout raiz.
// - ThemeProvider alterna entre light e dark aplicando as classes do Untitled UI (light-mode / dark-mode) no <html>; padrão dark, como no SimMAP
// - RouterProvider faz os links do react-aria (Button, Link, sidebar, breadcrumbs) navegarem pelo router do Next, sem recarregar a página
// - I18nProvider define o locale dos componentes do react-aria (nomes de meses e dias no calendário, ordem DD/MM/AAAA nos campos de data)
export const Providers = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  return (
    <ThemeProvider
      attribute="class"
      value={{ light: "light-mode", dark: "dark-mode" }}
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <RouterProvider navigate={router.push}>
        <I18nProvider locale="pt-BR">{children}</I18nProvider>
      </RouterProvider>
    </ThemeProvider>
  );
};
