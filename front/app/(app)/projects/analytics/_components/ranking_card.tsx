import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/layout/card";
import { cx } from "@/utils/cx";

export interface RankingItem {
  id: string | number;
  label: ReactNode;
  /** Leva ao detalhe (ex.: do projeto); a linha inteira vira o link */
  href?: string;
  value: number;
}

interface RankingCardProps {
  title: string;
  description: string;
  items: RankingItem[];
  /** Unidade do número no singular e no plural (ex.: ["pessoa", "pessoas"]) */
  unit: [singular: string, plural: string];
  /** Mostra a posição (1, 2, 3...) antes de cada item; desligar quando a ordem não é um ranking */
  showPosition?: boolean;
  emptyMessage: string;
}

/** Lista curta de itens com um número em destaque (no lugar dos gráficos, por enquanto) */
export function RankingCard({ title, description, items, unit, showPosition = true, emptyMessage }: RankingCardProps) {
  return (
    <Card className="flex min-w-0 flex-col gap-3 p-2">
      <header className="flex flex-col gap-0.5 px-3 pt-3">
        <h2 className="text-md font-semibold text-primary">{title}</h2>
        <p className="text-sm text-tertiary">{description}</p>
      </header>

      {items.length === 0 ? (
        <p className="px-3 pb-3 text-sm text-tertiary">{emptyMessage}</p>
      ) : (
        <ol className="flex flex-col">
          {items.map((item, index) => {
            const content = (
              <>
                {showPosition && (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-tertiary">
                    {index + 1}
                  </span>
                )}
                <span className="line-clamp-2 min-w-0 flex-1 text-sm font-medium text-primary">{item.label}</span>
                <span className="flex shrink-0 items-baseline gap-1">
                  <span className="text-md font-semibold text-primary">{item.value}</span>
                  <span className="text-xs text-tertiary">{item.value === 1 ? unit[0] : unit[1]}</span>
                </span>
              </>
            );
            const rowClassName = "flex items-center gap-3 rounded-lg px-3 py-2.5";

            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cx(
                      rowClassName,
                      "outline-focus-ring transition-colors hover:bg-primary_hover focus-visible:outline-2",
                    )}
                  >
                    {content}
                  </Link>
                ) : (
                  <div className={rowClassName}>{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
