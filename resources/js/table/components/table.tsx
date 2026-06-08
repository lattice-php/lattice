import type { RendererComponent } from "@lattice/core/types";
import { getRowKey, getRowMeta } from "../payload";
import { getColumnGridTemplate, getVisiblePages } from "../query";
import { useTable } from "../use-table";
import { ColumnHeader } from "./column-header";
import { FilterBar } from "./filter-bar";
import { TablePagination } from "./pagination";
import { SortBar } from "./sort-bar";
import { TableActionNode } from "./table-action-node";
import { ColumnCell } from "./table-cell";

const TableComponent: RendererComponent<"table"> = ({ node }) => {
  const {
    columns,
    interactiveColumns,
    rows,
    rowMetadata,
    pagination,
    state,
    filters,
    setFilters,
    processing,
    hasLoaded,
    infiniteLoaderRef,
    sort,
    clearSort,
    applyFilters,
    goToPage,
    loadMore,
  } = useTable(node);

  const currentPage = pagination.currentPage ?? state.page;
  const lastPage = pagination.lastPage ?? currentPage;
  const mode = pagination.mode ?? "table";
  const visiblePages = getVisiblePages(currentPage, lastPage);
  const hasNextPage = pagination.hasMore ?? currentPage < lastPage;
  const hasActions = rowMetadata.some((metadata) => (metadata.actions?.length ?? 0) > 0);
  const gridTemplateColumns = getColumnGridTemplate(columns, hasActions);
  const filterableColumns = interactiveColumns.filter((column) => column.filter?.enabled);

  return (
    <div
      data-lattice-component={node.id}
      className="overflow-hidden rounded-lt-sm border border-lt-border"
    >
      {filterableColumns.length > 0 && (
        <FilterBar
          columns={filterableColumns}
          filters={filters}
          setFilters={setFilters}
          processing={processing}
          onApply={applyFilters}
        />
      )}
      {state.sorts.length > 0 && (
        <SortBar columns={columns} state={state} processing={processing} onClear={clearSort} />
      )}
      <div className="w-full text-sm" role="table">
        <div className="border-b border-lt-border bg-lt-muted/50" role="rowgroup">
          <div
            className="hidden min-w-full md:grid md:grid-cols-[var(--lattice-table-columns)]"
            role="row"
            style={{ "--lattice-table-columns": gridTemplateColumns } as never}
          >
            {columns.map((column) => (
              <ColumnHeader
                column={column}
                key={column.key}
                processing={processing}
                sort={sort}
                state={state}
              />
            ))}
            {hasActions && (
              <div
                className="px-4 py-3 text-right align-middle font-medium text-lt-muted-fg"
                role="columnheader"
              >
                Actions
              </div>
            )}
          </div>
        </div>
        <div role="rowgroup">
          {!hasLoaded ? (
            <div className="p-4 text-lt-muted-fg" role="row">
              <div role="cell">Loading rows...</div>
            </div>
          ) : (
            rows.map((row, index) => {
              const metadata = getRowMeta(rowMetadata, row, index);
              const actions = metadata.actions ?? [];

              return (
                <div
                  key={metadata.key ?? getRowKey(row, index)}
                  className="grid grid-cols-1 border-b border-lt-border last:border-b-0 md:grid-cols-[var(--lattice-table-columns)]"
                  role="row"
                  style={{ "--lattice-table-columns": gridTemplateColumns } as never}
                >
                  {columns.map((column) => (
                    <div key={column.key} className="grid gap-1 p-4 align-middle" role="cell">
                      <span
                        aria-hidden="true"
                        className="text-xs font-medium text-lt-muted-fg md:hidden"
                      >
                        {column.label}
                      </span>
                      <ColumnCell column={column} row={row} />
                    </div>
                  ))}
                  {actions.length > 0 && (
                    <div
                      className="flex items-center justify-start gap-2 p-4 md:justify-end"
                      role="cell"
                    >
                      {actions.map((action, actionIndex) => (
                        <TableActionNode
                          key={action.key ?? action.id ?? actionIndex}
                          node={action}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      {hasLoaded && (
        <TablePagination
          pagination={pagination}
          currentPage={currentPage}
          processing={processing}
          mode={mode}
          hasNextPage={hasNextPage}
          visiblePages={visiblePages}
          infiniteLoaderRef={infiniteLoaderRef}
          onPage={goToPage}
          onLoadMore={loadMore}
        />
      )}
    </div>
  );
};

export default TableComponent;
