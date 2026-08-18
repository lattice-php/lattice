import type { RendererComponent } from "@lattice-php/core";
import { Button } from "@lattice-php/ui/components/button/button";
import { Popover, PopoverContent, PopoverTrigger } from "@lattice-php/ui/primitives/popover";
import { Icon } from "@lattice-php/ui/icons";
import { Input } from "@lattice-php/ui/primitives/input";
import { SimpleField } from "./simple-field";
import { TimePicker } from "./time-picker";
import { formatTimeValue, parseTimeString, secondsEnabled } from "./time-picker-columns";

export const TimeInputComponent: RendererComponent<"field.time-input"> = ({ node }) => {
  const props = node.props;
  const withSeconds = secondsEnabled(props.step);
  const triggerLabel = props.label ?? props.name;

  return (
    <SimpleField node={node} label={props.label ?? ""}>
      {({ name, testId, value, readOnly, disabled, commit, blur }, controlProps) => (
        <div className="flex gap-2">
          <Input
            {...controlProps}
            aria-label={triggerLabel}
            autoFocus={props.autoFocus ?? false}
            data-test={testId}
            disabled={disabled}
            name={name}
            onBlur={() => {
              const parsed = parseTimeString(value);

              if (parsed) {
                commit(formatTimeValue(parsed, withSeconds));
              }

              blur();
            }}
            onChange={(event) => commit(event.target.value)}
            readOnly={readOnly}
            tabIndex={props.tabIndex ?? undefined}
            type="text"
            value={value}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                aria-label={`Open ${triggerLabel} time picker`}
                disabled={disabled || readOnly}
                size="icon"
                type="button"
                variant="secondary"
              >
                <Icon name="clock" className="size-lt-icon-md" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-2">
              <TimePicker
                value={parseTimeString(value)}
                onChange={(next) => commit(formatTimeValue(next, withSeconds))}
                step={props.step}
                min={props.min}
                max={props.max}
                disabled={disabled}
                readOnly={readOnly}
                testId={`${testId}-picker`}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </SimpleField>
  );
};
