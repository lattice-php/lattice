import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormValuesProvider } from "../values";
import { DateInputComponent } from "./date-input";

function renderField(node: Node<"field.date-input">, initial: Record<string, unknown> = {}) {
  return render(
    <FormValuesProvider initial={initial}>
      <DateInputComponent node={node}>{null}</DateInputComponent>
    </FormValuesProvider>,
  );
}

describe("DateInputComponent", () => {
  it("renders a date input seeded from the store", () => {
    renderField(fakeNode({ type: "field.date-input", props: { name: "due", label: "Due" } }), {
      due: "2026-06-08",
    });

    expect(document.querySelector('input[name="due"]')).toHaveValue("2026-06-08");
  });

  it("commits a date picked from the calendar", async () => {
    renderField(fakeNode({ type: "field.date-input", props: { name: "due", label: "Due" } }), {
      due: "2026-06-01",
    });

    fireEvent.click(screen.getByRole("button", { name: /open due calendar/i }));
    fireEvent.click(await screen.findByRole("button", { name: /19/i }));

    await waitFor(() => {
      expect(document.querySelector('input[name="due"]')).toHaveValue("2026-06-19");
    });
  });

  it("hides when its visible condition fails", () => {
    renderField(
      fakeNode({
        type: "field.date-input",
        props: {
          name: "due",
          label: "Due",
          conditions: { visible: [{ field: "scheduled", operator: "eq", value: "1" }] },
        },
      }),
      { scheduled: "0" },
    );

    expect(screen.queryByLabelText("Due")).not.toBeInTheDocument();
  });
});
