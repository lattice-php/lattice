import { type CSSProperties, type MouseEvent, type ReactNode, Fragment, useMemo } from "react";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { useNavigation } from "@lattice-php/ui/navigation";
import { Renderer, RenderNode } from "@lattice-php/core/renderer";
import { useColumnResizing } from "@lattice-php/ui/lib/use-column-resizing";
import { useColumnPinning } from "@lattice-php/table/hooks/use-column-pinning";
import { useColumnVisibility } from "@lattice-php/table/hooks/use-column-visibility";
import { useExpandedRows } from "@lattice-php/table/hooks/use-expanded-rows";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { Checkbox } from "@lattice-php/ui/primitives/checkbox";
import { Icon } from "@lattice-php/ui/icons";
import { alignJustifyItems, alignText } from "@lattice-php/table/lib/align";
import type { TableNode } from "@lattice-php/table/types";
import { getBulkActionNodes } from "@lattice-php/table/lib/bulk";
import type { PinBoundary } from "@lattice-php/table/lib/pin-boundary";
import { pinBoundaryClassName } from "@lattice-php/table/lib/pin-boundary";
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
  getTableUtilityTracks,
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

const expanderPinStyle: CSSProperties = { insetInlineStart: "var(--lt-pin-offset-expander)" };
const selectionPinStyle: CSSProperties = { insetInlineStart: "var(--lt-pin-offset-selection)" };
const actionsPinStyle: CSSProperties = { insetInlineEnd: "var(--lt-pin-offset-actions)" };

function columnPinStyle(index: number, side: "left" | "right"): CSSProperties {
  const offset = `var(--lt-pin-offset-${index})`;

  return side === "left" ? { insetInlineStart: offset } : { insetInlineEnd: offset };
}

function pinnedHeaderBg(pinned: boolean): string {
  return pinned ? "bg-[var(--lt-table-pinned-muted-bg)]" : "bg-lt-muted/50";
}

function pinnedBodyBg(pinned: boolean, striped: boolean, linked: boolean): string | undefined {
  if (!pinned) {
    return undefined;
  }

  return cn(
    "bg-[var(--lt-table-pinned-bg)]",
    striped && "group-odd/row:bg-[var(--lt-table-pinned-stripe-bg)]",
    linked && "group-hover/row:bg-[var(--lt-table-pinned-hover-bg)]",
  );
}

