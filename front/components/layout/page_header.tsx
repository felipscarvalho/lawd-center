import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  /** Botões de ação à direita (ex.: "Novo usuário") */
  actions?: ReactNode;
  /** Conteúdo acima do título (ex.: breadcrumbs) */
  children?: ReactNode;
}

/** Cabeçalho padrão das páginas da área logada: só o título, sem texto de apoio */
export const PageHeader = ({ title, actions, children }: PageHeaderProps) => (
  <header className="flex flex-col gap-4">
    {children}

    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-display-xs font-semibold text-primary">{title}</h1>

      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  </header>
);
