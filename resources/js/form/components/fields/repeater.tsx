import { Icon } from "@lattice/lattice/icons";
import type { Node, RendererComponent } from "@lattice/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { RowItem } from "./row-item";
import { useRowCollection } from "./use-row-collection";

const EMPTY_TEMPLATE: Node[] = [];

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
  const atMax = props.maxItems != null && rows.length >= props.maxItems;
  const atMin = props.minItems != null && rows.length <= props.minItems;

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
          <RowItem
            key={index}
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
        ))}

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
