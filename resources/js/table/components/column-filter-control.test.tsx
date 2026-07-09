import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ColumnFilter, Op } from "@lattice-php/lattice/types/generated";
import type { FilterClause, TableColumn } from "../types";
import { ColumnFilterControl } from "./column-filter-control";

function textFilter(overrides: Partial<ColumnFilter> = {}): ColumnFilter {
  return {
    enabled: true,
    type: "text",
    operators: ["eq", "neq", "contains", "empty"],
    defaultOperator: "eq",
    control: null,
    options: [],
    multiple: false,
    searchable: false,
    clauseOptions: [],
    ...overrides,
  };
}

function col(filter: ColumnFilter | null): TableColumn {
  return {
    key: "name",
    label: "Name",
    type: "column.text",
    width: "md",
    sortable: null,
    toggleable: null,
    hiddenByDefault: null,
    filter,
    columns: null,
    props: {},
    align: "start",
  };
}

function clause(operator: Op, value: string): FilterClause {
  return { field: "name", operator, value };
}

type Handlers = {
  onAdd: ReturnType<typeof vi.fn<(clause: FilterClause) => void>>;
  onUpdate: ReturnType<typeof vi.fn<(index: number, clause: FilterClause) => void>>;
  onRemove: ReturnType<typeof vi.fn<(index: number) => void>>;
  onReplace: ReturnType<typeof vi.fn<(field: string, clauses: FilterClause[]) => void>>;
};

function handlers(): Handlers {
  return {
    onAdd: vi.fn<(clause: FilterClause) => void>(),
    onUpdate: vi.fn<(index: number, clause: FilterClause) => void>(),
    onRemove: vi.fn<(index: number) => void>(),
    onReplace: vi.fn<(field: string, clauses: FilterClause[]) => void>(),
  };
}

function renderControl(
  column: TableColumn,
  clauses: { clause: FilterClause; index: number }[],
  h: Handlers,
  processing = false,
) {
  return render(
    <ColumnFilterControl
      column={column}
      clauses={clauses}
      processing={processing}
      onAdd={h.onAdd}
      onUpdate={h.onUpdate}
      onRemove={h.onRemove}
      onReplace={h.onReplace}
    />,
  );
}

