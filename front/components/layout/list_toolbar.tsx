"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, FilterLines, SearchLg } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";

interface ListToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  searchPlaceholder: string;
  /** Campos do painel de filtros (ex.: selects). Sem eles, só a busca aparece */
  filters?: ReactNode;
  /** Quantos filtros estão diferentes do padrão; aparece no botão e libera "Limpar filtros" */
  activeFilters?: number;
  onClearFilters?: () => void;
}

/**
 * Barra de listas: botão "Filtros" à esquerda, que abre um painel com os filtros da página,
 * e busca no canto direito.
 */
export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  activeFilters = 0,
  onClearFilters,
}: ListToolbarProps) {
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cx(
          "flex flex-col-reverse gap-3 sm:flex-row sm:items-center",
          filters ? "sm:justify-between" : "sm:justify-end",
        )}
      >
        {filters && (
          <Button
            color="secondary"
            iconLeading={FilterLines}
            iconTrailing={ChevronDown}
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={() => setIsOpen((open) => !open)}
            className={cx(
              "self-start [&>svg:last-child]:transition-transform",
              isOpen && "[&>svg:last-child]:rotate-180",
            )}
          >
            {activeFilters > 0 ? `Filtros (${activeFilters})` : "Filtros"}
          </Button>
        )}

        <div className="w-full sm:w-80">
          <Input
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            icon={SearchLg}
            value={search}
            onChange={onSearchChange}
          />
        </div>
      </div>

      {filters && isOpen && (
        <div id={panelId} className="glass flex flex-col gap-3 rounded-xl p-4 ring-1 ring-secondary">
          <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">{filters}</div>

          {activeFilters > 0 && onClearFilters && (
            <Button color="link-gray" size="sm" className="self-start" onClick={onClearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
