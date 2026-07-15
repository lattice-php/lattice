import type { RefObject } from "react";
import { Button } from "@lattice-php/lattice/ui/button";
import { useT } from "@lattice-php/lattice/i18n";
import type { PaginationType } from "@lattice-php/lattice/types/generated";
import type { TablePagination as TablePaginationData } from "@lattice-php/lattice/table/types";

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
            <Button
              variant="outline"
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
      ) : mode === "simple" ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            data-test="pagination-previous"
            disabled={processing || currentPage <= 1}
            onClick={() => onPage(currentPage - 1)}
          >
            {t("table.pagination.previous", "Previous")}
          </Button>
          <Button
            variant="outline"
            data-test="pagination-next"
            disabled={processing || !hasNextPage}
            onClick={() => onPage(currentPage + 1)}
          >
            {t("table.pagination.next", "Next")}
          </Button>
        </div>
      ) : mode === "table" ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            data-test="pagination-previous"
            disabled={processing || currentPage <= 1}
            onClick={() => onPage(currentPage - 1)}
          >
            {t("table.pagination.previous", "Previous")}
          </Button>
          {visiblePages.map((pageNumber) => (
            <Button
              key={pageNumber}
              variant="outline"
              size="icon"
              data-test={`pagination-page-${pageNumber}`}
              disabled={processing || pageNumber === currentPage}
              aria-current={pageNumber === currentPage ? "page" : undefined}
              aria-label={t("table.pagination.page", "Page {{page}}", { page: pageNumber })}
              onClick={() => onPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <Button
            variant="outline"
            data-test="pagination-next"
            disabled={processing || !hasNextPage}
            onClick={() => onPage(currentPage + 1)}
          >
            {t("table.pagination.next", "Next")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
