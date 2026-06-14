import { Icon } from "@lattice-php/lattice/icons";
import { useT } from "@lattice-php/lattice/i18n";
import type { FilterData, Option } from "@lattice-php/lattice/types/generated";
import { TableFilterControl } from "./filter-controls";

/**
 * The dedicated-filter toolbar above the table: a control per declared filter
 * plus a row of active-value indicator chips with individual remove and a
 * "Reset all" that clears every filter (column and dedicated alike).
 */
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
  const active = filters.filter((filter) => isActive(values[filter.key]));

  return (
    <div className="flex flex-col gap-2 border-b border-lt-border px-4 py-3">
      <div className="flex flex-wrap items-end gap-3">
        {filters.map((filter) => (
          <div key={filter.key} className="flex flex-col gap-1">
            {filter.type !== "toggle" && (
              <span className="text-xs font-medium text-lt-muted-fg">{filter.label}</span>
            )}
            <TableFilterControl
              filter={filter}
              value={values[filter.key]}
              processing={processing}
              onChange={(value) => onChange(filter.key, value)}
            />
          </div>
        ))}
      </div>
      {(active.length > 0 || hasActiveFilters) && (
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
                className="inline-flex size-5 items-center justify-center rounded text-lt-muted-fg hover:bg-lt-border disabled:opacity-50"
                disabled={processing}
                aria-label={t("filter.remove", "Remove {{label}} filter", { label: filter.label })}
                onClick={() => onChange(filter.key, undefined)}
              >
                <Icon name="x" aria-hidden="true" className="size-lt-icon-sm" />
              </button>
            </span>
          ))}
          {hasActiveFilters && (
            <button
              type="button"
              data-test="table-filters-reset"
              className="text-lt-muted-fg underline-offset-2 hover:underline disabled:opacity-50"
              disabled={processing}
              onClick={onReset}
            >
              {t("filter.resetAll", "Reset all")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function isActive(value: unknown): boolean {
  if (value == null || value === "") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object") {
    return Object.values(value).some((member) => member != null && member !== "");
  }

  return true;
}

function optionLabel(filter: FilterData, value: string): string {
  const options = Array.isArray(filter.props.options) ? (filter.props.options as Option[]) : [];

  return options.find((option) => option.value === value)?.label ?? value;
}

function displayValue(filter: FilterData, value: unknown): string {
  if (filter.type === "select") {
    if (Array.isArray(value)) {
      return value.map((item) => optionLabel(filter, String(item))).join(", ");
    }

    return optionLabel(filter, String(value));
  }

  if (filter.type === "ternary") {
    const trueLabel = typeof filter.props.trueLabel === "string" ? filter.props.trueLabel : "True";
    const falseLabel =
      typeof filter.props.falseLabel === "string" ? filter.props.falseLabel : "False";

    return value === "true" ? trueLabel : falseLabel;
  }

  if (filter.type === "date-range" && value && typeof value === "object") {
    const range = value as { from?: string; until?: string };

    return [range.from, range.until].filter((part) => part).join(" – ");
  }

  return String(value);
}
