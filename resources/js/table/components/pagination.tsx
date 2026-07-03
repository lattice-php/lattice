import type { RefObject } from "react";
import { useT } from "@lattice-php/lattice/i18n";
import type { PaginationType } from "@lattice-php/lattice/types/generated";
import type { TablePagination as TablePaginationData } from "../types";

export function TablePagination({
  pagination,
  currentPage,
  processing,
  mode,
  hasNextPage,
  visiblePages,
  infiniteLoaderRef,
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
  onPage: (page: number) => void;
  onLoadMore: () => void;
}) {
  const { t } = useT("lattice");

  return (
    <div
      data-slot="table-pagination"
      className="flex items-center justify-between gap-3 border-t border-lt-border p-4 text-sm"
    >
      <span>
        {pagination.total == null
          ? t("table.pagination.page", "Page {{page}}", { page: currentPage })
          : t("table.pagination.showing", "Showing {{from}}-{{to}} of {{total}}", {
              from: pagination.from ?? 0,
              to: pagination.to ?? 0,
              total: pagination.total,
            })}
      </span>
      {mode === "infinite" ? (
        <div ref={infiniteLoaderRef} className="flex items-center gap-2">
          {pagination.hasMore ? (
            <button
              type="button"
              data-test="pagination-load-more"
              className="h-9 rounded-lt-sm border border-lt-border px-3 font-medium disabled:opacity-50"
              disabled={processing}
              onClick={onLoadMore}
            >
              {processing
                ? t("table.pagination.loading", "Loading...")
                : t("table.pagination.loadMore", "Load more")}
            </button>
          ) : (
            <span className="text-lt-muted-fg">
              {t("table.pagination.allLoaded", "All rows loaded")}
            </span>
          )}
        </div>
      ) : mode === "simple" ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-test="pagination-previous"
            className="h-9 rounded-lt-sm border border-lt-border px-3 font-medium disabled:opacity-50"
            disabled={processing || currentPage <= 1}
            onClick={() => onPage(currentPage - 1)}
          >
            {t("table.pagination.previous", "Previous")}
          </button>
          <button
            type="button"
            data-test="pagination-next"
            className="h-9 rounded-lt-sm border border-lt-border px-3 font-medium disabled:opacity-50"
            disabled={processing || !hasNextPage}
            onClick={() => onPage(currentPage + 1)}
          >
            {t("table.pagination.next", "Next")}
          </button>
        </div>
      ) : mode === "table" ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-test="pagination-previous"
            className="h-9 rounded-lt-sm border border-lt-border px-3 font-medium disabled:opacity-50"
            disabled={processing || currentPage <= 1}
            onClick={() => onPage(currentPage - 1)}
          >
            {t("table.pagination.previous", "Previous")}
          </button>
          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              data-test={`pagination-page-${pageNumber}`}
              className="inline-flex size-9 items-center justify-center rounded-lt-sm border border-lt-border font-medium disabled:opacity-50"
              disabled={processing || pageNumber === currentPage}
              aria-current={pageNumber === currentPage ? "page" : undefined}
              aria-label={t("table.pagination.page", "Page {{page}}", { page: pageNumber })}
              onClick={() => onPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            data-test="pagination-next"
            className="h-9 rounded-lt-sm border border-lt-border px-3 font-medium disabled:opacity-50"
            disabled={processing || !hasNextPage}
            onClick={() => onPage(currentPage + 1)}
          >
            {t("table.pagination.next", "Next")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
