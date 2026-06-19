import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormValuesProvider } from "../values";
import { ToggleComponent } from "./toggle";

function renderField(node: Node<"field.toggle">, initial: Record<string, unknown> = {}) {
  return render(
    <FormValuesProvider initial={initial}>
      <ToggleComponent node={node}>{null}</ToggleComponent>
    </FormValuesProvider>,
  );
}

describe("ToggleComponent", () => {
  it("renders helper text and toggles a boolean value", () => {
    renderField(
      fakeNode({
        type: "field.toggle",
        props: {
          helperText: "Show this item publicly.",
          label: "Published",
          name: "published",
          value: false,
        },
      }),
    );

    const toggle = screen.getByRole("switch", { name: "Published" });

    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("Show this item publicly.")).toBeVisible();
    expect(document.querySelector('input[type="hidden"][name="published"]')).toHaveValue("0");

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(document.querySelector('input[type="hidden"][name="published"]')).toHaveValue("1");
  });

  it("uses form state before the field default", () => {
    renderField(
      fakeNode({
        type: "field.toggle",
        props: { label: "Featured", name: "featured", value: false },
      }),
      { featured: true },
    );

    expect(screen.getByRole("switch", { name: "Featured" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("does not toggle while read-only", () => {
    renderField(
      fakeNode({
        type: "field.toggle",
        props: { label: "Locked", name: "locked", readOnly: true, value: true },
      }),
    );

    const toggle = screen.getByRole("switch", { name: "Locked" });

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(toggle).toBeDisabled();
  });
});
