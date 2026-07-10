import { Icon } from "@lattice-php/lattice/icons";
import type { ReactNode } from "react";
import { memo } from "react";
import type { Node } from "@lattice-php/lattice/core/types";
import { RenderNode } from "@lattice-php/lattice/core/renderer";
import { useT } from "@lattice-php/lattice/i18n";
import type { RowAction as WireRowAction } from "@lattice-php/lattice/types/generated";
import { FieldScopeProvider } from "@lattice-php/lattice/form/hooks/field-scope";
import { buildRowActions } from "./row-action-menu";
import { RowActions } from "./row-actions";
import type { RepeaterRow } from "./repeater-rows";

export function RowButton({
  label,
  testId,
  onClick,
  children,
}: {
  label: string;
  testId: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      data-test={testId}
      className="text-lt-muted-fg hover:text-lt-fg"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

type RowItemProps = {
  base: string;
  index: number;
  row: RepeaterRow;
  template: Node[];
  heading: string;
  reorderable: boolean;
  isFirst: boolean;
  isLast: boolean;
  removable: boolean;
  rowActions: WireRowAction[] | null;
  onField: (index: number, field: string, value: unknown) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, delta: number) => void;
  onDuplicate: (index: number) => void;
};

// Memoised so editing one row doesn't re-render its siblings. Its props are kept
// referentially stable by the parent: `row` survives untouched via functional
// store updates, and the handlers are `useCallback`-stable.
export const RowItem = memo(function RowItem({
  base,
  index,
  row,
  template,
  heading,
  reorderable,
  isFirst,
  isLast,
  removable,
  rowActions,
  onField,
  onRemove,
  onMove,
  onDuplicate,
}: RowItemProps) {
  const { t } = useT("lattice");

  return (
    <div
      data-test={`repeater-${base}-row-${index}`}
      className="rounded-lt border border-lt-border bg-lt-surface p-4"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-lt-muted-fg">{heading}</span>
        <div className="flex items-center gap-1 [&_svg]:size-lt-icon-sm">
          {reorderable && !isFirst && (
            <RowButton
              label="Move up"
              testId={`repeater-${base}-up-${index}`}
              onClick={() => onMove(index, -1)}
            >
              <Icon name="arrow-up" />
            </RowButton>
          )}
          {reorderable && !isLast && (
            <RowButton
              label="Move down"
              testId={`repeater-${base}-down-${index}`}
              onClick={() => onMove(index, 1)}
            >
              <Icon name="arrow-down" />
            </RowButton>
          )}
          <RowActions
            actions={buildRowActions(rowActions, { index, removable, onRemove, onDuplicate, t })}
          />
        </div>
      </div>

      <FieldScopeProvider
        base={base}
        index={index}
        row={row}
        onChange={(field, value) => onField(index, field, value)}
      >
        <div className="flex flex-col gap-4">
          {template.map((child) => (
            <RenderNode key={child.key ?? child.id} node={child} />
          ))}
        </div>
      </FieldScopeProvider>
    </div>
  );
});
