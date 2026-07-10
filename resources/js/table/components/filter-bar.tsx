import { Icon } from "@lattice-php/lattice/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@lattice-php/lattice/ui/popover";
import { useT } from "@lattice-php/lattice/i18n";
import type { Option } from "@lattice-php/lattice/types/generated";
import { isActiveFilterValue } from "../lib/filter-values";
import { operatorLabel, VALUELESS_FILTER_OPERATORS } from "../lib/query";
import type { FilterClause, FilterNode, TableColumn, TableFilterIndicator } from "../types";
import { TableFilterControl } from "./filter-controls";

export function FilterBar({
  clauses,
  columnsByKey,
  indicators,
  processing,
  onRemoveClause,
  onChange,
  onReset,
}: {
  clauses: FilterClause[];
  columnsByKey: Map<string, TableColumn>;
  indicators: TableFilterIndicator[];
  processing: boolean;
  onRemoveClause: (index: number) => void;
  onChange: (key: string, value: unknown) => void;
  onReset: () => void;
}) {
  const { t } = useT("lattice");

  if (clauses.length === 0 && indicators.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-lt-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {clauses.map((clause, index) => {
          const label = columnsByKey.get(clause.field)?.props.label ?? clause.field;
          const valueless = VALUELESS_FILTER_OPERATORS.has(clause.operator);

          return (
            <FilterChip
              key={`${clause.field}-${clause.operator}-${index}`}
              label={`${label} ${operatorLabel(clause.operator)}`}
              value={valueless ? "" : clause.value}
              removeTestId={`filter-chip-${clause.field}-remove`}
              removeLabel={t("table.filter.remove", "Remove {{label}} filter", { label })}
              processing={processing}
              onRemove={() => onRemoveClause(index)}
            />
          );
        })}
        {indicators.map((indicator) => (
          <FilterChip
            key={`${indicator.filter}:${indicator.label}:${indicator.value}`}
            label={indicator.label}
            value={indicator.value}
            removeTestId={`table-filter-chip-${indicator.filter}-remove`}
            removeLabel={t("table.filter.remove", "Remove {{label}} filter", {
              label: indicator.label,
            })}
            processing={processing}
            onRemove={() => onChange(indicator.filter, undefined)}
          />
        ))}
        <button
          type="button"
          data-test="table-filters-reset"
          className="text-lt-muted-fg underline-offset-2 hover:underline disabled:opacity-50"
          disabled={processing}
          onClick={onReset}
        >
          {t("table.filter.resetAll", "Reset all")}
        </button>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  value,
  removeTestId,
  removeLabel,
  processing,
  onRemove,
}: {
  label: string;
  value: string;
  removeTestId: string;
  removeLabel: string;
  processing: boolean;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lt-sm bg-lt-muted px-2 py-1">
      <span>
        {value === "" ? (
          <span className="font-semibold">{label}</span>
        ) : (
          <>
            {`${label}: `}
            <span className="font-semibold">{value}</span>
          </>
        )}
      </span>
      <button
        type="button"
        data-test={removeTestId}
        className="inline-flex size-5 items-center justify-center rounded-lt-sm text-lt-muted-fg hover:bg-lt-border disabled:opacity-50"
        disabled={processing}
        aria-label={removeLabel}
        onClick={onRemove}
      >
        <Icon name="x" aria-hidden="true" className="size-lt-icon-sm" />
      </button>
    </span>
  );
}

export function FilterMenu({
  filters,
  values,
  processing,
  onChange,
  onSearch,
}: {
  filters: FilterNode[];
  values: Record<string, unknown>;
  processing: boolean;
  onChange: (key: string, value: unknown) => void;
  onSearch?: (searchKey: string, query: string, signal?: AbortSignal) => Promise<Option[]>;
}) {
  const { t } = useT("lattice");
  const active = filters.filter((filter) => isActiveFilterValue(values[filter.key]));
  const filtersLabel = t("table.filter.filters", "Filters");

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
              <TableFilterControl
                filter={filter}
                value={values[filter.key]}
                processing={processing}
                onChange={(value) => onChange(filter.key, value)}
                onSearch={
                  onSearch
                    ? (field, query, signal) =>
                        onSearch(`filter:${filter.key}.${field}`, query, signal)
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
