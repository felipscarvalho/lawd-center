import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/layout/card";

export interface RankingItem {
  id: string | number;
  label: ReactNode;
  /** Leva ao detalhe (ex.: do projeto) */
  href?: string;
  value: number;
}

interface RankingCardProps {
  title: string;
  description: string;
  items: RankingItem[];
  /** Como mostrar o número (ex.: "3 pessoas") */
  formatValue: (value: number) => string;
  emptyMessage: string;
}

/** Lista ordenada de itens com um número (no lugar dos gráficos, por enquanto) */
export function RankingCard({ title, description, items, formatValue, emptyMessage }: RankingCardProps) {
  return (
    <Card className="flex min-w-0 flex-col">
      <header className="flex flex-col gap-0.5 border-b border-secondary px-5 py-4">
        <h2 className="text-md font-semibold text-primary">{title}</h2>
        <p className="text-sm text-tertiary">{description}</p>
      </header>

      {items.length === 0 ? (
        <p className="px-5 py-6 text-sm text-tertiary">{emptyMessage}</p>
      ) : (
        <ol className="flex flex-col divide-y divide-secondary">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-center gap-3 px-5 py-3">
              <span className="w-5 shrink-0 text-sm text-quaternary">{index + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-primary">
                {item.href ? (
                  <Link href={item.href} className="outline-focus-ring hover:underline focus-visible:outline-2">
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </span>
              <span className="shrink-0 text-sm whitespace-nowrap text-secondary">{formatValue(item.value)}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
