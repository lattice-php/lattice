import { Icon } from "@lattice/lattice/icons";
import type { Node, RendererComponent } from "@lattice/lattice/core/types";
import { RenderNode } from "@lattice/lattice/core/renderer";
import { useMemo } from "react";
import { FormFieldFrame } from "../base/field";
import { FieldScopeProvider } from "../field-scope";
import { useDependentField } from "../use-dependent-field";
import { useFormValue, useSetFormValue } from "../values";
import { addRow, moveRow, removeRow, seedRows, type RepeaterRow } from "./repeater-rows";

export const RepeaterComponent: RendererComponent<"form.repeater"> = ({ node }) => {
  const props = node.props;
  const name = props.name;
  const { hidden, required } = useDependentField(node);
  const setValue = useSetFormValue();
  const stored = useFormValue(name);
  const rows = useMemo<RepeaterRow[]>(
    () => seedRows(stored, props.defaultItems ?? 1),
    [stored, props.defaultItems],
  );
  const template: Node[] = node.schema ?? [];
  const atMax = props.maxItems != null && rows.length >= props.maxItems;
  const atMin = props.minItems != null && rows.length <= props.minItems;

  const writeRows = (next: RepeaterRow[]): void => setValue(name, next);

  if (hidden) {
    return null;
  }

  return (
    <FormFieldFrame
      error={undefined}
      helperText={props.helperText ?? undefined}
      label={props.label ?? ""}
      name={name}
      required={required}
    >
      <div className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <div
            key={index}
            data-test={`repeater-${name}-row-${index}`}
            className="rounded-lt border border-lt-border bg-lt-surface p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-lt-muted-fg">
                {props.itemLabel ? `${props.itemLabel} ${index + 1}` : `#${index + 1}`}
              </span>
              <div className="flex items-center gap-1 [&_svg]:size-lt-icon-sm">
                {props.reorderable && index > 0 && (
                  <button
                    type="button"
                    aria-label="Move up"
                    data-test={`repeater-${name}-up-${index}`}
                    className="text-lt-muted-fg hover:text-lt-fg"
                    onClick={() => writeRows(moveRow(rows, index, index - 1))}
                  >
                    <Icon name="arrow-up" />
                  </button>
                )}
                {props.reorderable && index < rows.length - 1 && (
                  <button
                    type="button"
                    aria-label="Move down"
                    data-test={`repeater-${name}-down-${index}`}
                    className="text-lt-muted-fg hover:text-lt-fg"
                    onClick={() => writeRows(moveRow(rows, index, index + 1))}
                  >
                    <Icon name="arrow-down" />
                  </button>
                )}
                {!atMin && (
                  <button
                    type="button"
                    aria-label="Remove"
                    data-test={`repeater-${name}-remove-${index}`}
                    className="text-lt-muted-fg hover:text-lt-fg"
                    onClick={() => writeRows(removeRow(rows, index))}
                  >
                    <Icon name="trash-2" />
                  </button>
                )}
              </div>
            </div>

            <FieldScopeProvider
              base={name}
              index={index}
              row={row}
              onChange={(field, value) =>
                writeRows(rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
              }
            >
              <div className="flex flex-col gap-4">
                {template.map((child) => (
                  <RenderNode key={child.id} node={child} />
                ))}
              </div>
            </FieldScopeProvider>
          </div>
        ))}

        {!atMax && (
          <button
            type="button"
            data-test={`repeater-${name}-add`}
            className="inline-flex items-center gap-1.5 self-start rounded-lt-sm border border-lt-border px-3 py-1.5 text-sm hover:bg-lt-accent [&_svg]:size-lt-icon-sm"
            onClick={() => writeRows(addRow(rows))}
          >
            <Icon name="plus" />
            {props.addLabel ?? "Add"}
          </button>
        )}
      </div>
    </FormFieldFrame>
  );
};
