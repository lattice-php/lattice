import { type ReactNode, useMemo } from "react";
import { useT } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useColumnResizing } from "@lattice-php/lattice/core/hooks/use-column-resizing";
import { useColumnVisibility } from "@lattice-php/lattice/table/hooks/use-column-visibility";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import { Checkbox } from "@lattice-php/lattice/ui/checkbox";
import { Icon } from "@lattice-php/lattice/icons";
import { alignJustifyItems, alignText } from "@lattice-php/lattice/table/lib/align";
import type { TableNode } from "@lattice-php/lattice/table/types";
import { getBulkActions } from "@lattice-php/lattice/table/lib/bulk";
import { getRowActions, getRowKey } from "@lattice-php/lattice/table/lib/payload";
import {
  getQueryParams,
  getTableSizingColumns,
  getTableUtilityTracks,
  getVisiblePages,
} from "@lattice-php/lattice/table/lib/query";
import { useTable } from "@lattice-php/lattice/table/hooks/use-table";
import { useTableSelection } from "@lattice-php/lattice/table/hooks/use-table-selection";
import { BulkBar } from "./bulk-bar";
import { ColumnFilterControl } from "./column-filter-control";
import { ColumnHeader } from "./column-header";
import { ColumnVisibilityMenu } from "./column-visibility-menu";
import { FilterBar, FilterMenu } from "./filter-bar";
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
    query,
    filters,
    tableFilters,
    addFilter,
    updateFilter,
    removeFilter,
    replaceColumnFilters,
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
    () => new Map(columns.map((column) => [column.key, column])),
    [columns],
  );
  const visibilityIdentity = nodeIdentity(node);
  const {
    hasToggleableColumns,
    hasHidden,
    isVisible,
    resetVisibility,
    setColumnVisible,
    toggleableColumns,
    visibleColumns,
  } = useColumnVisibility({
    columns,
    storageKey: visibilityIdentity
      ? `lattice:table-column-visibility:${visibilityIdentity}`
      : undefined,
  });
  const currentPage = pagination.currentPage ?? query.page;
  const lastPage = pagination.lastPage ?? currentPage;
  const mode = pagination.mode ?? "table";
  const visiblePages = getVisiblePages(currentPage, lastPage);
  const hasNextPage = pagination.hasMore ?? currentPage < lastPage;
  const hasActions = rowEntries.some((entry) => entry.actions.length > 0);
  const striped = node.props?.striped === true;
  const hasFilters = visibleColumns.some((column) => column.props.filter != null);
  const filterEntries = filters.map((clause, index) => ({ clause, index }));
  const filterDefinitions = useMemo(
    () => (Array.isArray(node.props?.filters) ? node.props.filters : []),
    [node.props?.filters],
  );
  const hasDedicatedFilters = filterDefinitions.length > 0;
  const hasTrailingUtility = hasActions || hasDedicatedFilters || hasToggleableColumns;
  const sizingColumns = useMemo(() => getTableSizingColumns(visibleColumns), [visibleColumns]);
  const utilityTracks = useMemo(
    () => getTableUtilityTracks(hasTrailingUtility, hasBulkActions),
    [hasTrailingUtility, hasBulkActions],
  );
  const resizingEnabled = node.props?.resizableColumns === true;
  const resizeStorageIdentity = nodeIdentity(node);
  const { getResizeHandleProps, gridTemplateColumns, hasOverrides, resizeRootRef, resetColumns } =
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
    <div data-slot="table" data-lattice-component={node.id} className="relative">
      {hasOverrides && (
        <button
          aria-label={t("table.resetColumnWidths", "Reset column widths")}
          className="absolute right-1 top-1 z-10 hidden rounded-lt-sm p-1 text-lt-muted-fg hover:text-lt-fg md:inline-flex"
          data-test="table-reset-columns"
          onClick={resetColumns}
          title={t("table.resetColumnWidths", "Reset column widths")}
          type="button"
        >
          <Icon name="rotate-ccw" className="size-lt-icon-sm" />
        </button>
      )}
      <div
        data-slot="table-scroll"
        className="overflow-x-auto rounded-lt-sm border border-lt-border"
      >
        <FilterBar
          clauses={filters}
          columnsByKey={columnsByKey}
          indicators={query.tableFilterIndicators}
          processing={processing}
          onRemoveClause={removeFilter}
          onChange={setTableFilter}
          onReset={resetFilters}
        />
        {hasBulkActions && selection.active && (
          <BulkBar
            actions={bulkActions}
            selectedKeys={selection.selectedKeys}
            allMatching={selection.allMatching}
            total={pagination.total ?? undefined}
            query={getQueryParams(query)}
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
        {query.sorts.length > 0 && (
          <SortBar
            columnsByKey={columnsByKey}
            query={query}
            processing={processing}
            onClear={clearSort}
          />
        )}
        <div
          ref={resizeRootRef}
          className="min-w-full text-base"
          role="table"
          style={{ "--lattice-table-columns": gridTemplateColumns } as never}
        >
          <div
            data-slot="table-header"
            className="border-b border-lt-border bg-lt-muted/50"
            role="rowgroup"
          >
            <div
              className="hidden min-w-full md:grid md:grid-cols-[var(--lattice-table-columns)]"
              role="row"
            >
              {hasBulkActions && (
                <div className="flex items-center px-4 py-3" role="columnheader">
                  <Checkbox
                    aria-label={t("table.selectAllRows", "Select all rows")}
                    data-test="select-all"
                    checked={selection.allSelected}
                    onCheckedChange={() => selection.toggleAll()}
                  />
                </div>
              )}
              {visibleColumns.map((column, index) => (
                <ColumnHeader
                  column={column}
                  key={column.key}
                  processing={processing}
                  resizeHandleProps={
                    resizingEnabled ? getResizeHandleProps(sizingColumns[index]) : undefined
                  }
                  sort={sort}
                  query={query}
                />
              ))}
              {hasTrailingUtility && (
                <div
                  className="flex items-center justify-end gap-2 px-4 py-2 align-middle font-semibold text-lt-fg"
                  role="columnheader"
                >
                  {hasDedicatedFilters && (
                    <FilterMenu
                      filters={filterDefinitions}
                      values={tableFilters}
                      processing={processing}
                      onChange={setTableFilter}
                      onSearch={searchFilterOptions}
                    />
                  )}
                  {hasToggleableColumns && (
                    <ColumnVisibilityMenu
                      columns={toggleableColumns}
                      isVisible={isVisible}
                      visibleColumnCount={visibleColumns.length}
                      hasHidden={hasHidden}
                      onToggle={setColumnVisible}
                      onReset={resetVisibility}
                      processing={processing}
                    />
                  )}
                  {hasActions && <span className="sr-only">{node.props?.actionsLabel}</span>}
                </div>
              )}
            </div>
            {hasFilters && (
              <div
                className="hidden min-w-full border-t border-lt-border md:grid md:grid-cols-[var(--lattice-table-columns)]"
                role="row"
              >
                {hasBulkActions && <div className="px-4 py-2" role="cell" />}
                {visibleColumns.map((column) => (
                  <div key={column.key} className="min-w-0 px-2 py-2" role="cell">
                    {column.props.filter != null && (
                      <ColumnFilterControl
                        column={column}
                        clauses={filterEntries.filter((entry) => entry.clause.field === column.key)}
                        processing={processing}
                        onAdd={addFilter}
                        onUpdate={updateFilter}
                        onRemove={removeFilter}
                        onReplace={replaceColumnFilters}
                        onSearch={(query, signal) =>
                          searchFilterOptions(`column:${column.key}`, query, signal)
                        }
                      />
                    )}
                  </div>
                ))}
                {hasTrailingUtility && <div className="px-4 py-2" role="cell" />}
              </div>
            )}
          </div>
          <div role="rowgroup">
            {!hasLoaded ? (
              <div className="p-4 text-lt-muted-fg" role="row">
                <div role="cell">{t("table.loading", "Loading rows...")}</div>
              </div>
            ) : rowEntries.length === 0 ? (
              <div data-slot="table-empty" className="p-8 text-center text-lt-muted-fg" role="row">
                <div role="cell">{node.props?.emptyLabel}</div>
              </div>
            ) : (
              rowEntries.map(({ row, actions, key }) => {
                return (
                  <div
                    key={key}
                    data-slot="table-row"
                    className={`grid grid-cols-1 border-b border-lt-border last:border-b-0 md:grid-cols-[var(--lattice-table-columns)] ${
                      striped ? "odd:bg-lt-muted/30" : ""
                    }`}
                    role="row"
                  >
                    {hasBulkActions && (
                      <div className="flex items-center px-lt-cell-x py-lt-cell-y" role="cell">
                        <Checkbox
                          aria-label={t("table.selectRow", "Select row {{key}}", { key })}
                          data-test={`select-row-${key}`}
                          checked={selection.isSelected(key)}
                          onCheckedChange={() => selection.toggle(key)}
                        />
                      </div>
                    )}
                    {visibleColumns.map((column) => (
                      <div
                        key={column.key}
                        data-slot="table-cell"
                        className={cn(
                          "grid min-w-0 gap-1 overflow-hidden px-lt-cell-x py-lt-cell-y align-middle",
                          alignText(column.props.align),
                          alignJustifyItems(column.props.align),
                        )}
                        role="cell"
                      >
                        <span
                          aria-hidden="true"
                          className="text-xs font-medium text-lt-muted-fg md:hidden"
                        >
                          {column.props.label}
                        </span>
                        <div
                          data-slot="table-cell-content"
                          className="min-w-0 max-w-full overflow-hidden truncate"
                        >
                          <ColumnCell column={column} row={row} />
                        </div>
                      </div>
                    ))}
                    {hasTrailingUtility && (
                      <div
                        className={cn(
                          "items-center justify-start gap-2 px-lt-cell-x py-lt-cell-y md:justify-end",
                          actions.length > 0 ? "flex" : "hidden md:flex",
                        )}
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