describe("ColumnFilterControl", () => {
  it("renders nothing when the column has no filter", () => {
    const h = handlers();
    const { container } = renderControl(col(null), [], h);

    expect(container).toBeEmptyDOMElement();
  });

  it("delegates select-control columns to the select filter", () => {
    const h = handlers();
    renderControl(col(textFilter({ control: "select" })), [], h);

    expect(screen.queryByRole("button", { name: "Name filters" })).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Name" })).toBeInTheDocument();
  });

  describe("select control", () => {
    function selectFilter(overrides: Partial<ColumnFilter> = {}): ColumnFilter {
      return textFilter({
        control: "select",
        operators: ["eq", "neq"],
        defaultOperator: "eq",
        options: [
          { label: "Active", value: "active" },
          { label: "Draft", value: "draft" },
        ],
        clauseOptions: [],
        ...overrides,
      });
    }

    it("defaults clause options to empty when the filter omits them", () => {
      const h = handlers();
      const filter = selectFilter({
        clauseOptions: undefined as unknown as ColumnFilter["clauseOptions"],
      });

      renderControl(col(filter), [], h);

      fireEvent.change(screen.getByRole("combobox", { name: "Name" }), {
        target: { value: "active" },
      });

      expect(h.onReplace).toHaveBeenCalledWith("name", [
        { field: "name", operator: "eq", value: "active" },
      ]);
    });

    it("clears all clauses when the selection is emptied", () => {
      const h = handlers();
      renderControl(col(selectFilter()), [{ clause: clause("eq", "active"), index: 0 }], h);

      fireEvent.change(screen.getByRole("combobox", { name: "Name" }), { target: { value: "" } });

      expect(h.onReplace).toHaveBeenCalledWith("name", []);
    });

    it("emits a single clause for a plain selection", () => {
      const h = handlers();
      renderControl(col(selectFilter()), [], h);

      fireEvent.change(screen.getByRole("combobox", { name: "Name" }), {
        target: { value: "active" },
      });

      expect(h.onReplace).toHaveBeenCalledWith("name", [
        { field: "name", operator: "eq", value: "active" },
      ]);
    });

    it("expands a clause option into its underlying clauses", () => {
      const h = handlers();
      const filter = selectFilter({
        options: [{ label: "Unset", value: "unset" }],
        clauseOptions: [
          { label: "Unset", value: "unset", clauses: [{ operator: "empty", value: "" }] },
        ],
      });

      renderControl(col(filter), [], h);

      fireEvent.change(screen.getByRole("combobox", { name: "Name" }), {
        target: { value: "unset" },
      });

      expect(h.onReplace).toHaveBeenCalledWith("name", [
        { field: "name", operator: "empty", value: "" },
      ]);
    });

    it("reflects the active clause-option as the current selection", () => {
      const h = handlers();
      const filter = selectFilter({
        options: [{ label: "Unset", value: "unset" }],
        clauseOptions: [
          { label: "Unset", value: "unset", clauses: [{ operator: "empty", value: "" }] },
        ],
      });

      renderControl(col(filter), [{ clause: clause("empty", ""), index: 0 }], h);

      expect(screen.getByRole("combobox", { name: "Name" })).toHaveValue("unset");
    });

    it("reflects a plain active clause as the current selection", () => {
      const h = handlers();
      renderControl(col(selectFilter()), [{ clause: clause("eq", "draft"), index: 0 }], h);

      expect(screen.getByRole("combobox", { name: "Name" })).toHaveValue("draft");
    });

    it("derives a multi-select value from the comma-joined clause value", () => {
      const h = handlers();
      const filter = selectFilter({
        operators: ["in", "not_in"],
        defaultOperator: "in",
        multiple: true,
      });

      renderControl(col(filter), [{ clause: clause("in", "active,draft"), index: 0 }], h);

      fireEvent.click(screen.getByRole("button", { name: "Name" }));

      expect(screen.getByRole("checkbox", { name: "Active" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Draft" })).toBeChecked();
    });

    it("serializes a multi-select array selection into a comma-joined clause", () => {
      const h = handlers();
      const filter = selectFilter({
        operators: ["in", "not_in"],
        defaultOperator: "in",
        multiple: true,
      });

      renderControl(col(filter), [], h);

      fireEvent.click(screen.getByRole("button", { name: "Name" }));
      fireEvent.click(screen.getByRole("checkbox", { name: "Active" }));

      expect(h.onReplace).toHaveBeenCalledWith("name", [
        { field: "name", operator: "in", value: "active" },
      ]);
    });

    it("treats an empty multi-select clause as no selection", () => {
      const h = handlers();
      const filter = selectFilter({
        operators: ["in", "not_in"],
        defaultOperator: "in",
        multiple: true,
      });

      renderControl(col(filter), [], h);

      fireEvent.click(screen.getByRole("button", { name: "Name" }));

      expect(screen.getByRole("checkbox", { name: "Active" })).not.toBeChecked();
    });
  });

  it("adds a new clause when committing a value with no primary clause", () => {
    const h = handlers();
    renderControl(col(textFilter()), [], h);

    const input = screen.getByTestId("filter-name-value");
    fireEvent.change(input, { target: { value: "ada" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(h.onAdd).toHaveBeenCalledWith({ field: "name", operator: "eq", value: "ada" });
    expect(h.onUpdate).not.toHaveBeenCalled();
  });

  it("updates the primary clause when committing a new value", () => {
    const h = handlers();
    renderControl(col(textFilter()), [{ clause: clause("eq", "old"), index: 2 }], h);

    const input = screen.getByTestId("filter-name-value");
    fireEvent.change(input, { target: { value: "new" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(h.onUpdate).toHaveBeenCalledWith(2, { field: "name", operator: "eq", value: "new" });
    expect(h.onAdd).not.toHaveBeenCalled();
  });

  it("removes the primary clause when its value is cleared to empty", () => {
    const h = handlers();
    renderControl(col(textFilter()), [{ clause: clause("eq", "old"), index: 5 }], h);

    fireEvent.click(screen.getByTestId("filter-name-value-clear"));

    expect(h.onRemove).toHaveBeenCalledWith(5);
  });

  it("falls back to the first clause when none match the default operator", () => {
    const h = handlers();
    renderControl(col(textFilter()), [{ clause: clause("neq", "x"), index: 3 }], h);

    expect(screen.getByTestId("filter-name-value")).toHaveValue("x");
  });

  it("falls back to the text type and the eq operator when the filter omits both", () => {
    const h = handlers();
    renderControl(
      col(
        textFilter({
          type: undefined as unknown as ColumnFilter["type"],
          operators: undefined as unknown as Op[],
          defaultOperator: undefined as unknown as Op,
        }),
      ),
      [],
      h,
    );

    const input = screen.getByTestId("filter-name-value");
    expect(input).toHaveAttribute("type", "text");

    fireEvent.change(input, { target: { value: "z" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(h.onAdd).toHaveBeenCalledWith({ field: "name", operator: "eq", value: "z" });

    fireEvent.click(screen.getByTestId("filter-name"));

    expect(screen.getByLabelText("Name filter value")).toHaveAttribute("type", "text");
  });

  it("renders a number input for a number-typed filter", () => {
    const h = handlers();
    renderControl(col(textFilter({ type: "number" })), [], h);

    expect(screen.getByTestId("filter-name-value")).toHaveAttribute("type", "number");
  });

  it("does nothing when an empty value is committed with no primary clause", () => {
    const h = handlers();
    renderControl(col(textFilter()), [], h);

    const input = screen.getByTestId("filter-name-value");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(h.onRemove).not.toHaveBeenCalled();
    expect(h.onAdd).not.toHaveBeenCalled();
    expect(h.onUpdate).not.toHaveBeenCalled();
  });

  it("uses the first operator as default when no defaultOperator is configured", () => {
    const h = handlers();
    renderControl(col(textFilter({ defaultOperator: undefined as unknown as Op })), [], h);

    const input = screen.getByTestId("filter-name-value");
    fireEvent.change(input, { target: { value: "z" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(h.onAdd).toHaveBeenCalledWith({ field: "name", operator: "eq", value: "z" });
  });

  it("shows a count badge reflecting the number of active clauses", () => {
    const h = handlers();
    renderControl(
      col(textFilter()),
      [
        { clause: clause("eq", "a"), index: 0 },
        { clause: clause("neq", "b"), index: 1 },
      ],
      h,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("disables the trigger and inputs while processing", () => {
    const h = handlers();
    renderControl(col(textFilter()), [], h, true);

    expect(screen.getByTestId("filter-name")).toBeDisabled();
  });

  describe("clause list popover", () => {
    function openPopover() {
      fireEvent.click(screen.getByTestId("filter-name"));
    }

    it("renders an operator select for existing clauses and updates the operator", () => {
      const h = handlers();
      renderControl(col(textFilter()), [{ clause: clause("eq", "a"), index: 0 }], h);

      openPopover();

      const operator = screen.getByTestId("filter-name-operator");
      fireEvent.change(operator, { target: { value: "neq" } });

      expect(h.onUpdate).toHaveBeenCalledWith(0, { field: "name", operator: "neq", value: "a" });
    });

    it("removes an existing clause when its value is emptied", () => {
      const h = handlers();
      renderControl(col(textFilter()), [{ clause: clause("eq", "a"), index: 0 }], h);

      openPopover();

      const valueInputs = screen.getAllByLabelText("Name filter value");
      fireEvent.change(valueInputs[0], { target: { value: "" } });
      fireEvent.blur(valueInputs[0]);

      expect(h.onRemove).toHaveBeenCalledWith(0);
    });

    it("updates an existing clause when its value changes", () => {
      const h = handlers();
      renderControl(col(textFilter()), [{ clause: clause("eq", "a"), index: 0 }], h);

      openPopover();

      const valueInputs = screen.getAllByLabelText("Name filter value");
      fireEvent.change(valueInputs[0], { target: { value: "b" } });
      fireEvent.blur(valueInputs[0]);

      expect(h.onUpdate).toHaveBeenCalledWith(0, { field: "name", operator: "eq", value: "b" });
    });

    it("removes an existing clause via the trash button", () => {
      const h = handlers();
      renderControl(col(textFilter()), [{ clause: clause("eq", "a"), index: 4 }], h);

      openPopover();

      fireEvent.click(screen.getByTestId("filter-name-remove"));

      expect(h.onRemove).toHaveBeenCalledWith(4);
    });

    it("renders a static operator label when only one operator is allowed", () => {
      const h = handlers();
      renderControl(
        col(textFilter({ operators: ["eq"], defaultOperator: "eq" })),
        [{ clause: clause("eq", "a"), index: 0 }],
        h,
      );

      openPopover();

      expect(screen.queryByTestId("filter-name-operator")).not.toBeInTheDocument();
    });

    it("starts in adding mode when there are no clauses and adds on value commit", () => {
      const h = handlers();
      renderControl(col(textFilter()), [], h);

      openPopover();

      const valueInput = screen.getByLabelText("Name filter value");
      fireEvent.change(valueInput, { target: { value: "draft" } });
      fireEvent.blur(valueInput);

      expect(h.onAdd).toHaveBeenCalledWith({ field: "name", operator: "eq", value: "draft" });
    });

    it("ignores an empty value commit while adding", () => {
      const h = handlers();
      renderControl(col(textFilter()), [], h);

      openPopover();

      const valueInput = screen.getByLabelText("Name filter value");
      fireEvent.focus(valueInput);
      fireEvent.blur(valueInput);

      expect(h.onAdd).not.toHaveBeenCalled();
    });

    it("immediately adds a valueless clause when its operator is chosen while adding", () => {
      const h = handlers();
      renderControl(col(textFilter()), [], h);

      openPopover();

      const operator = screen.getByTestId("filter-name-operator");
      fireEvent.change(operator, { target: { value: "empty" } });

      expect(h.onAdd).toHaveBeenCalledWith({ field: "name", operator: "empty", value: "" });
    });

    it("keeps the draft operator when a value-bearing operator is chosen while adding", () => {
      const h = handlers();
      renderControl(col(textFilter()), [], h);

      openPopover();

      const operator = screen.getByTestId("filter-name-operator");
      fireEvent.change(operator, { target: { value: "contains" } });

      expect(h.onAdd).not.toHaveBeenCalled();

      const valueInput = screen.getByLabelText("Name filter value");
      fireEvent.change(valueInput, { target: { value: "foo" } });
      fireEvent.blur(valueInput);

      expect(h.onAdd).toHaveBeenCalledWith({ field: "name", operator: "contains", value: "foo" });
    });

    it("does not render a value input for a valueless existing clause", () => {
      const h = handlers();
      renderControl(col(textFilter()), [{ clause: clause("empty", ""), index: 0 }], h);

      openPopover();

      expect(screen.queryByLabelText("Name filter value")).not.toBeInTheDocument();
    });

    it("opens a fresh adding row via the add button", () => {
      const h = handlers();
      renderControl(col(textFilter()), [{ clause: clause("eq", "a"), index: 0 }], h);

      openPopover();

      expect(screen.getAllByLabelText("Name filter value")).toHaveLength(1);

      fireEvent.click(screen.getByTestId("filter-name-add"));

      expect(screen.getAllByLabelText("Name filter value")).toHaveLength(2);
    });
  });
});
