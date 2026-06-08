import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice/core/types";
import { FormValuesProvider } from "../values";
import { DateInputComponent } from "./date-input";
import { NumberInputComponent } from "./number-input";
import { TextareaComponent } from "./textarea";

function wrap(children: React.ReactNode, initial: Record<string, unknown> = {}) {
  return render(<FormValuesProvider initial={initial}>{children}</FormValuesProvider>);
}

const textareaNode = {
  type: "form.textarea",
  props: {
    name: "bio",
    label: "Bio",
    conditions: { visible: [{ field: "mode", operator: "=", value: "edit" }] },
  },
} as Node<"form.textarea">;

describe("textarea", () => {
  it("is hidden when its visible condition fails", () => {
    wrap(<TextareaComponent node={textareaNode}>{null}</TextareaComponent>, { mode: "view" });
    expect(screen.queryByLabelText("Bio")).not.toBeInTheDocument();
  });

  it("shows when its visible condition matches", () => {
    wrap(<TextareaComponent node={textareaNode}>{null}</TextareaComponent>, { mode: "edit" });
    expect(screen.getByLabelText("Bio")).toBeVisible();
  });
});

describe("number input", () => {
  it("renders a number input and writes to the store", () => {
    const node = {
      type: "form.number-input",
      props: { name: "qty", label: "Qty" },
    } as Node<"form.number-input">;

    wrap(<NumberInputComponent node={node}>{null}</NumberInputComponent>);
    const input = screen.getByLabelText("Qty");
    expect(input).toHaveAttribute("type", "number");

    fireEvent.change(input, { target: { value: "5" } });
    expect(input).toHaveValue(5);
  });

  it("renders as a slider with a value readout when sliding", () => {
    const node = {
      type: "form.number-input",
      props: { name: "level", label: "Level", slider: true, min: 0, max: 10 },
    } as Node<"form.number-input">;

    wrap(<NumberInputComponent node={node}>{null}</NumberInputComponent>, { level: "7" });
    const slider = screen.getByRole("slider", { name: "Level" });
    expect(slider).toHaveValue("7");
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});

describe("date input", () => {
  it("renders a date input seeded from the store", () => {
    const node = {
      type: "form.date-input",
      props: { name: "due", label: "Due" },
    } as Node<"form.date-input">;

    wrap(<DateInputComponent node={node}>{null}</DateInputComponent>, { due: "2026-06-08" });
    const input = screen.getByLabelText("Due");
    expect(input).toHaveAttribute("type", "date");
    expect(input).toHaveValue("2026-06-08");
  });
});
