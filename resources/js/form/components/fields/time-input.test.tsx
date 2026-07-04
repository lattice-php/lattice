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
  it("renders a text input and commits a normalized value", () => {
    renderField(
      fakeNode({ type: "field.time-input", props: { name: "starts_at", label: "Start time" } }),
    );

    const input = screen.getByLabelText("Start time");

    expect(input).toHaveAttribute("type", "text");

    fireEvent.change(input, { target: { value: "14:30" } });

    expect(input).toHaveValue("14:30");
  });

  it("picks a time from the popover", () => {
    renderField(
      fakeNode({
        type: "field.time-input",
        props: { name: "starts_at", label: "Start time", min: "08:00", max: "18:00" },
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /open start time time picker/i }));

    expect(screen.getByRole("option", { name: "Hour 07" })).toBeDisabled();

    fireEvent.click(screen.getByRole("option", { name: "Hour 09" }));
    fireEvent.click(screen.getByRole("option", { name: "Minute 30" }));

    expect(screen.getByLabelText("Start time")).toHaveValue("09:30");
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

  it("keeps a seconds-enabled value intact while typing and normalizes on blur", () => {
    renderField(
      fakeNode({
        type: "field.time-input",
        props: { name: "starts_at", label: "Start time", step: 1 },
      }),
    );

    const input = screen.getByLabelText("Start time");

    fireEvent.change(input, { target: { value: "10:15" } });
    expect(input).toHaveValue("10:15");

    fireEvent.change(input, { target: { value: "10:15:30" } });
    fireEvent.blur(input);

    expect(input).toHaveValue("10:15:30");
  });

  it("normalizes a complete value on blur", () => {
    renderField(
      fakeNode({ type: "field.time-input", props: { name: "starts_at", label: "Start time" } }),
    );

    const input = screen.getByLabelText("Start time");

    fireEvent.change(input, { target: { value: "9:30" } });
    fireEvent.blur(input);

    expect(input).toHaveValue("09:30");
  });
});
