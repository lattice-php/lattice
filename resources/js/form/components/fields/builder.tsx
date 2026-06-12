import type { Node, RendererComponent } from "@lattice/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { BlockAddMenu, type BlockOption } from "./block-add-menu";
import { RowItem } from "./row-item";
import { useRowCollection } from "./use-row-collection";

type Block = { type: string; label: string; schema: Node[] };

const EMPTY_TEMPLATE: Node[] = [];

export const BuilderComponent: RendererComponent<"form.builder"> = ({ node }) => {
  const props = node.props;
  const name = props.name;
  const blocks = ((node as unknown as { blocks?: Block[] }).blocks ?? []) as Block[];
  const { errors } = useFormContext();
  const { hidden, required } = useDependentField(node);
  const { rows, onField, onRemove, onMove, append } = useRowCollection(
    name,
    props.defaultItems ?? 0,
  );
  const atMax = props.maxItems != null && rows.length >= props.maxItems;
  const atMin = props.minItems != null && rows.length <= props.minItems;

  const blockFor = (type: unknown): Block | undefined => blocks.find((b) => b.type === type);
  const options: BlockOption[] = blocks.map((b) => ({ type: b.type, label: b.label }));

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
        {rows.map((row, index) => {
          const block = blockFor(row.type);

          if (!block) {
            return (
              <div
                key={index}
                data-test={`repeater-${name}-row-${index}`}
                className="rounded-lt border border-dashed border-lt-border p-4 text-sm text-lt-muted-fg"
              >
                Unknown block: {String(row.type)}
              </div>
            );
          }

          return (
            <RowItem
              key={index}
              base={name}
              index={index}
              row={row}
              template={block.schema ?? EMPTY_TEMPLATE}
              heading={block.label}
              reorderable={props.reorderable ?? false}
              isFirst={index === 0}
              isLast={index === rows.length - 1}
              removable={!atMin}
              onField={onField}
              onRemove={onRemove}
              onMove={onMove}
            />
          );
        })}

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
