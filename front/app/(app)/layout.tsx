import { Suspense } from "react";
import { AppShell } from "./_components/app_shell";
import { FullPageLoading } from "./_components/full_page_loading";

/**
 * A sessão fica no localStorage, então a área logada só é montada no navegador (ver AppShell)
 * e a navegação até ela espera a sessão carregar. Isso desliga a validação de "instant navigation"
 * do Next para este segmento, que acusaria esse carregamento como bloqueante.
 */
export const instant = false;

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<FullPageLoading />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
