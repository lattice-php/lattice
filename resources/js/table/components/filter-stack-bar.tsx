import { Icon } from "@lattice-php/lattice/icons";
import { useT } from "@lattice-php/lattice/i18n";
import { operatorLabel, VALUELESS_FILTER_OPERATORS } from "../query";
import type { FilterClause, TableColumn } from "../types";

export function FilterStackBar({
  filters,
  columnsByKey,
  processing,
  onRemove,
}: {
  filters: FilterClause[];
  columnsByKey: Map<string, TableColumn>;
  processing: boolean;
  onRemove: (index: number) => void;
}) {
  const { t } = useT("lattice");

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-lt-border px-4 py-2.5 text-sm">
      {filters.map((clause, index) => {
        const label = columnsByKey.get(clause.field)?.label ?? clause.field;
        const valueless = VALUELESS_FILTER_OPERATORS.has(clause.operator);

        return (
          <span
            key={`${clause.field}-${clause.operator}-${index}`}
            className="inline-flex items-center gap-1.5"
          >
            <span>
              {valueless
                ? `${label} ${operatorLabel(clause.operator)}`
                : `${label} ${operatorLabel(clause.operator)}: `}
              {!valueless && <span className="font-semibold">{clause.value}</span>}
            </span>
            <button
              type="button"
              data-test={`filter-chip-${clause.field}-remove`}
              className="inline-flex size-5 items-center justify-center rounded-lt-sm text-lt-muted-fg hover:bg-lt-muted disabled:opacity-50"
              disabled={processing}
              aria-label={t("filter.remove", "Remove {{label}} filter", { label })}
              onClick={() => onRemove(index)}
            >
              <Icon name="x" aria-hidden="true" className="size-lt-icon-sm" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
