"use client";

import { ArrowLeft, ArrowRight } from "@untitledui/icons";
import { Pagination } from "@/components/application/pagination/pagination-base";
import { Button } from "@/components/base/buttons/button";
import type { PaginationMeta } from "@/lib/api";
import { cx } from "@/utils/cx";

interface ListPaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

/** Rodapé de paginação das tabelas: intervalo exibido, páginas e anterior/próxima. Some com uma página só */
export function ListPagination({ meta, onPageChange }: ListPaginationProps) {
  if (meta.lastPage <= 1) return null;

  const first = (meta.currentPage - 1) * meta.perPage + 1;
  const last = Math.min(meta.currentPage * meta.perPage, meta.total);

  return (
    <Pagination.Root
      page={meta.currentPage}
      total={meta.lastPage}
      onPageChange={onPageChange}
      className="flex items-center justify-between gap-3 border-t border-secondary px-4 py-3 md:px-6"
    >
      <p className="text-sm text-tertiary">
        <span className="font-medium text-secondary">
          {first}–{last}
        </span>{" "}
        de <span className="font-medium text-secondary">{meta.total}</span>
      </p>

      <nav aria-label="Paginação" className="flex items-center gap-3">
        <Pagination.PrevTrigger>
          {({ isDisabled, onClick }) => (
            <Button
              color="secondary"
              size="sm"
              iconLeading={ArrowLeft}
              aria-label="Página anterior"
              isDisabled={isDisabled}
              onClick={onClick}
            />
          )}
        </Pagination.PrevTrigger>

        <Pagination.Context>
          {({ pages, currentPage, total }) => (
            <>
              <div className="hidden gap-0.5 md:flex">
                {pages.map((page) =>
                  page.type === "page" ? (
                    <Pagination.Item
                      key={page.value}
                      value={page.value}
                      isCurrent={page.isCurrent}
                      ariaLabel={`Página ${page.value}`}
                      className={({ isSelected }) =>
                        cx(
                          "flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm font-medium text-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2",
                          isSelected && "bg-primary_hover text-secondary",
                        )
                      }
                    >
                      {page.value}
                    </Pagination.Item>
                  ) : (
                    <Pagination.Ellipsis
                      key={page.key}
                      className="flex size-9 items-center justify-center text-sm text-tertiary"
                    >
                      …
                    </Pagination.Ellipsis>
                  ),
                )}
              </div>

              <span className="text-sm whitespace-nowrap text-secondary md:hidden">
                {currentPage} / {total}
              </span>
            </>
          )}
        </Pagination.Context>

        <Pagination.NextTrigger>
          {({ isDisabled, onClick }) => (
            <Button
              color="secondary"
              size="sm"
              iconLeading={ArrowRight}
              aria-label="Próxima página"
              isDisabled={isDisabled}
              onClick={onClick}
            />
          )}
        </Pagination.NextTrigger>
      </nav>
    </Pagination.Root>
  );
}
