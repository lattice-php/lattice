import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { useTimezone } from "@lattice-php/lattice/i18n";
import { DatePickerControl } from "./date-picker-control";
import { SimpleField } from "./simple-field";

export const DateTimeInputComponent: RendererComponent<"field.date-time-input"> = ({ node }) => {
  const props = node.props;
  const { timezone } = useTimezone();

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, value, readOnly, disabled, change, blur }) => (
        <DatePickerControl
          autoFocus={props.autoFocus ?? false}
          disabled={disabled}
          label={props.label ?? props.name}
          max={props.max}
          min={props.min}
          mode="date-time"
          name={name}
          onBlur={blur}
          onChange={change}
          readOnly={readOnly}
          step={props.step}
          tabIndex={props.tabIndex ?? undefined}
          testId={testId ?? props.name}
          timezone={timezone}
          value={value}
        />
      )}
    </SimpleField>
  );
};
