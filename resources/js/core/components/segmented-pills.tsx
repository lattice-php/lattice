import { useEffect, useRef } from "react";
import type { Option } from "@lattice/lattice/core/types";
import { cn } from "@lattice/lattice/lib/utils";

/**
 * Presentational segmented pill group. Used by the form choice field (bound to a
 * form value) and the core segmented control (standalone, emits an event).
 */
export function SegmentedPills({
  ariaLabel,
  autoFocus = false,
  disabled = false,
  name,
  onSelect,
  options,
  tabIndex,
  value,
}: {
  ariaLabel?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  name?: string;
  onSelect: (value: string) => void;
  options: Option[];
  tabIndex?: number;
  value: string;
}) {
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
      aria-label={ariaLabel}
      className="inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-lt bg-lt-muted p-1"
      ref={groupRef}
      role="radiogroup"
    >
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            aria-checked={isSelected}
            data-test={`${name ?? "segment"}-${option.value}`}
            className={cn(
              "whitespace-nowrap rounded-lt-sm px-3 py-1.5 text-sm font-medium transition-colors",
              isSelected
                ? "bg-lt-bg text-lt-fg shadow-xs"
                : "text-lt-muted-fg hover:bg-lt-bg/60 hover:text-lt-fg",
              disabled && "cursor-not-allowed opacity-60",
            )}
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
