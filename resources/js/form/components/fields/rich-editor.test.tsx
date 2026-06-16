import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormValuesProvider } from "../values";
import { RichEditorComponent } from "./rich-editor";

function renderField(node: Node<"field.rich-editor">, initial: Record<string, unknown> = {}) {
  return render(
    <FormValuesProvider initial={initial}>
      <RichEditorComponent node={node}>{null}</RichEditorComponent>
    </FormValuesProvider>,
  );
}

describe("RichEditorComponent", () => {
  it("hides when its visible condition fails", () => {
    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: {
          name: "body",
          label: "Body",
          conditions: { visible: [{ field: "mode", operator: "eq", value: "edit" }] },
        },
      }),
      { mode: "view" },
    );

    expect(document.querySelector('input[name="body"]')).not.toBeInTheDocument();
  });

  it("renders the toolbar and a hidden input for submission", async () => {
    renderField(fakeNode({ type: "field.rich-editor", props: { name: "body", label: "Body" } }));

    expect(await screen.findByLabelText("Bold")).toBeInTheDocument();
    expect(document.querySelector('input[type="hidden"][name="body"]')).toBeInTheDocument();
  });
});
