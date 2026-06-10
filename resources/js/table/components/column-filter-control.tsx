import { Filter, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ControlType, FilterOperator } from "@lattice/lattice/generated/types";
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
  const filter = column.filter;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) {
      return;
    }

    function close(event: MouseEvent): void {
      const target = event.target as Node;

      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    }

    function handleKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function dismiss(): void {
      setOpen(false);
    }

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);

    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);

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

  function toggle(): void {
    if (open) {
      setOpen(false);

      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();

    if (rect) {
      setPosition({ top: rect.bottom + 4, left: rect.left });
    }

    setOpen(true);
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex-1">
        <FilterValueInput
          type={type}
          label={column.label}
          value={primary?.clause.value ?? ""}
          processing={processing}
          withSearchIcon={type === "text" || type === "number"}
          onCommit={commitPrimary}
          onClear={primary ? () => onRemove(primary.index) : undefined}
        />
      </div>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`${column.label} filters`}
        className="relative inline-flex size-9 items-center justify-center rounded-lt-sm border border-lt-border disabled:opacity-50 data-[open=true]:border-lt-primary"
        data-open={open}
        disabled={processing}
        onClick={toggle}
      >
        <Filter aria-hidden="true" className="size-4" />
        {clauses.length > 0 && (
          <span className="absolute -right-1.5 -top-1.5 inline-flex size-4 items-center justify-center rounded-full bg-lt-primary text-[10px] font-medium text-lt-primary-fg">
            {clauses.length}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-50 w-80 rounded-lt border border-lt-border bg-lt-bg p-4 shadow-lg"
            style={{ top: position.top, left: position.left }}
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
          </div>,
          document.body,
        )}
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
  operators: FilterOperator[];
  defaultOperator: FilterOperator;
  processing: boolean;
  onAdd: (clause: FilterClause) => void;
  onUpdate: (index: number, clause: FilterClause) => void;
  onRemove: (index: number) => void;
}) {
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-lt-sm bg-lt-muted px-3 py-2 text-sm font-medium hover:bg-lt-muted/70 disabled:opacity-50"
          disabled={processing}
          onClick={() => setAdding(true)}
        >
          <Plus aria-hidden="true" className="size-4" />
          Add filter
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
  type: ControlType;
  operators: FilterOperator[];
  clause: FilterClause;
  processing: boolean;
  onOperator: (operator: FilterOperator) => void;
  onValue: (value: string) => void;
  onRemove: () => void;
}) {
  const valueless = VALUELESS_FILTER_OPERATORS.has(clause.operator);

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        {operators.length > 1 ? (
          <select
            aria-label={`${column.label} operator`}
            className="h-9 flex-1 rounded-lt-sm border border-lt-input bg-lt-bg px-2 text-sm font-normal"
            disabled={processing}
            value={clause.operator}
            onChange={(event) => onOperator(event.target.value as FilterOperator)}
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
          aria-label={`Remove ${column.label} filter`}
          className="inline-flex size-9 items-center justify-center rounded-lt-sm border border-lt-border hover:bg-lt-muted disabled:opacity-50"
          disabled={processing}
          onClick={onRemove}
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </button>
      </div>
      {!valueless && (
        <FilterValueInput
          type={type}
          label={column.label}
          ariaLabel={`${column.label} filter value`}
          value={clause.value}
          processing={processing}
          onCommit={onValue}
          onClear={() => onValue("")}
        />
      )}
    </div>
  );
}
