import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/utils/cx";

/** Card de vidro padrão das telas (fundo translúcido, cantos arredondados e borda sutil) */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("glass rounded-2xl ring-1 ring-secondary", className)} />;
}

interface SplitCardProps {
  /** Coluna da esquerda (foto, situação, ações) */
  aside: ReactNode;
  /** Conteúdo principal (formulário ou leitura) */
  children: ReactNode;
}

/** Card em duas colunas usado em Meu perfil e no detalhe do usuário; no celular, uma embaixo da outra */
export function SplitCard({ aside, children }: SplitCardProps) {
  return (
    <Card className="grid overflow-hidden lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6 border-b border-secondary p-5 sm:p-6 lg:border-r lg:border-b-0">
        {aside}
      </aside>
      {children}
    </Card>
  );
}
