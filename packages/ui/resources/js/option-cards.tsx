import { type ComponentProps, type KeyboardEvent, useEffect, useRef } from "react";
import type { Option, Schema } from "@lattice-php/core/types";
import { materializeSchema } from "@lattice-php/core/materialize";
import { Renderer } from "@lattice-php/core/renderer";
import { cn } from "./lib/utils";

const PREVIOUS_KEYS = new Set(["ArrowUp", "ArrowLeft"]);
const NEXT_KEYS = new Set(["ArrowDown", "ArrowRight"]);

/**
 * Presentational radio-card group whose options render through a bound component schema.
 */
export function OptionCards({
  ariaLabel,
  autoFocus = false,
  className,
  disabled = false,
  name,
  onSelect,
  optionSchema,
  options,
  tabIndex,
  value,
  ...props
}: Omit<ComponentProps<"div">, "children" | "onSelect" | "ref"> & {
  ariaLabel?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  name: string;
  onSelect: (value: string) => void;
  optionSchema: Schema;
  options: Option[];
  tabIndex?: number;
  value: string;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const hasSelection = options.some((option) => option.value === value);

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

  // Selection follows focus inside a radiogroup, so the arrow keys both move and
  // commit; the group keeps a single tab stop on the checked card.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (disabled || options.length === 0) {
      return;
    }

    const step = NEXT_KEYS.has(event.key) ? 1 : PREVIOUS_KEYS.has(event.key) ? -1 : 0;

    if (step === 0) {
      return;
    }

    event.preventDefault();

    const current = options.findIndex((option) => option.value === value);
    const next = options[(current + step + options.length) % options.length];

    if (!next) {
      return;
    }

    onSelect(next.value);
    groupRef.current
      ?.querySelector<HTMLButtonElement>(`[data-test="${name}-${next.value}"]`)
      ?.focus();
  };

  return (
    <div
      {...props}
      aria-label={ariaLabel}
      className={cn("grid w-full gap-2", className)}
      onKeyDown={onKeyDown}
      ref={groupRef}
      role="radiogroup"
    >
      {options.map((option, index) => {
        const isSelected = value === option.value;
        // With nothing selected the group would have no tab stop at all, so the
        // first card takes it until a choice is made.
        const isTabStop = isSelected || (!hasSelection && index === 0);

        return (
          <button
            aria-checked={isSelected}
            className={cn(
              "rounded-lt border p-4 text-left transition-colors",
              isSelected
                ? "border-lt-primary bg-lt-accent text-lt-accent-fg"
                : "border-lt-border hover:border-lt-input",
              disabled && "cursor-not-allowed opacity-60",
            )}
            data-test={`${name}-${option.value}`}
            disabled={disabled}
            key={option.value}
            onClick={() => onSelect(option.value)}
            role="radio"
            tabIndex={isTabStop ? (tabIndex ?? 0) : -1}
            type="button"
          >
            <Renderer
              nodes={materializeSchema(optionSchema, {
                ...option.data,
                label: option.label,
                value: option.value,
              })}
            />
          </button>
        );
      })}
    </div>
  );
}
