"use client";

import { use, useEffect, useState, type ReactNode } from "react";
import { browser } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { BarChartSquare02, Building07, Dataflow03, FolderClosed, LogOut01, UserCircle, Users01 } from "@untitledui/icons";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { SidebarNavigationSimple } from "@/components/application/app-navigation/sidebar-navigation/sidebar-simple";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { Button } from "@/components/base/buttons/button";
import { Alert } from "@/components/feedback/alert";
import { ThemeToggle } from "@/components/theme/theme_toggle";
import { avatarProps } from "@/components/administration/person_link";
import { usePermissions } from "@/hooks/administration/use_auth";
import { useUserStore } from "@/stores/user_store";
import type { PermissionKey } from "@/types/administration";
import { FullPageLoading } from "./full_page_loading";

type NavigationItem = NavItemType & { permission?: PermissionKey };

/**
 * Menu em seções com título, uma por módulo. Itens sem permissão aparecem para todos os usuários
 * logados; seções que ficam sem nenhum item visível não aparecem.
 */
const navigation: { title: string; items: NavigationItem[] }[] = [
  {
    title: "Pessoal",
    items: [{ label: "Meu perfil", href: "/profile", icon: UserCircle }],
  },
  {
    title: "Administração",
    items: [
      { label: "Organograma", href: "/organization", icon: Dataflow03, permission: "administration.membership.view" },
      { label: "Usuários", href: "/users", icon: Users01, permission: "administration.user.view" },
      { label: "Diretorias", href: "/directorates", icon: Building07, permission: "administration.directorate.view" },
    ],
  },
  {
    title: "Projetos",
    items: [
      { label: "Projetos", href: "/projects", icon: FolderClosed, permission: "projects.project.view" },
      { label: "Análise", href: "/projects/analytics", icon: BarChartSquare02, permission: "projects.project.view" },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  // O token fica no localStorage: no servidor a área logada mostra só o carregamento (fallback do Suspense)
  use(browser("A sessão do usuário fica no localStorage"));

  const router = useRouter();
  const pathname = usePathname();
  const token = useUserStore((state) => state.token);
  const user = useUserStore((state) => state.user);
  const status = useUserStore((state) => state.status);
  const error = useUserStore((state) => state.error);
  const revalidate = useUserStore((state) => state.revalidate);
  const logout = useUserStore((state) => state.logout);
  const { canAnywhere } = usePermissions();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  // Ao abrir a área logada, confirma no backend que a sessão vale e atualiza dados e permissões
  useEffect(() => {
    if (token) revalidate();
  }, [token, revalidate]);

  // Recarga completa (window.location) limpa todo o estado do cliente, já que o Next mantém rotas montadas
  const handleLogout = async () => {
    setIsLoggingOut(true);

    await logout();

    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  };

  // Sem dados guardados ainda (primeiro acesso após o login): espera a revalidação
  if (!token || !user) {
    if (status === "error") {
      return (
        <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4">
          <Alert color="error" title="Não foi possível carregar sua sessão" description={error ?? undefined} />
          <Button color="secondary" onClick={() => revalidate()}>
            Tentar novamente
          </Button>
        </div>
      );
    }

    return <FullPageLoading />;
  }

  const sections = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.permission || canAnywhere(item.permission)),
    }))
    .filter((section) => section.items.length > 0);

  // O NavList desenha o divider com label como título da seção
  const items: NavItemType[] = sections.flatMap((section) => [
    { label: section.title, divider: true },
    ...section.items,
  ]);
  // Destaca o item da seção atual também nas subpáginas (ex.: /users/5 → /users)
  const activeUrl = items.find((item) => item.href && pathname.startsWith(item.href))?.href;

  const accountCard = (
    <div className="glass flex flex-col gap-3 rounded-xl p-3 ring-1 ring-secondary">
      <AvatarLabelGroup
        size="md"
        {...avatarProps(user)}
        title={user.fullName}
        subtitle={user.email}
      />

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          color="secondary"
          size="sm"
          iconLeading={LogOut01}
          className="flex-1"
          onClick={handleLogout}
          isLoading={isLoggingOut}
          showTextWhileLoading
        >
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row">
      <SidebarNavigationSimple activeUrl={activeUrl} items={items} featureCard={accountCard} />

      <main className="mx-auto flex w-full max-w-6xl min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
