import { type ReactNode, useMemo } from "react";
import { useT } from "@lattice-php/lattice/i18n";
import { useColumnResizing } from "@lattice-php/lattice/core/use-column-resizing";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import { Icon } from "@lattice-php/lattice/icons";
import type { TableNode } from "../types";
import { getBulkActions } from "../bulk";
import { flattenColumns, getRowActions, getRowKey } from "../payload";
import {
  getQueryParams,
  getTableSizingColumns,
  getTableUtilityTracks,
  getVisiblePages,
} from "../query";
import { useTable } from "../use-table";
import { useTableSelection } from "../use-table-selection";
import { BulkBar } from "./bulk-bar";
import { ColumnFilterControl } from "./column-filter-control";
import { ColumnHeader } from "./column-header";
import { FilterBar } from "./filter-bar";
import { FilterStackBar } from "./filter-stack-bar";
import { TablePagination } from "./pagination";
import { SortBar } from "./sort-bar";
import { TableActionNode } from "./table-action-node";
import { ColumnCell } from "./table-cell";

const TableComponent = ({ node }: { children?: ReactNode; node: TableNode }) => {
  const { t } = useT("lattice");
  const {
    columns,
    rows,
    pagination,
    state,
    filters,
    tableFilters,
    addFilter,
    updateFilter,
    removeFilter,
    setTableFilter,
    resetFilters,
    searchFilterOptions,
    processing,
    hasLoaded,
    infiniteLoaderRef,
    sort,
    clearSort,
    goToPage,
    loadMore,
  } = useTable(node);

  const bulkActions = useMemo(
    () => getBulkActions(node.props?.bulkActions),
    [node.props?.bulkActions],
  );
  const hasBulkActions = bulkActions.length > 0;
  const rowEntries = useMemo(
    () =>
      rows.map((row, index) => ({ row, actions: getRowActions(row), key: getRowKey(row, index) })),
    [rows],
  );
  const selection = useTableSelection(rowEntries.map((entry) => entry.key));

  const columnsByKey = useMemo(
    () => new Map(flattenColumns(columns).map((column) => [column.key, column])),
    [columns],
  );
  const currentPage = pagination.currentPage ?? state.page;
  const lastPage = pagination.lastPage ?? currentPage;
  const mode = pagination.mode ?? "table";
  const visiblePages = getVisiblePages(currentPage, lastPage);
  const hasNextPage = pagination.hasMore ?? currentPage < lastPage;
  const hasActions = rowEntries.some((entry) => entry.actions.length > 0);
  const striped = node.props?.striped === true;
  const hasFilters = columns.some((column) => column.filter?.enabled);
  const filterEntries = filters.map((clause, index) => ({ clause, index }));
  const filterDefinitions = useMemo(
    () => (Array.isArray(node.props?.filters) ? node.props.filters : []),
    [node.props?.filters],
  );
  const hasActiveFilters = filters.length > 0 || Object.keys(tableFilters).length > 0;
  const sizingColumns = useMemo(() => getTableSizingColumns(columns), [columns]);
  const utilityTracks = useMemo(
    () => getTableUtilityTracks(hasActions, hasBulkActions),
    [hasActions, hasBulkActions],
  );
  const resizingEnabled = node.props?.resizableColumns === true;
  const resizeStorageIdentity = nodeIdentity(node);
  const { getResizeHandleProps, gridTemplateColumns, hasOverrides, resetColumns } =
    useColumnResizing({
      columns: sizingColumns,
      enabled: resizingEnabled,
      leadingTracks: utilityTracks.leadingTracks,
      showIndicator: node.props?.resizeIndicator === true,
      storageKey:
        resizingEnabled && resizeStorageIdentity
          ? `lattice:table-columns:${resizeStorageIdentity}`
          : undefined,
      trailingTracks: utilityTracks.trailingTracks,
    });

  return (
    <div data-lattice-component={node.id} className="relative">
      {hasOverrides && (
        <button
          aria-label={t("a11y.resetColumnWidths", "Reset column widths")}
          className="absolute right-1 top-1 z-10 hidden rounded-lt-sm p-1 text-lt-muted-fg hover:text-lt-fg md:inline-flex"
          data-test="table-reset-columns"
          onClick={resetColumns}
          title={t("a11y.resetColumnWidths", "Reset column widths")}
          type="button"
        >
          <Icon name="rotate-ccw" className="size-lt-icon-sm" />
        </button>
      )}
      <div className="overflow-x-auto rounded-lt-sm border border-lt-border">
        {filterDefinitions.length > 0 && (
          <FilterBar
            filters={filterDefinitions}
            values={tableFilters}
            processing={processing}
            hasActiveFilters={hasActiveFilters}
            onChange={setTableFilter}
            onReset={resetFilters}
            onSearch={searchFilterOptions}
          />
        )}
        {hasBulkActions && selection.active && (
          <BulkBar
            actions={bulkActions}
            selectedKeys={selection.selectedKeys}
            allMatching={selection.allMatching}
            total={pagination.total ?? undefined}
            query={getQueryParams(state)}
            canSelectAllMatching={
              selection.allVisibleSelected &&
              !selection.allMatching &&
              pagination.total != null &&
              pagination.total > selection.selectedKeys.length
            }
            onSelectAllMatching={selection.selectAllMatching}
            onCompleted={selection.clear}
          />
        )}
        {filters.length > 0 && (
          <FilterStackBar
            filters={filters}
            columnsByKey={columnsByKey}
            processing={processing}
            onRemove={removeFilter}
          />
        )}
        {state.sorts.length > 0 && (
          <SortBar
            columnsByKey={columnsByKey}
            state={state}
            processing={processing}
            onClear={clearSort}
          />
        )}
        <div className="min-w-full text-sm" role="table">
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
                    aria-label={t("a11y.selectAllRows", "Select all rows")}
                    data-test="select-all"
                    checked={selection.allSelected}
                    onChange={selection.toggleAll}
                  />
                </div>
              )}
              {columns.map((column, index) => (
                <ColumnHeader
                  column={column}
                  key={column.key}
                  processing={processing}
                  resizeHandleProps={
                    resizingEnabled ? getResizeHandleProps(sizingColumns[index]) : undefined
                  }
                  sort={sort}
                  state={state}
                />
              ))}
              {hasActions && (
                <div
                  className="px-4 py-3 text-right align-middle font-medium text-lt-muted-fg"
                  role="columnheader"
                >
                  <span className="sr-only">{node.props?.actionsLabel}</span>
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
                  <div key={column.key} className="min-w-0 px-2 py-2" role="cell">
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
                <div role="cell">{t("table.loading", "Loading rows...")}</div>
              </div>
            ) : rowEntries.length === 0 ? (
              <div className="p-8 text-center text-lt-muted-fg" role="row">
                <div role="cell">{node.props?.emptyLabel}</div>
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
                          aria-label={t("a11y.selectRow", "Select row {{key}}", { key })}
                          data-test={`select-row-${key}`}
                          checked={selection.isSelected(key)}
                          onChange={() => selection.toggle(key)}
                        />
                      </div>
                    )}
                    {columns.map((column) => (
                      <div
                        key={column.key}
                        className="grid min-w-0 gap-1 p-4 align-middle"
                        role="cell"
                      >
                        <span
                          aria-hidden="true"
                          className="text-xs font-medium text-lt-muted-fg md:hidden"
                        >
                          {column.label}
                        </span>
                        <div className="min-w-0 truncate">
                          <ColumnCell column={column} row={row} />
                        </div>
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
    </div>
  );
};

export default TableComponent;
