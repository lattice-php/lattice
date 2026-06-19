import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FieldScopeProvider } from "../field-scope";
import { FormValuesProvider } from "../values";
import { TimeInputComponent } from "./time-input";

function renderField(node: Node<"field.time-input">, initial: Record<string, unknown> = {}) {
  return render(
    <FormValuesProvider initial={initial}>
      <TimeInputComponent node={node}>{null}</TimeInputComponent>
    </FormValuesProvider>,
  );
}

describe("TimeInputComponent", () => {
  it("renders and commits a time value", () => {
    renderField(
      fakeNode({ type: "field.time-input", props: { name: "starts_at", label: "Start time" } }),
    );

    const input = screen.getByLabelText("Start time");

    expect(input).toHaveAttribute("type", "time");

    fireEvent.change(input, { target: { value: "14:30" } });

    expect(input).toHaveValue("14:30");
  });

  it("applies min max step and tab index props", () => {
    renderField(
      fakeNode({
        type: "field.time-input",
        props: {
          name: "starts_at",
          label: "Start time",
          min: "08:00",
          max: "18:00",
          step: 900,
          tabIndex: 2,
        },
      }),
    );

    const input = screen.getByLabelText("Start time");

    expect(input).toHaveAttribute("min", "08:00");
    expect(input).toHaveAttribute("max", "18:00");
    expect(input).toHaveAttribute("step", "900");
    expect(input).toHaveAttribute("tabindex", "2");
  });

  it("uses scoped row names inside row fields", () => {
    const node = fakeNode({
      type: "field.time-input",
      props: { label: "Start time", name: "starts_at" },
    });

    render(
      <FormValuesProvider initial={{ starts_at: "" }}>
        <FieldScopeProvider base="items" index={0} row={{ starts_at: "09:00" }} onChange={() => {}}>
          <TimeInputComponent node={node}>{null}</TimeInputComponent>
        </FieldScopeProvider>
      </FormValuesProvider>,
    );

    expect(screen.getByLabelText("Start time")).toHaveAttribute("name", "items[0][starts_at]");
  });
});
