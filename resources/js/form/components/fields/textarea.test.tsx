import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice/lattice/core/types";
import { FormValuesProvider } from "../values";
import { TextareaComponent } from "./textarea";

const node = {
  type: "form.textarea",
  props: {
    name: "bio",
    label: "Bio",
    conditions: { visible: [{ field: "mode", operator: "=", value: "edit" }] },
  },
} as Node<"form.textarea">;

function renderField(initial: Record<string, unknown>) {
  return render(
    <FormValuesProvider initial={initial}>
      <TextareaComponent node={node}>{null}</TextareaComponent>
    </FormValuesProvider>,
  );
}

describe("TextareaComponent", () => {
  it("is hidden when its visible condition fails", () => {
    renderField({ mode: "view" });
    expect(screen.queryByLabelText("Bio")).not.toBeInTheDocument();
  });

  it("shows when its visible condition matches", () => {
    renderField({ mode: "edit" });
    expect(screen.getByLabelText("Bio")).toBeVisible();
  });
});
