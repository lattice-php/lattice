import type { RefObject } from "react";
import type { PaginationType } from "@lattice/lattice/generated/enums";
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
  return (
    <div className="flex items-center justify-between gap-3 border-t border-lt-border p-4 text-sm">
      <span>
        {pagination.total === undefined
          ? `Page ${currentPage}`
          : `Showing ${pagination.from ?? 0}-${pagination.to ?? 0} of ${pagination.total}`}
      </span>
      {mode === "infinite" ? (
        <div ref={infiniteLoaderRef} className="flex items-center gap-2">
          {pagination.hasMore ? (
            <button
              type="button"
              className="h-9 rounded-lt-sm border border-lt-border px-3 font-medium disabled:opacity-50"
              disabled={processing}
              onClick={onLoadMore}
            >
              {processing ? "Loading..." : "Load more"}
            </button>
          ) : (
            <span className="text-lt-muted-fg">All rows loaded</span>
          )}
        </div>
      ) : mode === "simple" ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-9 rounded-lt-sm border border-lt-border px-3 font-medium disabled:opacity-50"
            disabled={processing || currentPage <= 1}
            onClick={() => onPage(currentPage - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="h-9 rounded-lt-sm border border-lt-border px-3 font-medium disabled:opacity-50"
            disabled={processing || !hasNextPage}
            onClick={() => onPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      ) : mode === "table" ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-9 rounded-lt-sm border border-lt-border px-3 font-medium disabled:opacity-50"
            disabled={processing || currentPage <= 1}
            onClick={() => onPage(currentPage - 1)}
          >
            Previous
          </button>
          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-lt-sm border border-lt-border font-medium disabled:opacity-50"
              disabled={processing || pageNumber === currentPage}
              aria-current={pageNumber === currentPage ? "page" : undefined}
              aria-label={`Page ${pageNumber}`}
              onClick={() => onPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            className="h-9 rounded-lt-sm border border-lt-border px-3 font-medium disabled:opacity-50"
            disabled={processing || !hasNextPage}
            onClick={() => onPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
