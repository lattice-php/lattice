import { Icon } from "@lattice-php/lattice/icons";
import type { Node, RendererComponent } from "@lattice-php/lattice/core/types";
import { FormFieldFrame } from "@lattice-php/lattice/form/components/base/field";
import { useFormContext } from "@lattice-php/lattice/form/hooks/context";
import { useDependentField } from "@lattice-php/lattice/form/hooks/use-dependent-field";
import { ROW_ID_KEY } from "./repeater-rows";
import { RowKeyInputs } from "./row-key-inputs";
import { RowItem } from "./row-item";
import { columnsFromSchema, TableRows } from "./table-rows";
import { useFlipReorder } from "./use-flip-reorder";
import { useRowCollection } from "./use-row-collection";

const EMPTY_TEMPLATE: Node[] = [];

export const RepeaterComponent: RendererComponent<"field.repeater"> = ({ node }) => {
  const props = node.props;
  const name = props.name;
  const { errors } = useFormContext();
  const { hidden, required } = useDependentField(node);
  const { path, rows, onField, onRemove, onMove, onDuplicate, append } = useRowCollection(
    name,
    props.defaultItems ?? 1,
  );
  const template = node.schema ?? EMPTY_TEMPLATE;
  const orderSignature = rows.map((r) => String(r[ROW_ID_KEY] ?? "")).join(",");
  const registerRow = useFlipReorder(orderSignature);
  const atMax = props.maxItems != null && rows.length >= props.maxItems;
  const atMin = props.minItems != null && rows.length <= props.minItems;
  const isTable = props.layout === "table";
  const itemLabels = (props as { itemLabels?: Array<string | null> | null }).itemLabels;
  const rowHeading = (index: number) => {
    const label = itemLabels?.[index];

    if (typeof label === "string" && label !== "") {
      return label;
    }

    return props.itemLabel ? `${props.itemLabel} ${index + 1}` : `#${index + 1}`;
  };

  if (hidden) {
    return null;
  }

  const tableRows = rows.map((row, index) => ({
    key: String(row[ROW_ID_KEY] ?? index),
    index,
    row,
    template,
    span: false,
    heading: rowHeading(index),
  }));

  return (
    <FormFieldFrame
      error={errors[path]}
      helperText={props.helperText ?? undefined}
      tooltip={props.tooltip ?? undefined}
      label={props.label ?? ""}
      name={path}
      required={required}
    >
      <div className="flex flex-col gap-3">
        <RowKeyInputs path={path} rows={rows} rowKey={ROW_ID_KEY} />
        {isTable ? (
          <TableRows
            base={path}
            columns={columnsFromSchema(template)}
            rows={tableRows}
            reorderable={props.reorderable ?? false}
            removable={() => !atMin}
            rowActions={props.rowActions}
            onField={onField}
            onMove={onMove}
            onRemove={onRemove}
            onDuplicate={onDuplicate}
            registerRow={registerRow}
            resizableColumns={props.resizableColumns === true}
            resizeIndicator={props.resizeIndicator === true}
          />
        ) : (
          rows.map((row, index) => {
            const key = String(row[ROW_ID_KEY] ?? index);
            return (
              <div key={key} ref={(el) => registerRow(key, el)} data-flip-key={key}>
                <RowItem
                  base={path}
                  index={index}
                  row={row}
                  template={template}
                  heading={rowHeading(index)}
                  reorderable={props.reorderable ?? false}
                  isFirst={index === 0}
                  isLast={index === rows.length - 1}
                  removable={!atMin}
                  rowActions={props.rowActions}
                  onField={onField}
                  onRemove={onRemove}
                  onMove={onMove}
                  onDuplicate={onDuplicate}
                />
              </div>
            );
          })
        )}

        {!atMax && (
          <button
            type="button"
            data-test={`repeater-${name}-add`}
            className="inline-flex items-center gap-1.5 self-start rounded-lt-sm border border-lt-border px-3 py-1.5 text-sm hover:bg-lt-accent [&_svg]:size-lt-icon-sm"
            onClick={() => append({})}
          >
            <Icon name="plus" />
            {props.addLabel ?? "Add"}
          </button>
        )}
      </div>
    </FormFieldFrame>
  );
};
