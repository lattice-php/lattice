import { Icon } from "@lattice-php/lattice/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lattice-php/lattice/core/components/popover";
import { useT } from "@lattice-php/lattice/i18n";
import type { FilterData, Option } from "@lattice-php/lattice/types/generated";
import { filterOptions, isActiveFilterValue, stringProp } from "../filter-values";
import { TableFilterControl } from "./filter-controls";

export function FilterBar({
  filters,
  values,
  processing,
  hasActiveFilters,
  onChange,
  onReset,
}: {
  filters: FilterData[];
  values: Record<string, unknown>;
  processing: boolean;
  hasActiveFilters: boolean;
  onChange: (key: string, value: unknown) => void;
  onReset: () => void;
}) {
  const { t } = useT("lattice");
  const active = filters.filter((filter) => isActiveFilterValue(values[filter.key]));

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="border-b border-lt-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {active.map((filter) => (
          <span
            key={filter.key}
            className="inline-flex items-center gap-1.5 rounded-lt-sm bg-lt-muted px-2 py-1"
          >
            <span>
              {`${filter.label}: `}
              <span className="font-semibold">{displayValue(filter, values[filter.key])}</span>
            </span>
            <button
              type="button"
              data-test={`table-filter-chip-${filter.key}-remove`}
              className="inline-flex size-5 items-center justify-center rounded-lt-sm text-lt-muted-fg hover:bg-lt-border disabled:opacity-50"
              disabled={processing}
              aria-label={t("filter.remove", "Remove {{label}} filter", {
                label: filter.label,
              })}
              onClick={() => onChange(filter.key, undefined)}
            >
              <Icon name="x" aria-hidden="true" className="size-lt-icon-sm" />
            </button>
          </span>
        ))}
        <button
          type="button"
          data-test="table-filters-reset"
          className="text-lt-muted-fg underline-offset-2 hover:underline disabled:opacity-50"
          disabled={processing}
          onClick={onReset}
        >
          {t("filter.resetAll", "Reset all")}
        </button>
      </div>
    </div>
  );
}

export function FilterMenu({
  filters,
  values,
  processing,
  onChange,
  onSearch,
}: {
  filters: FilterData[];
  values: Record<string, unknown>;
  processing: boolean;
  onChange: (key: string, value: unknown) => void;
  onSearch?: (filterKey: string, query: string) => Promise<Option[]>;
}) {
  const { t } = useT("lattice");
  const active = filters.filter((filter) => isActiveFilterValue(values[filter.key]));
  const filtersLabel = t("filter.filters", "Filters");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={filtersLabel}
          data-test="table-filters-menu"
          className="relative inline-flex size-7 shrink-0 items-center justify-center rounded-lt-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lt-ring/50 data-[state=open]:bg-lt-muted data-[state=open]:text-lt-fg"
          disabled={processing}
        >
          <Icon name="filter" aria-hidden="true" className="size-lt-icon-md" />
          {active.length > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex size-3.5 items-center justify-center rounded-full bg-lt-primary text-[10px] font-medium leading-none text-lt-primary-fg">
              {active.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4">
        <div className="grid gap-3">
          {filters.map((filter) => (
            <div key={filter.key} className="grid gap-1">
              {filter.type !== "toggle" && (
                <span className="text-xs font-medium text-lt-muted-fg">{filter.label}</span>
              )}
              <TableFilterControl
                filter={filter}
                value={values[filter.key]}
                processing={processing}
                onChange={(value) => onChange(filter.key, value)}
                onSearch={onSearch ? (query) => onSearch(filter.key, query) : undefined}
              />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function optionLabel(filter: FilterData, value: string): string {
  return filterOptions(filter).find((option) => option.value === value)?.label ?? value;
}

function displayValue(filter: FilterData, value: unknown): string {
  if (filter.type === "select") {
    if (Array.isArray(value)) {
      return value.map((item) => optionLabel(filter, String(item))).join(", ");
    }

    return optionLabel(filter, String(value));
  }

  if (filter.type === "ternary") {
    return value === "true"
      ? stringProp(filter, "trueLabel", "True")
      : stringProp(filter, "falseLabel", "False");
  }

  if (filter.type === "date-range" && value && typeof value === "object") {
    const range = value as { from?: string; until?: string };

    return [range.from, range.until].filter((part) => part).join(" – ");
  }

  return String(value);
}
