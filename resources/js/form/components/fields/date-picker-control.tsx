import type { DateValue } from "@internationalized/date";
import * as datePicker from "@zag-js/date-picker";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, useMemo } from "react";
import { Button } from "@lattice-php/lattice/core/components/button";
import { Icon } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import { Input } from "../base/input";
import {
  formatDateTimeValue,
  formatDateValue,
  parseDateTimeValue,
  parseDateValue,
} from "./date-picker-value";

export type DatePickerControlProps = {
  mode: "date" | "date-time";
  label: string;
  name: string;
  testId: string;
  value: unknown;
  min?: string | null;
  max?: string | null;
  step?: number | null;
  disabled: boolean;
  readOnly: boolean;
  autoFocus?: boolean;
  tabIndex?: number | null;
  timezone?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export function DatePickerControl({
  mode,
  label,
  name,
  testId,
  value,
  min,
  max,
  step,
  disabled,
  readOnly,
  autoFocus = false,
  tabIndex,
  timezone = "UTC",
  onChange,
  onBlur,
}: DatePickerControlProps) {
  const id = useId();
  const selected = useMemo(
    () =>
      [mode === "date" ? parseDateValue(value) : parseDateTimeValue(value, timezone)].filter(
        Boolean,
      ) as DateValue[],
    [mode, timezone, value],
  );
  const service = useMachine(datePicker.machine, {
    id,
    name,
    value: selected.length > 0 ? selected : undefined,
    min: min ? parseDateValue(min) : undefined,
    max: max ? parseDateValue(max) : undefined,
    disabled,
    readOnly,
    selectionMode: "single",
    timeZone: timezone,
    closeOnSelect: mode === "date",
    onValueChange(details) {
      const next = details.value[0];

      onChange(mode === "date" ? formatDateValue(next) : formatDateTimeValue(next, timezone));
    },
    onOpenChange(details) {
      if (!details.open) {
        onBlur?.();
      }
    },
  });
  const api = datePicker.connect(service, normalizeProps);
  const { name: _inputName, ...inputProps } = api.getInputProps();
  const inputValue =
    mode === "date" ? formatDateValue(selected[0]) : formatDateTimeValue(selected[0], timezone);

  return (
    <div {...api.getRootProps()} className="relative">
      <input type="hidden" name={name} value={inputValue} data-test={testId} />
      <div {...api.getControlProps()} className="flex gap-2">
        <Input
          {...inputProps}
          aria-label={label}
          autoFocus={autoFocus}
          data-test={`${testId}-display`}
          disabled={disabled}
          id={name}
          readOnly={readOnly}
          tabIndex={tabIndex ?? undefined}
        />
        <Button
          {...api.getTriggerProps()}
          aria-label={`Open ${label || name} calendar`}
          disabled={disabled || readOnly}
          size="icon"
          type="button"
          variant="secondary"
        >
          <Icon name="calendar" className="size-lt-icon-md" aria-hidden="true" />
        </Button>
      </div>
      {api.open ? (
        <div
          {...api.getPositionerProps()}
          className="absolute z-50 mt-2 rounded-lt-sm border border-lt-border bg-lt-popover p-3 text-lt-popover-fg shadow-lt-md"
        >
          <div {...api.getContentProps()} className="grid gap-3">
            <div className="flex items-center justify-between gap-2">
              <Button {...api.getPrevTriggerProps()} size="icon" type="button" variant="ghost">
                <Icon name="chevron-left" className="size-lt-icon-md" aria-hidden="true" />
              </Button>
              <div {...api.getRangeTextProps()} className="text-sm font-medium text-lt-fg" />
              <Button {...api.getNextTriggerProps()} size="icon" type="button" variant="ghost">
                <Icon name="chevron-right" className="size-lt-icon-md" aria-hidden="true" />
              </Button>
            </div>
            <table {...api.getTableProps()} className="w-full border-collapse text-sm">
              <thead {...api.getTableHeadProps()}>
                <tr {...api.getTableRowProps()}>
                  {api.weekDays.map((day) => (
                    <th
                      {...api.getTableHeaderProps()}
                      aria-label={day.long}
                      key={day.value.toString()}
                      className="size-8 text-center text-xs font-medium text-lt-muted-fg"
                    >
                      {day.narrow}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody {...api.getTableBodyProps()}>
                {api.weeks.map((week, weekIndex) => (
                  <tr {...api.getTableRowProps()} key={weekIndex}>
                    {week.map((day) => {
                      const state = api.getDayTableCellState({ value: day });

                      return (
                        <td
                          {...api.getDayTableCellProps({ value: day })}
                          key={day.toString()}
                          className="p-0 text-center"
                        >
                          <button
                            {...api.getDayTableCellTriggerProps({ value: day })}
                            type="button"
                            className={cn(
                              "size-8 rounded-lt-sm text-sm text-lt-fg hover:bg-lt-muted",
                              state.selected && "bg-lt-primary text-lt-primary-fg",
                              state.outsideRange && "text-lt-muted-fg",
                              state.disabled && "cursor-not-allowed opacity-40",
                            )}
                          >
                            {day.day}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {mode === "date-time" ? (
              <Input
                aria-label={`${label || name} time`}
                disabled={disabled}
                onChange={(event) => {
                  const [hour = "0", minute = "0", second = "0"] = event.target.value.split(":");

                  api.setTime({
                    hour: Number(hour),
                    minute: Number(minute),
                    second: Number(second),
                  });
                }}
                readOnly={readOnly}
                step={step ?? undefined}
                type="time"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
