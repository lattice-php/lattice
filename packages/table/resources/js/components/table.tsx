import { type MouseEvent, type ReactNode, Fragment, useMemo } from "react";
import { useT } from "@lattice-php/ui/i18n";
import { useNavigation } from "@lattice-php/ui/navigation";
import { Renderer, RenderNode } from "@lattice-php/core/renderer";
import { useColumnResizing } from "@lattice-php/ui/lib/use-column-resizing";
import { useColumnPinning } from "@lattice-php/table/hooks/use-column-pinning";
import { useColumnVisibility } from "@lattice-php/table/hooks/use-column-visibility";
import { useExpandedRows } from "@lattice-php/table/hooks/use-expanded-rows";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { Checkbox } from "@lattice-php/form/components/checkbox/checkbox";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableFilterCell,
  DataTableGrid,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableHeaderRow,
  DataTableLoading,
  DataTableRow,
  DataTableRowDetail,
  DataTableRowToggle,
  DataTableToolbar,
  dataTableUtilityTracks,
  type DataTablePinBoundary,
} from "@lattice-php/table/primitives/data-table";
import { Icon } from "@lattice-php/ui/icons";
import type { TableNode } from "@lattice-php/table/types";
import { getBulkActionNodes } from "@lattice-php/table/lib/bulk";
import {
  getPerPageOptions,
  getRowActions,
  getRowDetail,
  getRowKey,
  getRowUrl,
} from "@lattice-php/table/lib/payload";
import {
  getQueryParams,
  getTableSizingColumns,
  getVisiblePages,
  orderPinnedColumns,
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

function dataColumnPinBoundary(
  pin: "left" | "right" | null,
  index: number,
  leftBoundaryColumnIndex: number,
  fillerIndex: number,
): DataTablePinBoundary | undefined {
  if (pin === "left" && index === leftBoundaryColumnIndex) {
    return "end";
  }

  if (pin === "right" && index === fillerIndex) {
    return "start";
  }

  return undefined;
}

const ROW_LINK_INTERACTIVE_SELECTOR =
  "a, button, input, label, select, textarea, [role=menuitem], [role=checkbox]";

function isRowLinkInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(ROW_LINK_INTERACTIVE_SELECTOR) != null;
}

function handleRowClick(
  event: MouseEvent<HTMLDivElement>,
  url: string | null,
  visit: (url: string) => void,
): void {
  if (!url || isRowLinkInteractiveTarget(event.target)) {
    return;
  }

  if (event.metaKey || event.ctrlKey) {
    window.open(url, "_blank");
    return;
  }

  visit(url);
}

