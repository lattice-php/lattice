import type { RendererComponent } from "@lattice-php/core";
import { DatePicker } from "./date-picker";
import { SimpleField } from "./simple-field";

export const DateInputComponent: RendererComponent<"field.date-input"> = ({ node }) => {
  const props = node.props;

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, value, readOnly, disabled, change, blur }, controlProps) => (
        <DatePicker
          controlProps={controlProps}
          autoFocus={props.autoFocus ?? false}
          disabled={disabled}
          label={props.label ?? props.name}
          max={props.max || undefined}
          min={props.min || undefined}
          mode="date"
          name={name}
          onBlur={blur}
          onChange={change}
          readOnly={readOnly}
          tabIndex={props.tabIndex ?? undefined}
          testId={testId ?? props.name}
          value={value}
        />
      )}
    </SimpleField>
  );
};
