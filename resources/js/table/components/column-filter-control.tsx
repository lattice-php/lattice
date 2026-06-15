import { Icon } from "@lattice-php/lattice/icons";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lattice-php/lattice/core/components/popover";
import { useT } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { FilterData, FilterType, Op } from "@lattice-php/lattice/types/generated";
import { operatorLabel, VALUELESS_FILTER_OPERATORS } from "../query";
import type { FilterClause, TableColumn } from "../types";
import { type FilterOptionSearch, TableFilterControl } from "./filter-controls";
import { fieldClass, FilterValueInput } from "./filter-value-input";

type ColumnClause = { clause: FilterClause; index: number };

export function ColumnFilterControl({
  column,
  clauses,
  processing,
  onAdd,
  onUpdate,
  onRemove,
  onSearch,
}: {
  column: TableColumn;
  clauses: ColumnClause[];
  processing: boolean;
  onAdd: (clause: FilterClause) => void;
  onUpdate: (index: number, clause: FilterClause) => void;
  onRemove: (index: number) => void;
  onSearch?: FilterOptionSearch;
}) {
  const { t } = useT("lattice");
  const filter = column.filter;

  if (!filter) {
    return null;
  }

  if (filter.control === "select") {
    return (
      <ColumnSelectFilter
        column={column}
        clauses={clauses}
        processing={processing}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onSearch={onSearch}
      />
    );
  }

  const type = filter.type ?? "text";
  const operators = filter.operators ?? [];
  const defaultOperator = filter.defaultOperator ?? operators[0] ?? "eq";
  const primary = clauses.find((entry) => entry.clause.operator === defaultOperator) ?? clauses[0];

  function commitPrimary(value: string): void {
    if (value === "") {
      if (primary) {
        onRemove(primary.index);
      }

      return;
    }

    if (primary) {
      onUpdate(primary.index, { ...primary.clause, value });
    } else {
      onAdd({ field: column.key, operator: defaultOperator, value });
    }
  }

  return (
    <div className="flex min-w-0 max-w-80 items-stretch">
      <div className="min-w-0 flex-1">
        <FilterValueInput
          type={type}
          label={column.label}
          value={primary?.clause.value ?? ""}
          processing={processing}
          withSearchIcon={type === "text" || type === "number"}
          grouped
          testId={`filter-${column.key}-value`}
          onCommit={commitPrimary}
          onClear={primary ? () => onRemove(primary.index) : undefined}
        />
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={t("filter.columnFilters", "{{label}} filters", { label: column.label })}
            data-test={`filter-${column.key}`}
            className="relative -ml-px inline-flex size-9 shrink-0 items-center justify-center rounded-r-lt-sm border border-lt-input disabled:opacity-50 data-[state=open]:z-10 data-[state=open]:border-lt-primary"
            disabled={processing}
          >
            <Icon name="filter" aria-hidden="true" className="size-lt-icon-md" />
            {clauses.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex size-4 items-center justify-center rounded-full bg-lt-primary text-xs font-medium text-lt-primary-fg">
                {clauses.length}
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-80 p-4">
          <FilterClauseList
            column={column}
            clauses={clauses}
            operators={operators}
            defaultOperator={defaultOperator}
            processing={processing}
            onAdd={onAdd}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function serializeColumnValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(",");
  }

  return typeof value === "string" ? value : "";
}

/**
 * Renders a column's option dropdown by reusing the shared table-filter select
 * control, mapping its value to/from a single `eq` clause (or an `in` clause
 * carrying a comma-joined value when the column is `multiple`).
 */
function ColumnSelectFilter({
  column,
  clauses,
  processing,
  onAdd,
  onUpdate,
  onRemove,
  onSearch,
}: {
  column: TableColumn;
  clauses: ColumnClause[];
  processing: boolean;
  onAdd: (clause: FilterClause) => void;
  onUpdate: (index: number, clause: FilterClause) => void;
  onRemove: (index: number) => void;
  onSearch?: FilterOptionSearch;
}) {
  const filter = column.filter;

  if (!filter) {
    return null;
  }

  const multiple = filter.multiple;
  const operator = filter.defaultOperator;
  const active = clauses.find((entry) => entry.clause.operator === operator) ?? clauses[0];
  const value: unknown = multiple
    ? active?.clause.value
      ? active.clause.value.split(",")
      : []
    : (active?.clause.value ?? "");

  const data: FilterData = {
    key: column.key,
    label: column.label,
    type: "select",
    props: { options: filter.options, multiple, searchable: filter.searchable, placeholder: null },
  };

  function change(next: unknown): void {
    const serialized = serializeColumnValue(next);

    if (serialized === "") {
      if (active) {
        onRemove(active.index);
      }

      return;
    }

    if (active) {
      onUpdate(active.index, { ...active.clause, operator, value: serialized });
    } else {
      onAdd({ field: column.key, operator, value: serialized });
    }
  }

  return (
    <TableFilterControl
      filter={data}
      value={value}
      processing={processing}
      onChange={change}
      onSearch={onSearch}
    />
  );
}

function FilterClauseList({
  column,
  clauses,
  operators,
  defaultOperator,
  processing,
  onAdd,
  onUpdate,
  onRemove,
}: {
  column: TableColumn;
  clauses: ColumnClause[];
  operators: Op[];
  defaultOperator: Op;
  processing: boolean;
  onAdd: (clause: FilterClause) => void;
  onUpdate: (index: number, clause: FilterClause) => void;
  onRemove: (index: number) => void;
}) {
  const { t } = useT("lattice");
  const type = column.filter?.type ?? "text";
  const [draftOperator, setDraftOperator] = useState(defaultOperator);
  const [adding, setAdding] = useState(clauses.length === 0);

  return (
    <div className="grid gap-3">
      {clauses.map((entry) => (
        <FilterClauseRow
          key={entry.index}
          column={column}
          type={type}
          operators={operators}
          clause={entry.clause}
          processing={processing}
          onOperator={(operator) => onUpdate(entry.index, { ...entry.clause, operator })}
          onValue={(value) =>
            value === "" ? onRemove(entry.index) : onUpdate(entry.index, { ...entry.clause, value })
          }
          onRemove={() => onRemove(entry.index)}
        />
      ))}

      {adding && (
        <FilterClauseRow
          column={column}
          type={type}
          operators={operators}
          clause={{ field: column.key, operator: draftOperator, value: "" }}
          processing={processing}
          onOperator={(operator) => {
            if (VALUELESS_FILTER_OPERATORS.has(operator)) {
              onAdd({ field: column.key, operator, value: "" });
              setDraftOperator(defaultOperator);
              setAdding(false);
              return;
            }
            setDraftOperator(operator);
          }}
          onValue={(value) => {
            if (value !== "") {
              onAdd({ field: column.key, operator: draftOperator, value });
              setDraftOperator(defaultOperator);
              setAdding(false);
            }
          }}
          onRemove={() => setAdding(false)}
        />
      )}

      <div className="border-t border-lt-border pt-3">
        <button
          type="button"
          data-test={`filter-${column.key}-add`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lt-sm bg-lt-muted px-3 py-2 text-sm font-medium hover:bg-lt-muted/70 disabled:opacity-50"
          disabled={processing}
          onClick={() => setAdding(true)}
        >
          <Icon name="plus" aria-hidden="true" className="size-lt-icon-md" />
          {t("filter.add", "Add filter")}
        </button>
      </div>
    </div>
  );
}

function FilterClauseRow({
  column,
  type,
  operators,
  clause,
  processing,
  onOperator,
  onValue,
  onRemove,
}: {
  column: TableColumn;
  type: FilterType;
  operators: Op[];
  clause: FilterClause;
  processing: boolean;
  onOperator: (operator: Op) => void;
  onValue: (value: string) => void;
  onRemove: () => void;
}) {
  const { t } = useT("lattice");
  const valueless = VALUELESS_FILTER_OPERATORS.has(clause.operator);

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        {operators.length > 1 ? (
          <select
            aria-label={t("filter.operator", "{{label}} operator", { label: column.label })}
            data-test={`filter-${column.key}-operator`}
            className={cn(fieldClass, "flex-1")}
            disabled={processing}
            value={clause.operator}
            onChange={(event) => onOperator(event.target.value as Op)}
          >
            {operators.map((operator) => (
              <option key={operator} value={operator}>
                {operatorLabel(operator)}
              </option>
            ))}
          </select>
        ) : (
          <span className="flex-1 text-sm font-medium">{operatorLabel(clause.operator)}</span>
        )}
        <button
          type="button"
          aria-label={t("filter.remove", "Remove {{label}} filter", { label: column.label })}
          data-test={`filter-${column.key}-remove`}
          className="inline-flex size-9 items-center justify-center rounded-lt-sm border border-lt-border hover:bg-lt-muted disabled:opacity-50"
          disabled={processing}
          onClick={onRemove}
        >
          <Icon name="trash-2" aria-hidden="true" className="size-lt-icon-md" />
        </button>
      </div>
      {!valueless && (
        <FilterValueInput
          type={type}
          label={column.label}
          ariaLabel={t("filter.value", "{{label}} filter value", { label: column.label })}
          value={clause.value}
          processing={processing}
          onCommit={onValue}
          onClear={() => onValue("")}
        />
      )}
    </div>
  );
}
