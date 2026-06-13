import type { Node } from "@lattice/lattice/core/types";
import { Icon } from "@lattice/lattice/icons";
import { RenderNode } from "@lattice/lattice/core/renderer";
import { FieldScopeProvider } from "../field-scope";
import { TableCellProvider } from "../row-layout-context";
import { RowActions } from "./row-actions";
import type { RepeaterRow } from "./repeater-rows";

export type TableColumn = { name: string; label: string };

export type TableRowModel = {
  key: string;
  index: number;
  row: RepeaterRow;
  template: Node[];
  span: boolean;
};

function ReorderButton({
  label,
  testId,
  onClick,
  icon,
}: {
  label: string;
  testId: string;
  onClick: () => void;
  icon: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      data-test={testId}
      className="text-lt-muted-fg hover:text-lt-fg [&_svg]:size-lt-icon-sm"
      onClick={onClick}
    >
      <Icon name={icon} />
    </button>
  );
}

export function TableRows({
  base,
  columns,
  rows,
  reorderable,
  removable,
  onField,
  onMove,
  onRemove,
}: {
  base: string;
  columns: TableColumn[];
  rows: TableRowModel[];
  reorderable: boolean;
  removable: (index: number) => boolean;
  onField: (index: number, field: string, value: unknown) => void;
  onMove: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
}) {
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

        {rows.map((row) => {
          const isFirst = row.index === 0;
          const isLast = row.index === rows.length - 1;

          return (
            <div
              key={row.key}
              data-flip-key={row.key}
              data-test={`table-row-${base}-${row.index}`}
              className="grid items-start gap-x-3"
              style={{ gridTemplateColumns }}
            >
              <div className="flex items-center gap-1">
                {reorderable && !isFirst && (
                  <ReorderButton
                    label="Move up"
                    testId={`table-${base}-up-${row.index}`}
                    onClick={() => onMove(row.index, -1)}
                    icon="arrow-up"
                  />
                )}
                {reorderable && !isLast && (
                  <ReorderButton
                    label="Move down"
                    testId={`table-${base}-down-${row.index}`}
                    onClick={() => onMove(row.index, 1)}
                    icon="arrow-down"
                  />
                )}
              </div>

              <FieldScopeProvider
                base={base}
                index={row.index}
                row={row.row}
                onChange={(field, value) => onField(row.index, field, value)}
              >
                <TableCellProvider>
                  {row.span ? (
                    <div
                      data-test={`table-row-${base}-${row.index}-span`}
                      className="flex flex-col gap-2"
                      style={{ gridColumn: `span ${columns.length}` }}
                    >
                      {row.template.map((child) => (
                        <RenderNode key={child.key ?? child.id} node={child} />
                      ))}
                    </div>
                  ) : (
                    row.template.map((child) => (
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
                    removable(row.index)
                      ? [
                          {
                            key: "remove",
                            label: "Remove",
                            icon: "trash-2",
                            onClick: () => onRemove(row.index),
                            destructive: true,
                          },
                        ]
                      : []
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
