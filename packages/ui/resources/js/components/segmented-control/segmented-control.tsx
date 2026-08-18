import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { pillClassName } from "../../lib/pill";

export type SegmentedControlOption = {
  label: ReactNode;
  value: string;
};

export type SegmentedControlProps = Omit<ComponentProps<"div">, "children" | "ref"> & {
  autoFocus?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  onValueChange?: (value: string) => void;
  options: readonly SegmentedControlOption[];
  tabIndex?: number;
  value?: string;
};

export function SegmentedControl({
  "aria-label": ariaLabel,
  autoFocus = false,
  className,
  defaultValue,
  disabled = false,
  name,
  onValueChange,
  options,
  tabIndex,
  value,
  ...props
}: SegmentedControlProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const selectedValue = value ?? uncontrolledValue;

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const group = groupRef.current;
    const target =
      group?.querySelector<HTMLButtonElement>('button[aria-checked="true"]') ??
      group?.querySelector<HTMLButtonElement>("button");

    target?.focus();
  }, [autoFocus]);

  if (options.length === 0) {
    return null;
  }

  function select(nextValue: string): void {
    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
  }

  return (
    <div
      {...props}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-lt bg-lt-muted p-1",
        className,
      )}
      ref={groupRef}
      role="radiogroup"
    >
      {options.map((option) => {
        const isSelected = selectedValue === option.value;

        return (
          <button
            aria-checked={isSelected}
            data-test={name ? `${name}-${option.value}` : undefined}
            className={cn(pillClassName(isSelected), disabled && "cursor-not-allowed opacity-60")}
            disabled={disabled}
            key={option.value}
            onClick={() => select(option.value)}
            role="radio"
            tabIndex={tabIndex}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
