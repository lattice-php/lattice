import type { Node } from "@lattice/lattice/core/types";
import { Icon } from "@lattice/lattice/icons";
import { memo } from "react";
import { RenderNode } from "@lattice/lattice/core/renderer";
import { FieldScopeProvider } from "../field-scope";
import { TableCellProvider } from "../row-layout-context";
import { RowActions } from "./row-actions";
import { RowButton } from "./row-item";
import type { RepeaterRow } from "./repeater-rows";

export type TableColumn = { name: string; label: string };

export type TableRowModel = {
  key: string;
  index: number;
  row: RepeaterRow;
  template: Node[];
  span: boolean;
};

export function columnsFromSchema(nodes: Node[]): TableColumn[] {
  return nodes.map((node) => {
    const props = node.props as { name: unknown; label?: unknown };
    return { name: String(props.name), label: String(props.label ?? props.name) };
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
  onField: (index: number, field: string, value: unknown) => void;
  onMove: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
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
  onField,
  onMove,
  onRemove,
  registerRow,
}: TableRowItemProps) {
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
          actions={
            removable
              ? [
                  {
                    key: "remove",
                    label: "Remove",
                    icon: "trash-2",
                    onClick: () => onRemove(index),
                    destructive: true,
                  },
                ]
              : []
          }
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
  onField,
  onMove,
  onRemove,
  registerRow,
}: {
  base: string;
  columns: TableColumn[];
  rows: TableRowModel[];
  reorderable: boolean;
  removable: (index: number) => boolean;
  onField: (index: number, field: string, value: unknown) => void;
  onMove: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  registerRow?: (key: string, el: HTMLElement | null) => void;
}) {
  // For columnar (non-span) rows, template node order must match columns order,
  // as cells are placed by grid position.
  const gridTemplateColumns = `auto repeat(${columns.length}, minmax(0, 1fr)) auto`;

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max flex-col gap-2">
        <div className="grid items-center gap-x-3" style={{ gridTemplateColumns }}>
          <div />
          {columns.map((column) => (
            <div key={column.name} className="text-xs font-medium text-lt-muted-fg">
              {column.label}
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
            onField={onField}
            onMove={onMove}
            onRemove={onRemove}
            registerRow={registerRow}
          />
        ))}
      </div>
    </div>
  );
}
