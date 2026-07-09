import type { Node } from "@lattice-php/lattice/core/types";
import { RenderNode } from "@lattice-php/lattice/core/renderer";
import {
  DEFAULT_COLUMN_WIDTH,
  type SizableColumn,
} from "@lattice-php/lattice/core/hooks/column-sizing";
import { useColumnResizing } from "@lattice-php/lattice/core/hooks/use-column-resizing";
import { Icon } from "@lattice-php/lattice/icons";
import { useT } from "@lattice-php/lattice/i18n";
import { memo, useEffect, useMemo, useState } from "react";
import type { ColumnWidth, RowAction as WireRowAction } from "@lattice-php/lattice/types/generated";
import { FieldScopeProvider } from "../../hooks/field-scope";
import { TableCellProvider } from "../../hooks/row-layout-context";
import { buildRowActions } from "./row-action-menu";
import { RowActions } from "./row-actions";
import { RowButton, RowItem } from "./row-item";
import type { RepeaterRow } from "./repeater-rows";

const rowControlTrack = "3rem";
const rowActionTrack = "3rem";
const rowControlTracks = [rowControlTrack];
const rowActionTracks = [rowActionTrack];
const tableViewportQuery = "(min-width: 768px)";

export type TableColumn = { name: string; label: string; columnWidth: ColumnWidth };

type TableRowModel = {
  key: string;
  index: number;
  row: RepeaterRow;
  template: Node[];
  span: boolean;
  heading?: string;
};

function tableViewportMatches(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return true;
  }

  return window.matchMedia(tableViewportQuery).matches;
}

