import { type ReactNode, Fragment, useMemo } from "react";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { Renderer, RenderNode } from "@lattice-php/core/renderer";
import { useColumnResizing } from "@lattice-php/ui/use-column-resizing";
import { useColumnVisibility } from "@lattice-php/table/hooks/use-column-visibility";
import { useExpandedRows } from "@lattice-php/table/hooks/use-expanded-rows";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { Checkbox } from "@lattice-php/ui/checkbox";
import { Icon } from "@lattice-php/ui/icons";
import { alignJustifyItems, alignText } from "@lattice-php/table/lib/align";
import type { TableNode } from "@lattice-php/table/types";
import { getBulkActions } from "@lattice-php/table/lib/bulk";
import {
  getPerPageOptions,
  getRowActions,
  getRowDetail,
  getRowKey,
} from "@lattice-php/table/lib/payload";
import {
  getQueryParams,
  getTableSizingColumns,
  getTableUtilityTracks,
  getVisiblePages,
} from "@lattice-php/table/lib/query";
import { useTable } from "@lattice-php/table/hooks/use-table";
import { useTableSelection } from "@lattice-php/table/hooks/use-table-selection";
import { BulkBar } from "./bulk-bar";
import { ColumnFilterControl } from "./column-filter-control";
import { ColumnHeader } from "./column-header";
import { ColumnVisibilityMenu } from "./column-visibility-menu";
import { FilterBar, FilterMenu } from "./filter-bar";
import { TablePagination } from "./pagination";
import { SortBar } from "./sort-bar";
import { TableSearch } from "./table-search";
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
    search,
    addFilter,
    updateFilter,
    removeFilter,
    replaceColumnFilters,
    setTableFilter,
    resetFilters,
    setSearch,
    searchFilterOptions,
    processing,
    hasLoaded,
    infiniteLoaderRef,
    sort,
    clearSort,
    goToPage,
    setPerPage,
    loadMore,
  } = useTable(node);

  const bulkActions = useMemo(
    () => getBulkActions(node.props?.bulkActions),
    [node.props?.bulkActions],
  );
  const hasBulkActions = bulkActions.length > 0;
  const rowEntries = useMemo(
    () =>
      rows.map((row, index) => ({
        row,
        actions: getRowActions(row),
        detail: getRowDetail(row),
        key: getRowKey(row, index),
      })),
    [rows],
  );
  const selection = useTableSelection(rowEntries.map((entry) => entry.key));
  const { isExpanded, toggle: toggleRow } = useExpandedRows();
  const hasExpandable = rowEntries.some((entry) => entry.detail != null);

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
  const perPageOptions = useMemo(
    () => getPerPageOptions(node.props?.perPageOptions),
    [node.props?.perPageOptions],
  );
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
  const hasTrailingUtility = hasActions;
  const toolbarNodes = useMemo(
    () => (Array.isArray(node.props?.toolbar) ? node.props.toolbar : []),
    [node.props?.toolbar],
  );
  const sizingColumns = useMemo(() => getTableSizingColumns(visibleColumns), [visibleColumns]);
  const utilityTracks = useMemo(
    () => getTableUtilityTracks(hasTrailingUtility, hasBulkActions, hasExpandable),
    [hasTrailingUtility, hasBulkActions, hasExpandable],
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
  const hasToolbar =
    node.props?.searchable === true ||
    toolbarNodes.length > 0 ||
    hasDedicatedFilters ||
    hasToggleableColumns ||
    hasOverrides;

  return (
    <div data-slot="table" data-lattice-component={node.id} className="relative min-w-0">
      <div data-slot="table-scroll" className="rounded-lt-sm border border-lt-border">
        {hasToolbar && (
          <div
            data-slot="table-toolbar"
            className="flex items-center gap-2 border-b border-lt-border px-4 py-2"
          >
            {node.props?.searchable && <TableSearch value={search} onSearch={setSearch} />}
            <div className="ms-auto flex items-center gap-1">
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
              {hasOverrides && (
                <button
                  aria-label={t("table.reset-column-widths", "Reset column widths")}
                  className="hidden rounded-lt-sm p-1 text-lt-muted-fg hover:text-lt-fg md:inline-flex"
                  data-test="table-reset-columns"
                  onClick={resetColumns}
                  title={t("table.reset-column-widths", "Reset column widths")}
                  type="button"
                >
                  <Icon name="rotate-ccw" className="size-lt-icon-sm" />
                </button>
              )}
              {toolbarNodes.map((toolbarNode, index) => (
                <RenderNode key={toolbarNode.key ?? toolbarNode.id ?? index} node={toolbarNode} />
              ))}
            </div>
          </div>
        )}
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
        <div data-slot="table-grid-scroll" className="relative overflow-x-auto">
          <div
            ref={resizeRootRef}
            className="min-w-full text-base"
            role="table"
            style={{ "--lattice-table-columns": gridTemplateColumns } as never}
          >
            <div data-slot="table-header" role="rowgroup">
              <div
                className="hidden min-w-full md:grid md:grid-cols-[var(--lattice-table-columns)]"
                role="row"
              >
                {hasExpandable && (
                  <div
                    className={cn(
                      "bg-lt-muted/50 px-2 py-3",
                      !hasFilters && "border-b border-lt-border",
                    )}
                    role="columnheader"
                    aria-hidden="true"
                  />
                )}
                {hasBulkActions && (
                  <div
                    className={cn(
                      "flex items-center bg-lt-muted/50 px-4 py-3",
                      !hasFilters && "border-b border-lt-border",
                    )}
                    role="columnheader"
                  >
                    <Checkbox
                      aria-label={t("table.select-all-rows", "Select all rows")}
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
                    bottomBordered={!hasFilters}
                  />
                ))}
                {hasTrailingUtility && (
                  <div
                    className={cn(
                      "flex items-center justify-end gap-2 bg-lt-muted/50 px-4 py-2 align-middle font-semibold text-lt-fg",
                      !hasFilters && "border-b border-lt-border",
                    )}
                    role="columnheader"
                  >
                    <span className="sr-only">
                      {node.props?.actionsLabel ?? t("table.actions", "Actions")}
                    </span>
                  </div>
                )}
              </div>
              {hasFilters && (
                <div
                  className="hidden min-w-full md:grid md:grid-cols-[var(--lattice-table-columns)]"
                  role="row"
                >
                  {hasExpandable && (
                    <div
                      className="border-t border-b border-lt-border bg-lt-muted/50 px-2 py-2"
                      role="cell"
                    />
                  )}
                  {hasBulkActions && (
                    <div
                      className="border-t border-b border-lt-border bg-lt-muted/50 px-4 py-2"
                      role="cell"
                    />
                  )}
                  {visibleColumns.map((column) => (
                    <div
                      key={column.key}
                      className="min-w-0 border-t border-b border-lt-border bg-lt-muted/50 px-2 py-2"
                      role="cell"
                    >
                      {column.props.filter != null && (
                        <ColumnFilterControl
                          column={column}
                          clauses={filterEntries.filter(
                            (entry) => entry.clause.field === column.key,
                          )}
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
                  {hasTrailingUtility && (
                    <div
                      className="border-t border-b border-lt-border bg-lt-muted/50 px-4 py-2"
                      role="cell"
                    />
                  )}
                </div>
              )}
            </div>
            <div role="rowgroup">
              {!hasLoaded ? (
                <div className="p-4 text-lt-muted-fg" role="row">
                  <div role="cell">{t("table.loading", "Loading rows...")}</div>
                </div>
              ) : rowEntries.length === 0 ? (
                <div
                  data-slot="table-empty"
                  className="p-8 text-center text-lt-muted-fg"
                  role="row"
                >
                  <div role="cell">{node.props?.emptyLabel ?? t("table.empty", "No results")}</div>
                </div>
              ) : (
                rowEntries.map(({ row, actions, detail, key }) => {
                  const expanded = detail != null && isExpanded(key);
                  const detailId = `${nodeIdentity(node) ?? "table"}-row-detail-${key}`;

                  return (
                    <Fragment key={key}>
                      <div
                        data-slot="table-row"
                        className={`grid grid-cols-1 border-b border-lt-border last:border-b-0 md:grid-cols-[var(--lattice-table-columns)] ${
                          striped ? "odd:bg-lt-muted/30" : ""
                        }`}
                        role="row"
                      >
                        {hasExpandable && (
                          <div className="flex items-center px-2 py-lt-cell-y" role="cell">
                            {detail && (
                              <button
                                type="button"
                                data-test={`row-expand-${key}`}
                                aria-expanded={expanded}
                                aria-controls={detailId}
                                aria-label={t("table.row-detail.toggle", "Toggle detail")}
                                className="inline-flex size-6 items-center justify-center rounded-lt-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg"
                                onClick={() => toggleRow(key)}
                              >
                                <Icon
                                  name="chevron-down"
                                  aria-hidden="true"
                                  className={cn(
                                    "size-lt-icon-md transition-transform",
                                    !expanded && "-rotate-90",
                                  )}
                                />
                              </button>
                            )}
                          </div>
                        )}
                        {hasBulkActions && (
                          <div className="flex items-center px-lt-cell-x py-lt-cell-y" role="cell">
                            <Checkbox
                              aria-label={t("table.select-row", "Select row {{key}}", { key })}
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
                              "grid min-w-0 content-center gap-1 overflow-hidden px-lt-cell-x py-lt-cell-y",
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
                              <RenderNode
                                key={action.key ?? action.id ?? actionIndex}
                                node={action}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {expanded && detail && (
                        <div
                          id={detailId}
                          role="region"
                          data-slot="table-row-detail"
                          className="border-b border-lt-border bg-lt-muted/20 px-lt-cell-x py-lt-cell-y"
                        >
                          <Renderer nodes={[detail]} />
                        </div>
                      )}
                    </Fragment>
                  );
                })
              )}
            </div>
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
            perPageOptions={perPageOptions}
            perPageValue={mode === "infinite" ? "infinite" : query.perPage}
            onPerPage={setPerPage}
            onPage={goToPage}
            onLoadMore={loadMore}
          />
        )}
      </div>
    </div>
  );
};

export default TableComponent;
