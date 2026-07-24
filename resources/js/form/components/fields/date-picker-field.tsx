import type { DateValue } from "@internationalized/date";
import * as datePicker from "@zag-js/date-picker";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, useMemo } from "react";
import { Button } from "@lattice-php/lattice/ui/button";
import { Icon } from "@lattice-php/lattice/icons";
import { useLocale } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import { Input } from "@lattice-php/lattice/ui/input";
import {
  formatDateDisplayValue,
  formatDateTimeDisplayValue,
  formatDateTimeValue,
  formatDateValue,
  formatTimeInputValue,
  parseDateDisplayValue,
  parseDateTimeDisplayValue,
  parseDateTimeValue,
  parseDateValue,
} from "./date-picker-value";
import { TimePicker } from "./time-picker";
import { parseTimeString } from "./time-picker-columns";

export type DatePickerFieldProps = {
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

export function DatePickerField({
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
}: DatePickerFieldProps) {
  const id = useId();
  const { locale } = useLocale();
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
    locale,
    selectionMode: "single",
    timeZone: timezone,
    closeOnSelect: mode === "date",
    format(date) {
      return mode === "date"
        ? formatDateDisplayValue(date, locale)
        : formatDateTimeDisplayValue(date, locale, timezone);
    },
    parse(text) {
      return mode === "date"
        ? parseDateDisplayValue(text, locale)
        : parseDateTimeDisplayValue(text, locale, timezone);
    },
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
  const { name: _inputName, onInput, ...inputProps } = api.getInputProps();
  const submittedValue =
    mode === "date" ? formatDateValue(selected[0]) : formatDateTimeValue(selected[0], timezone);

  return (
    <div {...api.getRootProps()} className={cn("relative", api.open && "z-lt-popover")}>
      <input type="hidden" name={name} value={submittedValue} data-test={`${testId}-value`} />
      <div {...api.getControlProps()} className="flex gap-2">
        <Input
          {...inputProps}
          aria-label={label}
          autoFocus={autoFocus}
          data-test={testId}
          disabled={disabled}
          id={name}
          onInput={(event) => {
            onInput?.(event);

            if (mode !== "date") {
              return;
            }

            const normalized = normalizeDateInputValue(event.currentTarget.value);

            if (!normalized) {
              return;
            }

            const next = parseDateValue(normalized);

            if (!next) {
              return;
            }

            event.currentTarget.value = normalized;
            api.setValue([next]);
            event.currentTarget.value = formatDateDisplayValue(next, locale);
            onChange(formatDateValue(next));
          }}
          readOnly={readOnly}
          tabIndex={tabIndex ?? undefined}
        />
        <Button
          {...api.getTriggerProps()}
          aria-label={`Open ${label || name} calendar`}
          disabled={disabled || readOnly}
          size="icon"
          type="button"
          color="secondary"
        >
          <Icon name="calendar" className="size-lt-icon-md" aria-hidden="true" />
        </Button>
      </div>
      {api.open ? (
        <div
          {...api.getPositionerProps()}
          className="absolute z-lt-popover mt-2 rounded-lt-sm border border-lt-border bg-lt-popover p-3 text-lt-popover-fg shadow-lt-md"
        >
          <div {...api.getContentProps()} className="grid gap-3">
            <div className="flex items-center justify-between gap-2">
              <Button {...api.getPrevTriggerProps()} emphasis="ghost" size="icon" type="button">
                <Icon name="chevron-left" className="size-lt-icon-md" aria-hidden="true" />
              </Button>
              <div {...api.getRangeTextProps()} className="text-sm font-medium text-lt-fg" />
              <Button {...api.getNextTriggerProps()} emphasis="ghost" size="icon" type="button">
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
              <TimePicker
                value={parseTimeString(formatTimeInputValue(selected[0], timezone))}
                onChange={(next) =>
                  api.setTime({ hour: next.hour, minute: next.minute, second: next.second })
                }
                step={step}
                disabled={disabled}
                readOnly={readOnly}
                testId={`${testId}-time`}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function normalizeDateInputValue(value: string): string | undefined {
  const compact = value.replace(/\D/g, "");

  if (compact.length !== 8) {
    return undefined;
  }

  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}
