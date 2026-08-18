import { type ComponentProps, useEffect, useRef } from "react";
import { cn } from "./lib/utils";
import { pillClassName } from "./pill";

export type SegmentedPillOption = {
  label: string;
  value: string;
};

export type SegmentedPillsProps = Omit<ComponentProps<"div">, "children" | "onSelect" | "ref"> & {
  ariaLabel?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  name: string;
  onSelect: (value: string) => void;
  options: SegmentedPillOption[];
  tabIndex?: number;
  value: string;
};

export function SegmentedPills({
  ariaLabel,
  autoFocus = false,
  className,
  disabled = false,
  name,
  onSelect,
  options,
  tabIndex,
  value,
  ...props
}: SegmentedPillsProps) {
  const groupRef = useRef<HTMLDivElement>(null);

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
        const isSelected = value === option.value;

        return (
          <button
            aria-checked={isSelected}
            data-test={`${name}-${option.value}`}
            className={cn(pillClassName(isSelected), disabled && "cursor-not-allowed opacity-60")}
            disabled={disabled}
            key={option.value}
            onClick={() => onSelect(option.value)}
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
