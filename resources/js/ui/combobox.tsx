import { Icon } from "@lattice-php/lattice/icons";
import * as React from "react";
import { useEffect, useState } from "react";
import { useT } from "@lattice-php/lattice/i18n";
import type { Option } from "@lattice-php/lattice/core/types";
import { cn } from "@lattice-php/lattice/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const SEARCH_DEBOUNCE_MS = 250;

/**
 * A popover select list with an optional search box and single/multi selection.
 *
 * Selection state is controlled by the consumer (`selected` + `onSelect`); the
 * consumer also owns option fetching. Pass `onSearch` for remote search (the
 * combobox debounces the query and renders `options` as given); omit it to
 * filter the provided `options` locally by label. The combobox closes itself
 * after a single-select.
 */
function Combobox({
  contentClassName,
  emptyLabel,
  loading = false,
  multiple = false,
  onSearch,
  onSelect,
  open,
  onOpenChange,
  options,
  searchLabel,
  searchPlaceholder,
  selected,
  showSearch = true,
  testId,
  trigger,
  triggerClassName,
  triggerProps,
}: {
  contentClassName?: string;
  emptyLabel?: string;
  loading?: boolean;
  multiple?: boolean;
  onSearch?: (query: string) => void;
  onSelect: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: Option[];
  searchLabel?: string;
  searchPlaceholder?: string;
  selected: string[];
  showSearch?: boolean;
  testId?: string;
  trigger: React.ReactNode;
  triggerClassName?: string;
  triggerProps?: React.ComponentProps<"button"> & { "data-test"?: string };
}) {
  const { t } = useT("lattice");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!onSearch || !open) {
      return;
    }

    const timer = window.setTimeout(() => onSearch(query), SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query, onSearch, open]);

  const visibleOptions = onSearch
    ? options
    : options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));

  function close(): void {
    setQuery("");
    onOpenChange(false);
  }

  function choose(value: string): void {
    onSelect(value);

    if (!multiple) {
      close();
    }
  }

  return (
    <Popover open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <PopoverTrigger asChild>
        <button type="button" className={triggerClassName} {...triggerProps}>
          {trigger}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(
          "w-[var(--radix-popover-trigger-width)] overflow-hidden p-0",
          contentClassName,
        )}
      >
        {showSearch && (
          <div className="flex items-center gap-2 border-b border-lt-border px-3 py-2">
            <input
              aria-label={searchLabel ?? t("form.search-options", "Search options")}
              data-slot="combobox-search"
              data-test={testId ? `${testId}-search` : undefined}
              className="w-full bg-transparent text-sm outline-none placeholder:text-lt-muted-fg"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              value={query}
            />
            {loading && (
              <Icon
                name="loader-2"
                aria-hidden="true"
                className="size-lt-icon-md shrink-0 animate-spin text-lt-muted-fg"
              />
            )}
          </div>
        )}

        <div className="max-h-60 overflow-y-auto p-1" role="listbox">
          {visibleOptions.length === 0 ? (
            <p className="px-3 py-2 text-sm text-lt-muted-fg">{emptyLabel}</p>
          ) : (
            visibleOptions.map((option) => {
              const isSelected = selected.includes(option.value);

              return (
                <button
                  aria-selected={isSelected}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lt-sm px-3 py-1.5 text-left text-sm transition-colors hover:bg-lt-accent hover:text-lt-accent-fg",
                    isSelected && "bg-lt-accent/60",
                  )}
                  data-slot="combobox-option"
                  data-test={testId ? `${testId}-option-${option.value}` : undefined}
                  data-value={option.value}
                  key={option.value}
                  onClick={() => choose(option.value)}
                  role="option"
                  type="button"
                >
                  {option.label}
                  {isSelected && (
                    <Icon name="check" aria-hidden="true" className="size-lt-icon-md shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { Combobox };
