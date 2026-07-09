import type { Node, RendererComponent } from "@lattice-php/lattice/core/types";
import { useT } from "@lattice-php/lattice/i18n";
import { FormFieldFrame } from "../base/field";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { AddRowMenu, type AddRowOption } from "./add-row-menu";
import { ROW_ID_KEY } from "./repeater-rows";
import { buildRowActions } from "./row-action-menu";
import { RowActions } from "./row-actions";
import { RowKeyInputs } from "./row-key-inputs";
import { RowItem } from "./row-item";
import { rowTemplatesOf, type RowTemplate } from "./row-templates";
import { columnsFromSchema, TableRows } from "./table-rows";
import { useFlipReorder } from "./use-flip-reorder";
import { useRowCollection } from "./use-row-collection";

const EMPTY_TEMPLATE: Node[] = [];

export const BuilderComponent: RendererComponent<"field.builder"> = ({ node }) => {
  const props = node.props;
  const name = props.name;
  const templates = rowTemplatesOf(node) ?? [];
  const { errors } = useFormContext();
  const { hidden, required } = useDependentField(node);
  const { path, rows, onField, onRemove, onMove, onDuplicate, append } = useRowCollection(
    name,
    props.defaultItems ?? 0,
  );
  const { t } = useT("lattice");
  const orderSignature = rows.map((r) => String(r[ROW_ID_KEY] ?? "")).join(",");
  const registerRow = useFlipReorder(orderSignature);
  const atMax = props.maxItems != null && rows.length >= props.maxItems;
  const atMin = props.minItems != null && rows.length <= props.minItems;
  const isTable = props.layout === "table";

  const templateFor = (type: unknown): RowTemplate | undefined =>
    templates.find((template) => template.type === type);
  const options: AddRowOption[] = templates.map((template) => ({
    type: template.type,
    label: template.label,
  }));

  if (hidden) {
    return null;
  }

  const primary = templates[0];
  const tableRows = rows.map((row, index) => {
    const template = templateFor(row.type);
    const isPrimary = !!template && !!primary && template.type === primary.type;
    return {
      key: String(row[ROW_ID_KEY] ?? index),
      index,
      row,
      template: template?.schema ?? EMPTY_TEMPLATE,
      span: !isPrimary,
      heading: template?.label ?? `Unknown block: ${String(row.type)}`,
    };
  });

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
        <RowKeyInputs path={path} rows={rows} rowKey="type" />
        {isTable ? (
          <>
            <TableRows
              base={path}
              columns={columnsFromSchema(primary?.schema ?? [])}
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
          </>
        ) : (
          rows.map((row, index) => {
            const template = templateFor(row.type);
            const key = String(row[ROW_ID_KEY] ?? index);

            return (
              <div key={key} ref={(el) => registerRow(key, el)} data-flip-key={key}>
                {template ? (
                  <RowItem
                    base={path}
                    index={index}
                    row={row}
                    template={template.schema ?? EMPTY_TEMPLATE}
                    heading={template.label}
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
                ) : (
                  <div
                    data-test={`repeater-${name}-row-${index}`}
                    className="flex items-center justify-between rounded-lt border border-dashed border-lt-border p-4 text-sm text-lt-muted-fg"
                  >
                    <span>Unknown block: {String(row.type)}</span>
                    <RowActions
                      actions={buildRowActions(props.rowActions, {
                        index,
                        removable: !atMin,
                        onRemove,
                        onDuplicate,
                        t,
                      })}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}

        {!atMax && (
          <AddRowMenu
            addLabel={props.addLabel ?? "Add"}
            options={options}
            onSelect={(type) => append({ type })}
          />
        )}
      </div>
    </FormFieldFrame>
  );
};
