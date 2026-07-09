import { Icon } from "@lattice-php/lattice/icons";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lattice-php/lattice/core/components/popover";
import { useT } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import type {
  ColumnFilterOption,
  FilterData,
  FilterType,
  Option,
  Op,
} from "@lattice-php/lattice/types/generated";
import { operatorLabel, VALUELESS_FILTER_OPERATORS } from "../query";
import type { FilterClause, TableColumn } from "../types";
import { TableFilterControl } from "./filter-controls";
import { fieldClass, FilterValueInput } from "./filter-value-input";

type ColumnClause = { clause: FilterClause; index: number };

export function ColumnFilterControl({
  column,
  clauses,
  processing,
  onAdd,
  onUpdate,
  onRemove,
  onReplace,
  onSearch,
}: {
  column: TableColumn;
  clauses: ColumnClause[];
  processing: boolean;
  onAdd: (clause: FilterClause) => void;
  onUpdate: (index: number, clause: FilterClause) => void;
  onRemove: (index: number) => void;
  onReplace: (field: string, clauses: FilterClause[]) => void;
  onSearch?: (query: string, signal?: AbortSignal) => Promise<Option[]>;
}) {
  const { t } = useT("lattice");
  const { filter, label } = column.props;

  if (!filter) {
    return null;
  }

  if (filter.control === "filter.select") {
    return (
      <ColumnSelectFilter
        column={column}
        clauses={clauses}
        processing={processing}
        onReplace={onReplace}
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
          label={label}
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
            aria-label={t("table.filter.columnFilters", "{{label}} filters", {
              label,
            })}
            data-test={`filter-${column.key}`}
            className="relative -ml-px inline-flex size-lt-control-md shrink-0 items-center justify-center rounded-r-lt-sm border border-lt-input disabled:opacity-50 data-[state=open]:z-10 data-[state=open]:border-lt-primary"
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

function ColumnSelectFilter({
  column,
  clauses,
  processing,
  onReplace,
  onSearch,
}: {
  column: TableColumn;
  clauses: ColumnClause[];
  processing: boolean;
  onReplace: (field: string, clauses: FilterClause[]) => void;
  onSearch?: (query: string, signal?: AbortSignal) => Promise<Option[]>;
}) {
  const { filter, label } = column.props;

  if (!filter) {
    return null;
  }

  const multiple = filter.multiple;
  const operator = filter.defaultOperator;
  const clauseOptions = filter.clauseOptions ?? [];
  const activeClauseOption = findActiveClauseOption(
    clauses.map((entry) => entry.clause),
    clauseOptions,
  );
  const active = clauses.find((entry) => entry.clause.operator === operator) ?? clauses[0];
  const value: unknown = activeClauseOption
    ? activeClauseOption.value
    : multiple
      ? active?.clause.value
        ? active.clause.value.split(",")
        : []
      : (active?.clause.value ?? "");

  const data: FilterData = {
    key: column.key,
    label,
    type: "filter.select",
    schema: [
      {
        type: "field.select",
        key: column.key,
        props: {
          name: "value",
          label,
          options: filter.options,
          multiple,
          searchable: filter.searchable,
          placeholder: null,
        },
      },
    ],
    props: { options: filter.options, multiple, searchable: filter.searchable, placeholder: null },
  };

  function change(next: unknown): void {
    const serialized = serializeColumnValue(filterValue(next).value);

    if (serialized === "") {
      onReplace(column.key, []);

      return;
    }

    const clauseOption = clauseOptions.find((option) => option.value === serialized);

    if (clauseOption) {
      onReplace(column.key, clausesForOption(column.key, clauseOption));

      return;
    }

    onReplace(column.key, [{ field: column.key, operator, value: serialized }]);
  }

  return (
    <TableFilterControl
      filter={data}
      value={{ value }}
      processing={processing}
      onChange={change}
      onSearch={onSearch ? (_field, query, signal) => onSearch(query, signal) : undefined}
    />
  );
}

function filterValue(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function clausesForOption(field: string, option: ColumnFilterOption): FilterClause[] {
  return option.clauses.map((clause) => ({
    field,
    operator: clause.operator,
    value: clause.value,
  }));
}

function findActiveClauseOption(
  clauses: FilterClause[],
  options: ColumnFilterOption[],
): ColumnFilterOption | undefined {
  return options.find((option) => clausesMatch(clauses, clausesForOption("", option)));
}

function clausesMatch(active: FilterClause[], expected: FilterClause[]): boolean {
  if (active.length !== expected.length) {
    return false;
  }

  return expected.every((clause) =>
    active.some(
      (current) => current.operator === clause.operator && current.value === clause.value,
    ),
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
  const type = column.props.filter?.type ?? "text";
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
          {t("table.filter.add", "Add filter")}
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
  const { label } = column.props;
  const valueless = VALUELESS_FILTER_OPERATORS.has(clause.operator);

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        {operators.length > 1 ? (
          <select
            aria-label={t("table.filter.operator", "{{label}} operator", { label })}
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
          aria-label={t("table.filter.remove", "Remove {{label}} filter", { label })}
          data-test={`filter-${column.key}-remove`}
          className="inline-flex size-lt-control-md items-center justify-center rounded-lt-sm border border-lt-border hover:bg-lt-muted disabled:opacity-50"
          disabled={processing}
          onClick={onRemove}
        >
          <Icon name="trash-2" aria-hidden="true" className="size-lt-icon-md" />
        </button>
      </div>
      {!valueless && (
        <FilterValueInput
          type={type}
          label={label}
          ariaLabel={t("table.filter.value", "{{label}} filter value", { label })}
          value={clause.value}
          processing={processing}
          onCommit={onValue}
          onClear={() => onValue("")}
        />
      )}
    </div>
  );
}
