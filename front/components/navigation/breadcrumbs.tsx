"use client";

import type { FC } from "react";
import { ChevronRight, HomeLine, SlashDivider } from "@untitledui/icons";
import { Breadcrumb as AriaBreadcrumb, Breadcrumbs as AriaBreadcrumbs, Link as AriaLink } from "react-aria-components";
import { cx } from "@/utils/cx";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: FC<{ className?: string }>;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  // Separador entre os itens
  divider?: "chevron" | "slash";
  // Estilo dos itens: texto simples ou botão com fundo no item atual
  type?: "text" | "button";
  // Quando informado, adiciona um link com ícone de início antes dos itens
  homeHref?: string;
  className?: string;
}

export const Breadcrumbs = ({ items, divider = "chevron", type = "text", homeHref, className }: BreadcrumbsProps) => {
  const Divider = divider === "chevron" ? ChevronRight : SlashDivider;

  // O item de início vira um link só com ícone, com rótulo acessível
  const allItems: (BreadcrumbItem & { id: string; iconOnly?: boolean })[] = [
    ...(homeHref ? [{ id: "home", label: "Início", href: homeHref, icon: HomeLine, iconOnly: true }] : []),
    ...items.map((item, index) => ({ ...item, id: `${index}-${item.label}` })),
  ];

  return (
    <AriaBreadcrumbs items={allItems} className={cx("flex flex-wrap items-center gap-1.5 md:gap-2", className)}>
      {(item) => (
        <AriaBreadcrumb id={item.id} className="flex items-center gap-1.5 md:gap-2">
          {({ isCurrent }) => (
            <>
              <AriaLink
                href={item.href}
                aria-label={item.iconOnly ? item.label : undefined}
                className={cx(
                  "flex items-center gap-1.5 rounded-md text-sm font-semibold text-quaternary outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2",
                  type === "button" && "px-2 py-1",
                  // Itens anteriores são links navegáveis
                  !isCurrent && item.href && "cursor-pointer hover:text-tertiary_hover",
                  !isCurrent && item.href && type === "button" && "hover:bg-primary_hover",
                  // Item atual (último) é destacado e não navega
                  isCurrent && (type === "button" ? "bg-primary_hover text-fg-secondary" : "text-fg-brand-secondary"),
                )}
              >
                {item.icon && <item.icon className="size-5 shrink-0" />}
                {!item.iconOnly && item.label}
              </AriaLink>
              {!isCurrent && <Divider aria-hidden="true" className="size-4 shrink-0 text-fg-quaternary" />}
            </>
          )}
        </AriaBreadcrumb>
      )}
    </AriaBreadcrumbs>
  );
};