function dataColumnPinBoundary(
  pin: "left" | "right" | null,
  index: number,
  leftBoundaryColumnIndex: number,
  fillerIndex: number,
): PinBoundary | undefined {
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
  const expanderPinBoundary: PinBoundary | undefined =
    leftBoundaryOwner === "expander" ? "end" : undefined;
  const selectionPinBoundary: PinBoundary | undefined =
    leftBoundaryOwner === "selection" ? "end" : undefined;
  const actionsPinBoundary: PinBoundary | undefined =
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
    () => getTableUtilityTracks(hasTrailingUtility, hasBulkActions, hasExpandable),
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
            className={cn(hasPinned ? "min-w-max" : "min-w-full", "text-base")}
            role="table"
            style={
              {
                "--lattice-table-columns": gridTemplateColumns,
                ...pinOffsetVars,
              } as never
            }
          >
            <div data-slot="table-header" role="rowgroup">
              <div
                className="hidden min-w-full md:grid md:grid-cols-[var(--lattice-table-columns)]"
                role="row"
              >
                {hasExpandable && (
                  <div
                    className={cn(
                      pinnedHeaderBg(hasPinned),
                      "px-2 py-3",
                      hasPinned && "md:sticky z-[1]",
                      !hasFilters && "border-b border-lt-border",
                      pinBoundaryClassName(expanderPinBoundary),
                    )}
                    data-pin-boundary={expanderPinBoundary}
                    data-pinned={hasPinned ? "left" : undefined}
                    role="columnheader"
                    aria-hidden="true"
                    style={hasPinned ? expanderPinStyle : undefined}
                  />
                )}
                {hasBulkActions && (
                  <div
                    className={cn(
                      "flex items-center px-4 py-3",
                      pinnedHeaderBg(hasPinned),
                      hasPinned && "md:sticky z-[1]",
                      !hasFilters && "border-b border-lt-border",
                      pinBoundaryClassName(selectionPinBoundary),
                    )}
                    data-pin-boundary={selectionPinBoundary}
                    data-pinned={hasPinned ? "left" : undefined}
                    role="columnheader"
                    style={hasPinned ? selectionPinStyle : undefined}
                  >
                    <Checkbox
                      aria-label={t("table.select-all-rows", "Select all rows")}
                      data-test="select-all"
                      checked={selection.allSelected}
                      onCheckedChange={() => selection.toggleAll()}
                    />
                  </div>
                )}
                {orderedColumns.map((column, index) => {
                  const pin = hasPinned ? pinFor(column) : null;

                  return (
                    <Fragment key={column.key}>
                      {hasPinned && index === fillerIndex && (
                        <div
                          aria-hidden="true"
                          className={cn(
                            "bg-lt-muted/50",
                            !hasFilters && "border-b border-lt-border",
                          )}
                        />
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
                        pinned={pin ?? undefined}
                        pinStyle={pin ? columnPinStyle(index, pin) : undefined}
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
                  <div
                    aria-hidden="true"
                    className={cn("bg-lt-muted/50", !hasFilters && "border-b border-lt-border")}
                  />
                )}
                {hasTrailingUtility && (
                  <div
                    className={cn(
                      "flex items-center justify-end gap-2 px-4 py-2 align-middle font-semibold text-lt-fg",
                      pinnedHeaderBg(hasPinned),
                      hasPinned && "md:sticky z-[1]",
                      !hasFilters && "border-b border-lt-border",
                      pinBoundaryClassName(actionsPinBoundary),
                    )}
                    data-pin-boundary={actionsPinBoundary}
                    data-pinned={hasPinned ? "right" : undefined}
                    role="columnheader"
                    style={hasPinned ? actionsPinStyle : undefined}
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
                      className={cn(
                        "border-t border-b border-lt-border px-2 py-2",
                        pinnedHeaderBg(hasPinned),
                        hasPinned && "md:sticky z-[1]",
                        pinBoundaryClassName(expanderPinBoundary),
                      )}
                      data-pin-boundary={expanderPinBoundary}
                      data-pinned={hasPinned ? "left" : undefined}
                      role="cell"
                      style={hasPinned ? expanderPinStyle : undefined}
                    />
                  )}
                  {hasBulkActions && (
                    <div
                      className={cn(
                        "border-t border-b border-lt-border px-4 py-2",
                        pinnedHeaderBg(hasPinned),
                        hasPinned && "md:sticky z-[1]",
                        pinBoundaryClassName(selectionPinBoundary),
                      )}
                      data-pin-boundary={selectionPinBoundary}
                      data-pinned={hasPinned ? "left" : undefined}
                      role="cell"
                      style={hasPinned ? selectionPinStyle : undefined}
                    />
                  )}
                  {orderedColumns.map((column, index) => {
                    const pin = hasPinned ? pinFor(column) : null;
                    const pinBoundary = dataColumnPinBoundary(
                      pin,
                      index,
                      leftBoundaryColumnIndex,
                      fillerIndex,
                    );

                    return (
                      <Fragment key={column.key}>
                        {hasPinned && index === fillerIndex && (
                          <div
                            aria-hidden="true"
                            className="border-t border-b border-lt-border bg-lt-muted/50"
                          />
                        )}
                        <div
                          className={cn(
                            "min-w-0 border-t border-b border-lt-border px-2 py-2",
                            pinnedHeaderBg(Boolean(pin)),
                            pin && "md:sticky z-[1]",
                            pinBoundaryClassName(pinBoundary),
                          )}
                          data-pin-boundary={pinBoundary}
                          data-pinned={pin ?? undefined}
                          role="cell"
                          style={pin ? columnPinStyle(index, pin) : undefined}
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
                      </Fragment>
                    );
                  })}
                  {hasPinned && fillerIndex === -1 && (
                    <div
                      aria-hidden="true"
                      className="border-t border-b border-lt-border bg-lt-muted/50"
                    />
                  )}
                  {hasTrailingUtility && (
                    <div
                      className={cn(
                        "border-t border-b border-lt-border px-4 py-2",
                        pinnedHeaderBg(hasPinned),
                        hasPinned && "md:sticky z-[1]",
                        pinBoundaryClassName(actionsPinBoundary),
                      )}
                      data-pin-boundary={actionsPinBoundary}
                      data-pinned={hasPinned ? "right" : undefined}
                      role="cell"
                      style={hasPinned ? actionsPinStyle : undefined}
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
                rowEntries.map(({ row, actions, detail, key, url }) => {
                  const expanded = detail != null && isExpanded(key);
                  const detailId = `${nodeIdentity(node) ?? "table"}-row-detail-${key}`;
                  const linked = url != null;

                  return (
                    <Fragment key={key}>
                      <div
                        data-slot="table-row"
                        data-row-link={url ?? undefined}
                        className={cn(
                          "grid grid-cols-1 border-b border-lt-border last:border-b-0 md:grid-cols-[var(--lattice-table-columns)]",
                          striped && "odd:bg-lt-muted/30",
                          (hasPinned || linked) && "group/row",
                          linked && "cursor-pointer hover:bg-lt-muted/50",
                        )}
                        role="row"
                        onClick={(event) => handleRowClick(event, url, visit)}
                        onAuxClick={(event) => handleRowAuxClick(event, url)}
                      >
                        {hasExpandable && (
                          <div
                            className={cn(
                              "flex items-center px-2 py-lt-cell-y",
                              pinnedBodyBg(hasPinned, striped, linked),
                              hasPinned && "md:sticky z-[1]",
                              pinBoundaryClassName(expanderPinBoundary),
                            )}
                            data-pin-boundary={expanderPinBoundary}
                            data-pinned={hasPinned ? "left" : undefined}
                            role="cell"
                            style={hasPinned ? expanderPinStyle : undefined}
                          >
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
                          <div
                            className={cn(
                              "flex items-center px-lt-cell-x py-lt-cell-y",
                              pinnedBodyBg(hasPinned, striped, linked),
                              hasPinned && "md:sticky z-[1]",
                              pinBoundaryClassName(selectionPinBoundary),
                            )}
                            data-pin-boundary={selectionPinBoundary}
                            data-pinned={hasPinned ? "left" : undefined}
                            role="cell"
                            style={hasPinned ? selectionPinStyle : undefined}
                          >
                            <Checkbox
                              aria-label={t("table.select-row", "Select row {{key}}", { key })}
                              data-test={`select-row-${key}`}
                              checked={selection.isSelected(key)}
                              onCheckedChange={() => selection.toggle(key)}
                            />
                          </div>
                        )}
                        {orderedColumns.map((column, index) => {
                          const pin = hasPinned ? pinFor(column) : null;
                          const pinBoundary = dataColumnPinBoundary(
                            pin,
                            index,
                            leftBoundaryColumnIndex,
                            fillerIndex,
                          );

                          return (
                            <Fragment key={column.key}>
                              {hasPinned && index === fillerIndex && <div aria-hidden="true" />}
                              <div
                                data-slot="table-cell"
                                className={cn(
                                  "grid min-w-0 content-center gap-1 overflow-hidden px-lt-cell-x py-lt-cell-y",
                                  alignText(column.props.align),
                                  alignJustifyItems(column.props.align),
                                  pinnedBodyBg(Boolean(pin), striped, linked),
                                  pin && "md:sticky z-[1]",
                                  pinBoundaryClassName(pinBoundary),
                                )}
                                data-pin-boundary={pinBoundary}
                                data-pinned={pin ?? undefined}
                                role="cell"
                                style={pin ? columnPinStyle(index, pin) : undefined}
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
                            </Fragment>
                          );
                        })}
                        {hasPinned && fillerIndex === -1 && <div aria-hidden="true" />}
                        {hasTrailingUtility && (
                          <div
                            className={cn(
                              "items-center justify-start gap-2 px-lt-cell-x py-lt-cell-y md:justify-end",
                              actions.length > 0 ? "flex" : "hidden md:flex",
                              pinnedBodyBg(hasPinned, striped, linked),
                              hasPinned && "md:sticky z-[1]",
                              pinBoundaryClassName(actionsPinBoundary),
                            )}
                            data-pin-boundary={actionsPinBoundary}
                            data-pinned={hasPinned ? "right" : undefined}
                            role="cell"
                            style={hasPinned ? actionsPinStyle : undefined}
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
