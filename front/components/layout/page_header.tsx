import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Botões de ação à direita (ex.: "Novo usuário") */
  actions?: ReactNode;
  /** Conteúdo acima do título (ex.: breadcrumbs) */
  children?: ReactNode;
}

/** Cabeçalho padrão das páginas da área logada */
export const PageHeader = ({ title, description, actions, children }: PageHeaderProps) => (
  <header className="flex flex-col gap-4">
    {children}

    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-display-xs font-semibold text-primary">{title}</h1>
        {description && <p className="text-md text-tertiary">{description}</p>}
      </div>

      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  </header>
);
