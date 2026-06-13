import { Icon } from "@lattice-php/lattice/icons";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { useT } from "@lattice-php/lattice/i18n";
import type { FilterType, Op } from "@lattice-php/lattice/types/generated";
import { operatorLabel, VALUELESS_FILTER_OPERATORS } from "../query";
import type { FilterClause, TableColumn } from "../types";
import { FilterValueInput } from "./filter-value-input";

type ColumnClause = { clause: FilterClause; index: number };

export function ColumnFilterControl({
  column,
  clauses,
  processing,
  onAdd,
  onUpdate,
  onRemove,
}: {
  column: TableColumn;
  clauses: ColumnClause[];
  processing: boolean;
  onAdd: (clause: FilterClause) => void;
  onUpdate: (index: number, clause: FilterClause) => void;
  onRemove: (index: number) => void;
}) {
  const { t } = useT("lattice");
  const filter = column.filter;

  if (!filter) {
    return null;
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
    <div className="flex min-w-0 max-w-44 items-stretch">
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
      <Popover.Root>
        <Popover.Trigger asChild>
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
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            className="z-50 w-80 rounded-lt border border-lt-border bg-lt-bg p-4 shadow-lg"
            sideOffset={4}
          >
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
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
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
            className="h-9 flex-1 rounded-lt-sm border border-lt-input bg-lt-bg px-2 text-sm font-normal"
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
