import { useState } from "react";
import { operatorLabel } from "../query";
import type { FilterClause, TableColumn } from "../types";

const controlClass = "h-8 rounded-lt-sm border border-lt-input bg-lt-bg px-2 text-xs font-normal";

export function ColumnFilter({
  column,
  processing,
  onAdd,
}: {
  column: TableColumn;
  processing: boolean;
  onAdd: (clause: FilterClause) => void;
}) {
  const filter = column.filter;
  const operators = filter?.operators ?? [];
  const [operator, setOperator] = useState(filter?.defaultOperator ?? operators[0] ?? "equals");
  const [value, setValue] = useState("");

  if (!filter) {
    return null;
  }

  function add(nextValue: string): void {
    if (nextValue === "") {
      return;
    }

    onAdd({ field: column.key, operator, value: nextValue });
    setValue("");
  }

  const operatorSelect =
    operators.length > 1 ? (
      <select
        aria-label={`${column.label} operator`}
        className={controlClass}
        disabled={processing}
        value={operator}
        onChange={(event) => setOperator(event.target.value)}
      >
        {operators.map((option) => (
          <option key={option} value={option}>
            {operatorLabel(option)}
          </option>
        ))}
      </select>
    ) : null;

  if (filter.type === "boolean") {
    return (
      <select
        aria-label={`Filter ${column.label}`}
        className={`${controlClass} w-full`}
        disabled={processing}
        value=""
        onChange={(event) => add(event.target.value)}
      >
        <option value="">Filter…</option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  }

  if (filter.type === "date") {
    return (
      <div className="flex items-center gap-1">
        {operatorSelect}
        <input
          type="date"
          aria-label={`Filter ${column.label}`}
          className={`${controlClass} w-full`}
          disabled={processing}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            add(event.target.value);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {operatorSelect}
      <input
        type={filter.type === "number" ? "number" : "text"}
        aria-label={`Filter ${column.label}`}
        className={`${controlClass} w-full`}
        disabled={processing}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            add(value);
          }
        }}
      />
    </div>
  );
}
