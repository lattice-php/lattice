import { Icon } from "@lattice/lattice/icons";
import type { ReactNode } from "react";
import { memo, useCallback } from "react";
import type { Node, RendererComponent } from "@lattice/lattice/core/types";
import { RenderNode } from "@lattice/lattice/core/renderer";
import { FormFieldFrame } from "../base/field";
import { FieldScopeProvider } from "../field-scope";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { useFormValue, useSetFormValue } from "../values";
import { addRow, moveRow, removeRow, seedRows, type RepeaterRow } from "./repeater-rows";

const EMPTY_TEMPLATE: Node[] = [];

function RowButton({
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

type RepeaterRowProps = {
  base: string;
  index: number;
  row: RepeaterRow;
  template: Node[];
  reorderable: boolean;
  isFirst: boolean;
  isLast: boolean;
  removable: boolean;
  itemLabel: string | null;
  onField: (index: number, field: string, value: unknown) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, delta: number) => void;
};

// Memoised so editing one row doesn't re-render its siblings. Its props are kept
// referentially stable by the parent: `row` survives untouched via functional
// store updates, and the handlers are `useCallback`-stable.
const RepeaterRowItem = memo(function RepeaterRowItem({
  base,
  index,
  row,
  template,
  reorderable,
  isFirst,
  isLast,
  removable,
  itemLabel,
  onField,
  onRemove,
  onMove,
}: RepeaterRowProps) {
  return (
    <div
      data-test={`repeater-${base}-row-${index}`}
      className="rounded-lt border border-lt-border bg-lt-surface p-4"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-lt-muted-fg">
          {itemLabel ? `${itemLabel} ${index + 1}` : `#${index + 1}`}
        </span>
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
          {removable && (
            <RowButton
              label="Remove"
              testId={`repeater-${base}-remove-${index}`}
              onClick={() => onRemove(index)}
            >
              <Icon name="trash-2" />
            </RowButton>
          )}
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

export const RepeaterComponent: RendererComponent<"form.repeater"> = ({ node }) => {
  const props = node.props;
  const name = props.name;
  const defaultItems = props.defaultItems ?? 1;
  const { errors } = useFormContext();
  const { hidden, required } = useDependentField(node);
  const setValue = useSetFormValue();
  const stored = useFormValue(name);
  const rows: RepeaterRow[] = Array.isArray(stored) ? stored : seedRows(stored, defaultItems);
  const template = node.schema ?? EMPTY_TEMPLATE;
  const atMax = props.maxItems != null && rows.length >= props.maxItems;
  const atMin = props.minItems != null && rows.length <= props.minItems;

  // Functional store updates preserve the identity of untouched rows, which lets
  // the memoised RepeaterRowItem skip re-rendering siblings on a single-row edit.
  const mutate = useCallback(
    (fn: (rows: RepeaterRow[]) => RepeaterRow[]): void => {
      setValue(name, (prev: unknown) =>
        fn(Array.isArray(prev) ? (prev as RepeaterRow[]) : seedRows(prev, defaultItems)),
      );
    },
    [setValue, name, defaultItems],
  );
  const onField = useCallback(
    (index: number, field: string, value: unknown): void => {
      mutate((current) => current.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    },
    [mutate],
  );
  const onRemove = useCallback(
    (index: number): void => mutate((current) => removeRow(current, index)),
    [mutate],
  );
  const onMove = useCallback(
    (index: number, delta: number): void =>
      mutate((current) => moveRow(current, index, index + delta)),
    [mutate],
  );
  const onAdd = useCallback((): void => mutate(addRow), [mutate]);

  if (hidden) {
    return null;
  }

  return (
    <FormFieldFrame
      error={errors[name]}
      helperText={props.helperText ?? undefined}
      label={props.label ?? ""}
      name={name}
      required={required}
    >
      <div className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <RepeaterRowItem
            key={index}
            base={name}
            index={index}
            row={row}
            template={template}
            reorderable={props.reorderable ?? false}
            isFirst={index === 0}
            isLast={index === rows.length - 1}
            removable={!atMin}
            itemLabel={props.itemLabel ?? null}
            onField={onField}
            onRemove={onRemove}
            onMove={onMove}
          />
        ))}

        {!atMax && (
          <button
            type="button"
            data-test={`repeater-${name}-add`}
            className="inline-flex items-center gap-1.5 self-start rounded-lt-sm border border-lt-border px-3 py-1.5 text-sm hover:bg-lt-accent [&_svg]:size-lt-icon-sm"
            onClick={onAdd}
          >
            <Icon name="plus" />
            {props.addLabel ?? "Add"}
          </button>
        )}
      </div>
    </FormFieldFrame>
  );
};
