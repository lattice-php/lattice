import type { Node, RendererComponent } from "@lattice-php/lattice/core/types";
import { useT } from "@lattice-php/lattice/i18n";
import { FormFieldFrame } from "../base/field";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { BlockAddMenu, type BlockOption } from "./block-add-menu";
import { ROW_ID_KEY } from "./repeater-rows";
import { buildRowActions } from "./row-action-menu";
import { RowActions } from "./row-actions";
import { RowItem } from "./row-item";
import { columnsFromSchema, TableRows } from "./table-rows";
import { useFlipReorder } from "./use-flip-reorder";
import { useRowCollection } from "./use-row-collection";

type Block = { type: string; label: string; schema: Node[] };

const EMPTY_TEMPLATE: Node[] = [];

export const BuilderComponent: RendererComponent<"field.builder"> = ({ node }) => {
  const props = node.props;
  const name = props.name;
  const blocks = ((node as unknown as { blocks?: Block[] }).blocks ?? []) as Block[];
  const { errors } = useFormContext();
  const { hidden, required } = useDependentField(node);
  const { rows, onField, onRemove, onMove, onDuplicate, append } = useRowCollection(
    name,
    props.defaultItems ?? 0,
  );
  const { t } = useT("lattice");
  const orderSignature = rows.map((r) => String(r[ROW_ID_KEY] ?? "")).join(",");
  const registerRow = useFlipReorder(orderSignature);
  const atMax = props.maxItems != null && rows.length >= props.maxItems;
  const atMin = props.minItems != null && rows.length <= props.minItems;
  const isTable = props.layout === "table";

  const blockFor = (type: unknown): Block | undefined => blocks.find((b) => b.type === type);
  const options: BlockOption[] = blocks.map((b) => ({
    type: b.type,
    label: b.label,
  }));

  if (hidden) {
    return null;
  }

  const hiddenTypeInputs = rows.map((row, index) => (
    <input
      key={String(row[ROW_ID_KEY] ?? index)}
      type="hidden"
      name={`${name}[${index}][type]`}
      value={String(row.type ?? "")}
    />
  ));

  const primary = blocks[0];
  const tableRows = rows.map((row, index) => {
    const block = blockFor(row.type);
    const isPrimary = !!block && !!primary && block.type === primary.type;
    return {
      key: String(row[ROW_ID_KEY] ?? index),
      index,
      row,
      template: block?.schema ?? EMPTY_TEMPLATE,
      span: !isPrimary,
      heading: block?.label ?? `Unknown block: ${String(row.type)}`,
    };
  });

  return (
    <FormFieldFrame
      error={errors[name]}
      helperText={props.helperText ?? undefined}
      tooltip={props.tooltip ?? undefined}
      label={props.label ?? ""}
      name={name}
      required={required}
    >
      <div className="flex flex-col gap-3">
        {isTable ? (
          <>
            {hiddenTypeInputs}
            <TableRows
              base={name}
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
            const block = blockFor(row.type);
            const key = String(row[ROW_ID_KEY] ?? index);

            return (
              <div key={key} ref={(el) => registerRow(key, el)} data-flip-key={key}>
                <input
                  type="hidden"
                  name={`${name}[${index}][type]`}
                  value={String(row.type ?? "")}
                />
                {block ? (
                  <RowItem
                    base={name}
                    index={index}
                    row={row}
                    template={block.schema ?? EMPTY_TEMPLATE}
                    heading={block.label}
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
          <BlockAddMenu
            addLabel={props.addLabel ?? "Add"}
            blocks={options}
            onSelect={(type) => append({ type })}
          />
        )}
      </div>
    </FormFieldFrame>
  );
};
