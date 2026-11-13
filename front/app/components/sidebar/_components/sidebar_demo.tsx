"use client";

import {
  ArrowLeft,
  BarChartSquare02,
  Calendar,
  CurrencyDollarCircle,
  FileCheck02,
  LifeBuoy01,
  Settings01,
  Users01,
} from "@untitledui/icons";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { SidebarNavigationSimple } from "@/components/application/app-navigation/sidebar-navigation/sidebar-simple";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ThemeToggle } from "@/components/theme/theme_toggle";

const navItems: NavItemType[] = [
  { label: "Dashboard", href: "/components/sidebar", icon: BarChartSquare02 },
  {
    label: "Processos",
    href: "/components/sidebar/processes",
    icon: FileCheck02,
    badge: (
      <Badge size="sm" type="modern">
        12
      </Badge>
    ),
  },
  {
    label: "Clientes",
    icon: Users01,
    items: [
      { label: "Pessoas físicas", href: "/components/sidebar/clients/people" },
      { label: "Empresas", href: "/components/sidebar/clients/companies" },
    ],
  },
  { label: "Agenda", href: "/components/sidebar/calendar", icon: Calendar },
  { label: "Financeiro", href: "/components/sidebar/finance", icon: CurrencyDollarCircle },
];

const footerItems: NavItemType[] = [
  { label: "Suporte", href: "/components/sidebar/support", icon: LifeBuoy01 },
  { label: "Configurações", href: "/components/sidebar/settings", icon: Settings01 },
];

export function SidebarDemo() {
  return (
    <div className="flex flex-col lg:flex-row">
      <SidebarNavigationSimple activeUrl="/components/sidebar" items={navItems} footerItems={footerItems} />

      <main className="flex flex-1 flex-col gap-4 px-6 py-8 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-display-xs font-semibold text-primary">Dashboard</h1>
          <ThemeToggle />
        </div>
        <p className="text-md text-tertiary">Área de conteúdo ao lado da sidebar. Os links da sidebar são apenas demonstrativos.</p>
        <div>
          <Button color="secondary" iconLeading={ArrowLeft} href="/components">
            Voltar para componentes
          </Button>
        </div>
      </main>
    </div>
  );
}
