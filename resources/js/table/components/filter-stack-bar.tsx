import { Icon } from "@lattice/lattice/icons";
import { operatorLabel } from "../query";
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
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-lt-border px-4 py-2.5 text-sm">
      {filters.map((clause, index) => {
        const label = columnsByKey.get(clause.field)?.label ?? clause.field;

        return (
          <span
            key={`${clause.field}-${clause.operator}-${index}`}
            className="inline-flex items-center gap-1.5"
          >
            <span>
              {`${label} ${operatorLabel(clause.operator)}: `}
              <span className="font-semibold">{clause.value}</span>
            </span>
            <button
              type="button"
              data-test={`filter-chip-${clause.field}-remove`}
              className="inline-flex size-5 items-center justify-center rounded text-lt-muted-fg hover:bg-lt-muted disabled:opacity-50"
              disabled={processing}
              aria-label={`Remove ${label} filter`}
              onClick={() => onRemove(index)}
            >
              <Icon name="x" aria-hidden="true" className="size-3.5" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
