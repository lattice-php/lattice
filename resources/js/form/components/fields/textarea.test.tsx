import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormValuesProvider } from "../../hooks/values";
import { TextareaComponent } from "./textarea";

const node = fakeNode({
  type: "field.textarea",
  props: {
    name: "bio",
    label: "Bio",
    conditions: { visible: [{ field: "mode", operator: "eq", value: "edit" }] },
  },
});

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
