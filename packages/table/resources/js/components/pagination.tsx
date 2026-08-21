import type { RefObject } from "react";
import { Button } from "@lattice-php/ui/components/button/button";
import { DataTableFooter, DataTablePagination } from "@lattice-php/table/primitives/data-table";
import { NativeSelect } from "@lattice-php/ui/primitives/native-select";
import { useT } from "@lattice-php/ui/i18n";
import type { PaginationType } from "../generated";
import type { PerPageOption } from "@lattice-php/table/lib/payload";
import type { TablePagination as TablePaginationData } from "@lattice-php/table/types";

export function TablePagination({
  pagination,
  currentPage,
  processing,
  mode,
  hasNextPage,
  visiblePages,
  infiniteLoaderRef,
  perPageOptions,
  perPageValue,
  onPerPage,
  onPage,
  onLoadMore,
}: {
  pagination: TablePaginationData;
  currentPage: number;
  processing: boolean;
  mode: PaginationType;
  hasNextPage: boolean;
  visiblePages: number[];
  infiniteLoaderRef: RefObject<HTMLDivElement | null>;
  perPageOptions: PerPageOption[];
  perPageValue: PerPageOption;
  onPerPage: (option: PerPageOption) => void;
  onPage: (page: number) => void;
  onLoadMore: () => void;
}) {
  const { t } = useT("lattice");

  return (
    <DataTableFooter>
      <div className="flex items-center gap-4">
        <span>
          {pagination.total == null
            ? t("table.pagination.page", "Page {{page}}", { page: currentPage })
            : t("table.pagination.showing", "Showing {{from}}-{{to}} of {{total}}", {
                from: pagination.from ?? 0,
                to: pagination.to ?? 0,
                total: pagination.total,
              })}
        </span>
        {perPageOptions.length > 0 && mode !== "none" && (
          <NativeSelect
            aria-label={t("table.pagination.per-page", "Rows per page")}
            className="w-fit"
            data-test="pagination-per-page"
            disabled={processing}
            value={String(perPageValue)}
            onChange={(event) =>
              onPerPage(event.target.value === "infinite" ? "infinite" : Number(event.target.value))
            }
          >
            {perPageOptions.map((option) => (
              <option key={String(option)} value={String(option)}>
                {option === "infinite" ? t("table.pagination.infinite", "Infinite") : option}
              </option>
            ))}
          </NativeSelect>
        )}
      </div>
      {mode === "infinite" ? (
        <div ref={infiniteLoaderRef} className="flex items-center gap-2">
          {pagination.hasMore ? (
            <Button
              emphasis="outline"
              data-test="pagination-load-more"
              disabled={processing}
              onClick={onLoadMore}
            >
              {processing
                ? t("table.pagination.loading", "Loading...")
                : t("table.pagination.load-more", "Load more")}
            </Button>
          ) : (
            <span className="text-lt-muted-fg">
              {t("table.pagination.all-loaded", "All rows loaded")}
            </span>
          )}
        </div>
      ) : mode === "simple" || mode === "table" ? (
        <DataTablePagination
          disabled={processing}
          hasNextPage={hasNextPage}
          labels={{
            next: t("table.pagination.next", "Next"),
            page: (page) => t("table.pagination.page", "Page {{page}}", { page }),
            previous: t("table.pagination.previous", "Previous"),
          }}
          onPageChange={onPage}
          page={currentPage}
          pages={mode === "table" ? visiblePages : undefined}
        />
      ) : null}
    </DataTableFooter>
  );
}