function useTableViewport(): boolean {
  const [matches, setMatches] = useState(tableViewportMatches);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia(tableViewportQuery);
    const update = () => setMatches(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return matches;
}

export function columnsFromSchema(nodes: Node[]): TableColumn[] {
  return nodes.map((node) => {
    const props = node.props as {
      name: unknown;
      label?: unknown;
      columnWidth?: ColumnWidth | null;
    };
    return {
      name: String(props.name),
      label: String(props.label ?? props.name),
      columnWidth: props.columnWidth ?? DEFAULT_COLUMN_WIDTH,
    };
  });
}

type TableRowItemProps = {
  base: string;
  index: number;
  row: RepeaterRow;
  template: Node[];
  span: boolean;
  isFirst: boolean;
  isLast: boolean;
  columnCount: number;
  gridTemplateColumns: string;
  flipKey: string;
  reorderable: boolean;
  removable: boolean;
  rowActions: WireRowAction[] | null;
  onField: (index: number, field: string, value: unknown) => void;
  onMove: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  registerRow?: (key: string, el: HTMLElement | null) => void;
};

const TableRowItem = memo(function TableRowItem({
  base,
  index,
  row,
  template,
  span,
  isFirst,
  isLast,
  columnCount,
  gridTemplateColumns,
  flipKey,
  reorderable,
  removable,
  rowActions,
  onField,
  onMove,
  onRemove,
  onDuplicate,
  registerRow,
}: TableRowItemProps) {
  const { t } = useT("lattice");

  return (
    <div
      ref={(el) => registerRow?.(flipKey, el)}
      data-flip-key={flipKey}
      data-test={`table-row-${base}-${index}`}
      className="grid items-start gap-x-3"
      style={{ gridTemplateColumns }}
    >
      <div className="flex items-center gap-1 [&_svg]:size-lt-icon-sm">
        {reorderable && !isFirst && (
          <RowButton
            label="Move up"
            testId={`table-${base}-up-${index}`}
            onClick={() => onMove(index, -1)}
          >
            <Icon name="arrow-up" />
          </RowButton>
        )}
        {reorderable && !isLast && (
          <RowButton
            label="Move down"
            testId={`table-${base}-down-${index}`}
            onClick={() => onMove(index, 1)}
          >
            <Icon name="arrow-down" />
          </RowButton>
        )}
      </div>

      <FieldScopeProvider
        base={base}
        index={index}
        row={row}
        onChange={(field, value) => onField(index, field, value)}
      >
        <TableCellProvider>
          {span ? (
            <div
              data-test={`table-row-${base}-${index}-span`}
              className="flex flex-col gap-2"
              style={{ gridColumn: `span ${columnCount}` }}
            >
              {template.map((child) => (
                <RenderNode key={child.key ?? child.id} node={child} />
              ))}
            </div>
          ) : (
            template.map((child) => (
              <div key={child.key ?? child.id}>
                <RenderNode node={child} />
              </div>
            ))
          )}
        </TableCellProvider>
      </FieldScopeProvider>

      <div className="flex items-center">
        <RowActions
          actions={buildRowActions(rowActions, { index, removable, onRemove, onDuplicate, t })}
        />
      </div>
    </div>
  );
});

export function TableRows({
  base,
  columns,
  rows,
  reorderable,
  removable,
  rowActions,
  onField,
  onMove,
  onRemove,
  onDuplicate,
  registerRow,
  resizableColumns = false,
  resizeIndicator = false,
}: {
  base: string;
  columns: TableColumn[];
  rows: TableRowModel[];
  reorderable: boolean;
  removable: (index: number) => boolean;
  rowActions: WireRowAction[] | null;
  onField: (index: number, field: string, value: unknown) => void;
  onMove: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  registerRow?: (key: string, el: HTMLElement | null) => void;
  resizableColumns?: boolean;
  resizeIndicator?: boolean;
}) {
  const { t } = useT("lattice");
  const isTableViewport = useTableViewport();
  const sizingColumns = useMemo<SizableColumn[]>(
    () =>
      columns.map((column) => ({
        key: column.name,
        label: column.label,
        width: column.columnWidth,
      })),
    [columns],
  );
  const { getResizeHandleProps, gridTemplateColumns, hasOverrides, resetColumns } =
    useColumnResizing({
      columns: sizingColumns,
      enabled: resizableColumns,
      columnGapPx: 12,
      leadingTracks: rowControlTracks,
      showIndicator: resizeIndicator,
      storageKey: resizableColumns ? `lattice:table-columns:form:${base}` : undefined,
      trailingTracks: rowActionTracks,
    });

  if (!isTableViewport) {
    return (
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.key} ref={(el) => registerRow?.(row.key, el)} data-flip-key={row.key}>
            <RowItem
              base={base}
              index={row.index}
              row={row.row}
              template={row.template}
              heading={row.heading ?? `#${row.index + 1}`}
              reorderable={reorderable}
              isFirst={row.index === 0}
              isLast={row.index === rows.length - 1}
              removable={removable(row.index)}
              rowActions={rowActions}
              onField={onField}
              onRemove={onRemove}
              onMove={onMove}
              onDuplicate={onDuplicate}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
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
      <div className="overflow-x-auto">
        <div className="flex min-w-max flex-col gap-2">
          <div className="grid items-center gap-x-3" style={{ gridTemplateColumns }}>
            <div />
            {columns.map((column, index) => (
              <div
                key={column.name}
                className="relative min-w-0 pr-3 text-xs font-medium text-lt-muted-fg"
              >
                {column.label}
                {resizableColumns && <div {...getResizeHandleProps(sizingColumns[index])} />}
              </div>
            ))}
            <div />
          </div>

          {rows.map((row) => (
            <TableRowItem
              key={row.key}
              base={base}
              index={row.index}
              row={row.row}
              template={row.template}
              span={row.span}
              isFirst={row.index === 0}
              isLast={row.index === rows.length - 1}
              columnCount={columns.length}
              gridTemplateColumns={gridTemplateColumns}
              flipKey={row.key}
              reorderable={reorderable}
              removable={removable(row.index)}
              rowActions={rowActions}
              onField={onField}
              onMove={onMove}
              onRemove={onRemove}
              onDuplicate={onDuplicate}
              registerRow={registerRow}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
