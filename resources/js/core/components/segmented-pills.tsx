import type { Option } from "@bambamboole/lattice/core/props";
import { cn } from "@bambamboole/lattice/lib/utils";

/**
 * Presentational segmented pill group. Used by the form choice field (bound to a
 * form value) and the core segmented control (standalone, emits an event).
 */
export function SegmentedPills({
  ariaLabel,
  disabled = false,
  onSelect,
  options,
  tabIndex,
  value,
}: {
  ariaLabel?: string;
  disabled?: boolean;
  onSelect: (value: string) => void;
  options: Option[];
  tabIndex?: number;
  value: string;
}) {
  return (
    <div
      aria-label={ariaLabel}
      className="inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-lt bg-lt-muted p-1"
      role="radiogroup"
    >
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            aria-checked={isSelected}
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
