import { Icon } from "@lattice/lattice/icons";
import type { Node, RendererComponent } from "@lattice/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { ROW_ID_KEY } from "./repeater-rows";
import { RowItem } from "./row-item";
import { TableRows } from "./table-rows";
import { useFlipReorder } from "./use-flip-reorder";
import { useRowCollection } from "./use-row-collection";

const EMPTY_TEMPLATE: Node[] = [];

type FieldProps = { name: string; label?: string };

export const RepeaterComponent: RendererComponent<"form.repeater"> = ({ node }) => {
  const props = node.props;
  const name = props.name;
  const { errors } = useFormContext();
  const { hidden, required } = useDependentField(node);
  const { rows, onField, onRemove, onMove, append } = useRowCollection(
    name,
    props.defaultItems ?? 1,
  );
  const template = node.schema ?? EMPTY_TEMPLATE;
  const orderSignature = rows.map((r) => String(r[ROW_ID_KEY] ?? "")).join(",");
  const registerRow = useFlipReorder(orderSignature);
  const atMax = props.maxItems != null && rows.length >= props.maxItems;
  const atMin = props.minItems != null && rows.length <= props.minItems;
  const isTable = props.layout === "table";

  if (hidden) {
    return null;
  }

  const addButton = !atMax && (
    <button
      type="button"
      data-test={`repeater-${name}-add`}
      className="inline-flex items-center gap-1.5 self-start rounded-lt-sm border border-lt-border px-3 py-1.5 text-sm hover:bg-lt-accent [&_svg]:size-lt-icon-sm"
      onClick={() => append({})}
    >
      <Icon name="plus" />
      {props.addLabel ?? "Add"}
    </button>
  );

  if (isTable) {
    const columns = template.map((field) => {
      const fieldProps = field.props as FieldProps;
      return { name: String(fieldProps.name), label: String(fieldProps.label ?? fieldProps.name) };
    });
    const tableRows = rows.map((row, index) => ({
      key: String(row[ROW_ID_KEY] ?? index),
      index,
      row,
      template,
      span: false,
    }));

    return (
      <FormFieldFrame
        error={errors[name]}
        helperText={props.helperText ?? undefined}
        label={props.label ?? ""}
        name={name}
        required={required}
      >
        <div className="flex flex-col gap-3">
          <TableRows
            base={name}
            columns={columns}
            rows={tableRows}
            reorderable={props.reorderable ?? false}
            removable={() => !atMin}
            onField={onField}
            onMove={onMove}
            onRemove={onRemove}
            registerRow={registerRow}
          />
          {addButton}
        </div>
      </FormFieldFrame>
    );
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
        {rows.map((row, index) => {
          const key = String(row[ROW_ID_KEY] ?? index);
          return (
            <div key={key} ref={(el) => registerRow(key, el)} data-flip-key={key}>
              <RowItem
                base={name}
                index={index}
                row={row}
                template={template}
                heading={props.itemLabel ? `${props.itemLabel} ${index + 1}` : `#${index + 1}`}
                reorderable={props.reorderable ?? false}
                isFirst={index === 0}
                isLast={index === rows.length - 1}
                removable={!atMin}
                onField={onField}
                onRemove={onRemove}
                onMove={onMove}
              />
            </div>
          );
        })}

        {addButton}
      </div>
    </FormFieldFrame>
  );
};
