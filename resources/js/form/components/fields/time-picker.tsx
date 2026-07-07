import { type KeyboardEvent, useEffect, useRef } from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { buildTimeColumns, type TimeColumnOption, type TimeValue } from "./time-picker-columns";

type TimePickerProps = {
  value: TimeValue | null;
  onChange: (next: TimeValue) => void;
  step?: number | null;
  min?: string | null;
  max?: string | null;
  disabled?: boolean;
  readOnly?: boolean;
  labels?: { hour?: string; minute?: string; second?: string };
  testId?: string;
};

export function TimePicker({
  value,
  onChange,
  step,
  min,
  max,
  disabled = false,
  readOnly = false,
  labels,
  testId,
}: TimePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const columns = buildTimeColumns(step, { min, max, current: value });
  const current: TimeValue = value ?? { hour: 0, minute: 0, second: 0 };
  const interactive = !disabled && !readOnly;

  const columnList = [
    {
      key: "hour" as const,
      label: labels?.hour ?? "Hour",
      options: columns.hours,
      selected: current.hour,
    },
    {
      key: "minute" as const,
      label: labels?.minute ?? "Minute",
      options: columns.minutes,
      selected: current.minute,
    },
    ...(columns.seconds
      ? [
          {
            key: "second" as const,
            label: labels?.second ?? "Second",
            options: columns.seconds,
            selected: current.second,
          },
        ]
      : []),
  ];

  function focusColumn(index: number) {
    const listboxes = containerRef.current?.querySelectorAll<HTMLElement>('[role="listbox"]');
    const target = listboxes?.[index];

    if (!target) {
      return;
    }

    const active =
      target.querySelector<HTMLElement>('[data-active="true"]') ??
      target.querySelector<HTMLElement>('[role="option"]');

    active?.focus();
  }

  return (
    <div ref={containerRef} className="flex gap-1" data-test={testId}>
      {columnList.map((column, index) => (
        <TimeColumn
          key={column.key}
          label={column.label}
          options={column.options}
          selected={value ? column.selected : null}
          disabled={!interactive}
          onSelect={(optionValue) =>
            interactive && onChange({ ...current, [column.key]: optionValue })
          }
          onHorizontal={(direction) => focusColumn(index + direction)}
        />
      ))}
    </div>
  );
}

function TimeColumn({
  label,
  options,
  selected,
  disabled,
  onSelect,
  onHorizontal,
}: {
  label: string;
  options: TimeColumnOption[];
  selected: number | null;
  disabled: boolean;
  onSelect: (value: number) => void;
  onHorizontal: (direction: 1 | -1) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const enabledValues = options.filter((option) => !option.disabled).map((option) => option.value);
  const activeValue = selected ?? enabledValues[0] ?? options[0]?.value ?? 0;

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');

    active?.scrollIntoView?.({ block: "nearest" });
  }, [selected]);

  function moveTo(nextValue: number | undefined) {
    if (nextValue == null) {
      return;
    }

    listRef.current?.querySelector<HTMLElement>(`[data-value="${nextValue}"]`)?.focus();
    onSelect(nextValue);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (disabled) {
      return;
    }

    const index = enabledValues.indexOf(activeValue);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveTo(enabledValues[Math.min(index + 1, enabledValues.length - 1)]);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveTo(enabledValues[Math.max(index - 1, 0)]);
        break;
      case "Home":
        event.preventDefault();
        moveTo(enabledValues[0]);
        break;
      case "End":
        event.preventDefault();
        moveTo(enabledValues[enabledValues.length - 1]);
        break;
      case "ArrowRight":
        event.preventDefault();
        onHorizontal(1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        onHorizontal(-1);
        break;
    }
  }

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={label}
      aria-orientation="vertical"
      tabIndex={-1}
      className="flex max-h-40 w-14 flex-col overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      {options.map((option) => {
        const isSelected = selected === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={isSelected}
            aria-label={`${label} ${option.label}`}
            data-value={option.value}
            data-active={activeValue === option.value}
            disabled={disabled || option.disabled}
            tabIndex={activeValue === option.value ? 0 : -1}
            onClick={() => onSelect(option.value)}
            className={cn(
              "shrink-0 rounded-lt-sm px-2 py-1 text-sm text-lt-fg hover:bg-lt-muted",
              isSelected && "bg-lt-primary text-lt-primary-fg",
              (disabled || option.disabled) && "cursor-not-allowed opacity-40",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
