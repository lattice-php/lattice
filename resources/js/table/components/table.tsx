import type { ReactNode } from "react";
import type { TableNode } from "../types";
import { getBulkActions } from "../bulk";
import { getRowActions, getRowKey } from "../payload";
import { getColumnGridTemplate, getQueryParams, getVisiblePages } from "../query";
import { useTable } from "../use-table";
import { useTableSelection } from "../use-table-selection";
import { BulkBar } from "./bulk-bar";
import { ColumnFilterControl } from "./column-filter-control";
import { ColumnHeader } from "./column-header";
import { FilterStackBar } from "./filter-stack-bar";
import { TablePagination } from "./pagination";
import { SortBar } from "./sort-bar";
import { TableActionNode } from "./table-action-node";
import { ColumnCell } from "./table-cell";

const TableComponent = ({ node }: { children?: ReactNode; node: TableNode }) => {
  const {
    columns,
    rows,
    pagination,
    state,
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    processing,
    hasLoaded,
    infiniteLoaderRef,
    sort,
    clearSort,
    goToPage,
    loadMore,
  } = useTable(node);

  const bulkActions = getBulkActions(node.props?.bulkActions);
  const hasBulkActions = bulkActions.length > 0;
  const rowEntries = rows.map((row, index) => ({
    row,
    actions: getRowActions(row),
    key: getRowKey(row, index),
  }));
  const selection = useTableSelection(rowEntries.map((entry) => entry.key));

  const currentPage = pagination.currentPage ?? state.page;
  const lastPage = pagination.lastPage ?? currentPage;
  const mode = pagination.mode ?? "table";
  const visiblePages = getVisiblePages(currentPage, lastPage);
  const hasNextPage = pagination.hasMore ?? currentPage < lastPage;
  const hasActions = rowEntries.some((entry) => entry.actions.length > 0);
  const striped = node.props?.striped === true;
  const hasFilters = columns.some((column) => column.filter?.enabled);
  const filterEntries = filters.map((clause, index) => ({ clause, index }));
  const gridTemplateColumns = getColumnGridTemplate(columns, hasActions, hasBulkActions);

  return (
    <div
      data-lattice-component={node.id}
      className="overflow-x-auto rounded-lt-sm border border-lt-border"
    >
      {hasBulkActions && selection.active && (
        <BulkBar
          actions={bulkActions}
          selectedKeys={selection.selectedKeys}
          allMatching={selection.allMatching}
          total={pagination.total}
          query={getQueryParams(state)}
          canSelectAllMatching={
            selection.allVisibleSelected &&
            !selection.allMatching &&
            pagination.total !== undefined &&
            pagination.total > selection.selectedKeys.length
          }
          onSelectAllMatching={selection.selectAllMatching}
          onCompleted={selection.clear}
        />
      )}
      {filters.length > 0 && (
        <FilterStackBar
          filters={filters}
          columns={columns}
          processing={processing}
          onRemove={removeFilter}
        />
      )}
      {state.sorts.length > 0 && (
        <SortBar columns={columns} state={state} processing={processing} onClear={clearSort} />
      )}
      <div className="w-max min-w-full text-sm" role="table">
        <div className="border-b border-lt-border bg-lt-muted/50" role="rowgroup">
          <div
            className="hidden min-w-full md:grid md:grid-cols-[var(--lattice-table-columns)]"
            role="row"
            style={{ "--lattice-table-columns": gridTemplateColumns } as never}
          >
            {hasBulkActions && (
              <div className="flex items-center px-4 py-3" role="columnheader">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={selection.allSelected}
                  onChange={selection.toggleAll}
                />
              </div>
            )}
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
          {hasFilters && (
            <div
              className="hidden min-w-full border-t border-lt-border md:grid md:grid-cols-[var(--lattice-table-columns)]"
              role="row"
              style={{ "--lattice-table-columns": gridTemplateColumns } as never}
            >
              {hasBulkActions && <div className="px-4 py-2" role="cell" />}
              {columns.map((column) => (
                <div key={column.key} className="px-4 py-2" role="cell">
                  {column.filter?.enabled && (
                    <ColumnFilterControl
                      column={column}
                      clauses={filterEntries.filter((entry) => entry.clause.field === column.key)}
                      processing={processing}
                      onAdd={addFilter}
                      onUpdate={updateFilter}
                      onRemove={removeFilter}
                    />
                  )}
                </div>
              ))}
              {hasActions && <div className="px-4 py-2" role="cell" />}
            </div>
          )}
        </div>
        <div role="rowgroup">
          {!hasLoaded ? (
            <div className="p-4 text-lt-muted-fg" role="row">
              <div role="cell">Loading rows...</div>
            </div>
          ) : (
            rowEntries.map(({ row, actions, key }) => {
              return (
                <div
                  key={key}
                  className={`grid grid-cols-1 border-b border-lt-border last:border-b-0 md:grid-cols-[var(--lattice-table-columns)] ${
                    striped ? "odd:bg-lt-muted/30" : ""
                  }`}
                  role="row"
                  style={{ "--lattice-table-columns": gridTemplateColumns } as never}
                >
                  {hasBulkActions && (
                    <div className="flex items-center p-4" role="cell">
                      <input
                        type="checkbox"
                        aria-label={`Select row ${key}`}
                        checked={selection.isSelected(key)}
                        onChange={() => selection.toggle(key)}
                      />
                    </div>
                  )}
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