function handleRowAuxClick(event: MouseEvent<HTMLDivElement>, url: string | null): void {
  if (!url || event.button !== 1 || isRowLinkInteractiveTarget(event.target)) {
    return;
  }

  window.open(url, "_blank");
}

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
    () => getBulkActionNodes(node.props?.bulkActions),
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
        url: getRowUrl(row),
      })),
    [rows],
  );
  const { visit } = useNavigation();
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
  const pinningEnabled = node.props?.pinnableColumns === true;
  const pinningIdentity = nodeIdentity(node);
  const { hasPinOverrides, pinFor, resetPins, setColumnPin } = useColumnPinning({
    columns,
    storageKey:
      pinningEnabled && pinningIdentity ? `lattice:table-pins:${pinningIdentity}` : undefined,
  });
  const orderedColumns = useMemo(
    () => orderPinnedColumns(visibleColumns, pinFor),
    [visibleColumns, pinFor],
  );
  const hasPinned = orderedColumns.some((column) => pinFor(column) != null);
  const fillerIndex = orderedColumns.findIndex((column) => pinFor(column) === "right");
  const columnsMenuColumns = useMemo(() => {
    if (!pinningEnabled) {
      return toggleableColumns;
    }

    const merged = new Map(visibleColumns.map((column) => [column.key, column]));

    for (const column of toggleableColumns) {
      if (!merged.has(column.key)) {
        merged.set(column.key, column);
      }
    }

    return [...merged.values()];
  }, [pinningEnabled, toggleableColumns, visibleColumns]);
  const resetColumnsMenu = () => {
    resetVisibility();
    resetPins();
  };
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
  const leftBoundaryColumnIndex = hasPinned
    ? orderedColumns.reduce((acc, column, index) => (pinFor(column) === "left" ? index : acc), -1)
    : -1;
  const leftBoundaryOwner = !hasPinned
    ? null
    : leftBoundaryColumnIndex !== -1
      ? "column"
      : hasBulkActions
        ? "selection"
        : hasExpandable
          ? "expander"
          : null;
  const rightBoundaryOwner = !hasPinned
    ? null
    : fillerIndex !== -1
      ? "column"
      : hasTrailingUtility
        ? "actions"
        : null;
  const expanderPinBoundary: DataTablePinBoundary | undefined =
    leftBoundaryOwner === "expander" ? "end" : undefined;
  const selectionPinBoundary: DataTablePinBoundary | undefined =
    leftBoundaryOwner === "selection" ? "end" : undefined;
  const actionsPinBoundary: DataTablePinBoundary | undefined =
    rightBoundaryOwner === "actions" ? "start" : undefined;
  const toolbarNodes = useMemo(
    () => (Array.isArray(node.props?.toolbar) ? node.props.toolbar : []),
    [node.props?.toolbar],
  );
  const sizingColumns = useMemo(
    () => getTableSizingColumns(orderedColumns, pinFor),
    [orderedColumns, pinFor],
  );
  const utilityTracks = useMemo(
    () =>
      dataTableUtilityTracks({
        actions: hasTrailingUtility,
        expander: hasExpandable,
        selection: hasBulkActions,
      }),
    [hasTrailingUtility, hasBulkActions, hasExpandable],
  );
  const resizingEnabled = node.props?.resizableColumns === true;
  const resizeStorageIdentity = nodeIdentity(node);
  const {
    getResizeHandleProps,
    gridTemplateColumns,
    hasOverrides,
    pinOffsetVars,
    resizeRootRef,
    resetColumns,
  } = useColumnResizing({
    columns: sizingColumns,
    enabled: resizingEnabled,
    hasActions: hasTrailingUtility,
    hasExpander: hasExpandable,
    hasSelection: hasBulkActions,
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
    hasOverrides ||
    pinningEnabled;

  const utilityPin = hasPinned ? { left: "left" as const, right: "right" as const } : null;

  return (
    <DataTable data-test={node.id}>
      {hasToolbar && (
        <DataTableToolbar
          start={node.props?.searchable && <TableSearch value={search} onSearch={setSearch} />}
          end={
            <>
              {hasDedicatedFilters && (
                <FilterMenu
                  filters={filterDefinitions}
                  values={tableFilters}
                  processing={processing}
                  onChange={setTableFilter}
                  onSearch={searchFilterOptions}
                />
              )}
              {(hasToggleableColumns || pinningEnabled) && (
                <ColumnVisibilityMenu
                  columns={columnsMenuColumns}
                  isVisible={isVisible}
                  visibleColumnCount={visibleColumns.length}
                  hasHidden={hasHidden}
                  hasPinOverrides={hasPinOverrides}
                  onToggle={setColumnVisible}
                  onReset={resetColumnsMenu}
                  onSetPin={setColumnPin}
                  pinFor={pinFor}
                  pinningEnabled={pinningEnabled}
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
            </>
          }
        />
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
      <DataTableGrid
        ref={resizeRootRef}
        columns={gridTemplateColumns}
        pinned={hasPinned}
        style={pinOffsetVars}
      >
        <DataTableHeader>
          <DataTableHeaderRow>
            {hasExpandable && (
              <DataTableHeaderCell
                kind="expander"
                bottomBordered={!hasFilters}
                pinBoundary={expanderPinBoundary}
                pinned={utilityPin?.left}
              />
            )}
            {hasBulkActions && (
              <DataTableHeaderCell
                kind="selection"
                bottomBordered={!hasFilters}
                pinBoundary={selectionPinBoundary}
                pinned={utilityPin?.left}
              >
                <Checkbox
                  aria-label={t("table.select-all-rows", "Select all rows")}
                  data-test="select-all"
                  checked={selection.allSelected}
                  onCheckedChange={() => selection.toggleAll()}
                />
              </DataTableHeaderCell>
            )}
            {orderedColumns.map((column, index) => {
              const pin = hasPinned ? pinFor(column) : null;

              return (
                <Fragment key={column.key}>
                  {hasPinned && index === fillerIndex && (
                    <DataTableHeaderCell kind="filler" bottomBordered={!hasFilters} />
                  )}
                  <ColumnHeader
                    column={column}
                    processing={processing}
                    pinBoundary={dataColumnPinBoundary(
                      pin,
                      index,
                      leftBoundaryColumnIndex,
                      fillerIndex,
                    )}
                    pinIndex={index}
                    pinned={pin ?? undefined}
                    resizeHandleProps={
                      resizingEnabled ? getResizeHandleProps(sizingColumns[index]) : undefined
                    }
                    sort={sort}
                    query={query}
                    bottomBordered={!hasFilters}
                  />
                </Fragment>
              );
            })}
            {hasPinned && fillerIndex === -1 && (
              <DataTableHeaderCell kind="filler" bottomBordered={!hasFilters} />
            )}
            {hasTrailingUtility && (
              <DataTableHeaderCell
                kind="actions"
                bottomBordered={!hasFilters}
                pinBoundary={actionsPinBoundary}
                pinned={utilityPin?.right}
              >
                <span className="sr-only">
                  {node.props?.actionsLabel ?? t("table.actions", "Actions")}
                </span>
              </DataTableHeaderCell>
            )}
          </DataTableHeaderRow>
          {hasFilters && (
            <DataTableHeaderRow>
              {hasExpandable && (
                <DataTableFilterCell
                  kind="expander"
                  pinBoundary={expanderPinBoundary}
                  pinned={utilityPin?.left}
                />
              )}
              {hasBulkActions && (
                <DataTableFilterCell
                  kind="selection"
                  pinBoundary={selectionPinBoundary}
                  pinned={utilityPin?.left}
                />
              )}
              {orderedColumns.map((column, index) => {
                const pin = hasPinned ? pinFor(column) : null;

                return (
                  <Fragment key={column.key}>
                    {hasPinned && index === fillerIndex && <DataTableFilterCell kind="filler" />}
                    <DataTableFilterCell
                      pinBoundary={dataColumnPinBoundary(
                        pin,
                        index,
                        leftBoundaryColumnIndex,
                        fillerIndex,
                      )}
                      pinIndex={index}
                      pinned={pin ?? undefined}
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
                    </DataTableFilterCell>
                  </Fragment>
                );
              })}
              {hasPinned && fillerIndex === -1 && <DataTableFilterCell kind="filler" />}
              {hasTrailingUtility && (
                <DataTableFilterCell
                  kind="actions"
                  pinBoundary={actionsPinBoundary}
                  pinned={utilityPin?.right}
                />
              )}
            </DataTableHeaderRow>
          )}
        </DataTableHeader>
        <DataTableBody>
          {!hasLoaded ? (
            <DataTableLoading>{t("table.loading", "Loading rows...")}</DataTableLoading>
          ) : rowEntries.length === 0 ? (
            <DataTableEmpty>
              {node.props?.emptyLabel ?? t("table.empty", "No results")}
            </DataTableEmpty>
          ) : (
            rowEntries.map(({ row, actions, detail, key, url }) => {
              const expanded = detail != null && isExpanded(key);
              const detailId = `${nodeIdentity(node) ?? "table"}-row-detail-${key}`;
              const linked = url != null;

              return (
                <Fragment key={key}>
                  <DataTableRow
                    clickable={linked}
                    data-row-link={url ?? undefined}
                    striped={striped}
                    onClick={(event) => handleRowClick(event, url, visit)}
                    onAuxClick={(event) => handleRowAuxClick(event, url)}
                  >
                    {hasExpandable && (
                      <DataTableCell
                        kind="expander"
                        pinBoundary={expanderPinBoundary}
                        pinned={utilityPin?.left}
                      >
                        {detail && (
                          <DataTableRowToggle
                            data-test={`row-expand-${key}`}
                            expanded={expanded}
                            aria-controls={detailId}
                            aria-label={t("table.row-detail.toggle", "Toggle detail")}
                            onClick={() => toggleRow(key)}
                          />
                        )}
                      </DataTableCell>
                    )}
                    {hasBulkActions && (
                      <DataTableCell
                        kind="selection"
                        pinBoundary={selectionPinBoundary}
                        pinned={utilityPin?.left}
                      >
                        <Checkbox
                          aria-label={t("table.select-row", "Select row {{key}}", { key })}
                          data-test={`select-row-${key}`}
                          checked={selection.isSelected(key)}
                          onCheckedChange={() => selection.toggle(key)}
                        />
                      </DataTableCell>
                    )}
                    {orderedColumns.map((column, index) => {
                      const pin = hasPinned ? pinFor(column) : null;

                      return (
                        <Fragment key={column.key}>
                          {hasPinned && index === fillerIndex && <DataTableCell kind="filler" />}
                          <DataTableCell
                            align={column.props.align}
                            label={column.props.label}
                            pinBoundary={dataColumnPinBoundary(
                              pin,
                              index,
                              leftBoundaryColumnIndex,
                              fillerIndex,
                            )}
                            pinIndex={index}
                            pinned={pin ?? undefined}
                          >
                            <ColumnCell column={column} row={row} />
                          </DataTableCell>
                        </Fragment>
                      );
                    })}
                    {hasPinned && fillerIndex === -1 && <DataTableCell kind="filler" />}
                    {hasTrailingUtility && (
                      <DataTableCell
                        kind="actions"
                        pinBoundary={actionsPinBoundary}
                        pinned={utilityPin?.right}
                      >
                        {actions.map((action, actionIndex) => (
                          <RenderNode key={action.key ?? action.id ?? actionIndex} node={action} />
                        ))}
                      </DataTableCell>
                    )}
                  </DataTableRow>
                  {expanded && detail && (
                    <DataTableRowDetail id={detailId}>
                      <Renderer nodes={[detail]} />
                    </DataTableRowDetail>
                  )}
                </Fragment>
              );
            })
          )}
        </DataTableBody>
      </DataTableGrid>
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
    </DataTable>
  );
};

export default TableComponent;
