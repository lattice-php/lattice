import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice/core/types";
import { FormValuesProvider } from "../values";
import { DateInputComponent } from "./date-input";

function renderField(node: Node<"form.date-input">, initial: Record<string, unknown> = {}) {
  return render(
    <FormValuesProvider initial={initial}>
      <DateInputComponent node={node}>{null}</DateInputComponent>
    </FormValuesProvider>,
  );
}

describe("DateInputComponent", () => {
  it("renders a date input seeded from the store", () => {
    renderField(
      { type: "form.date-input", props: { name: "due", label: "Due" } },
      { due: "2026-06-08" },
    );

    const input = screen.getByLabelText("Due");
    expect(input).toHaveAttribute("type", "date");
    expect(input).toHaveValue("2026-06-08");
  });

  it("hides when its visible condition fails", () => {
    renderField(
      {
        type: "form.date-input",
        props: {
          name: "due",
          label: "Due",
          conditions: { visible: [{ field: "scheduled", operator: "=", value: "1" }] },
        },
      },
      { scheduled: "0" },
    );

    expect(screen.queryByLabelText("Due")).not.toBeInTheDocument();
  });
});
