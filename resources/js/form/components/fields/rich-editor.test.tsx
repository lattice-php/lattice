import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FieldScopeProvider } from "@lattice-php/lattice/form/hooks/field-scope";
import { FormValuesProvider } from "@lattice-php/lattice/form/hooks/values";
import { RichEditorComponent } from "./rich-editor";

function renderField(
  node: Node<"field.rich-editor">,
  initial: Record<string, unknown> = {},
  scoped = false,
) {
  const field = <RichEditorComponent node={node}>{null}</RichEditorComponent>;
  const nested = initial as { items?: Array<{ children?: Array<{ body?: unknown }> }> };

  return render(
    <FormValuesProvider initial={initial}>
      {scoped ? (
        <FieldScopeProvider
          base="items.0.children"
          index={1}
          row={{ rowId: "r1", body: nested.items?.[0]?.children?.[1]?.body }}
          onChange={() => {}}
        >
          {field}
        </FieldScopeProvider>
      ) : (
        field
      )}
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

  it("uses scoped names inside row fields", async () => {
    renderField(
      fakeNode({ type: "field.rich-editor", props: { name: "body", label: "Body" } }),
      { items: [{ children: [{}, { body: { type: "doc", content: [] } }] }] },
      true,
    );

    expect(await screen.findByLabelText("Bold")).toBeInTheDocument();
    expect(
      document.querySelector('input[type="hidden"][name="items[0][children][1][body]"]'),
    ).toBeInTheDocument();
  });

  it("runs every toolbar command without error", async () => {
    const prompt = vi.spyOn(window, "prompt").mockReturnValue("https://example.com");
    renderField(fakeNode({ type: "field.rich-editor", props: { name: "body", label: "Body" } }));

    await screen.findByLabelText("Bold");

    const markCommands = [
      "Bold",
      "Italic",
      "Strikethrough",
      "Underline",
      "Highlight",
      "Heading 1",
      "Heading 2",
      "Heading 3",
      "Bullet list",
      "Ordered list",
      "Blockquote",
      "Code block",
      "Horizontal rule",
      "Align left",
      "Align center",
      "Align right",
      "Justify",
    ];
    for (const label of markCommands) {
      fireEvent.click(screen.getByLabelText(label));
    }

    fireEvent.click(screen.getByLabelText("Link"));
    fireEvent.click(screen.getByLabelText("Link"));
    expect(prompt).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Insert table"));
    for (const label of ["Add column", "Add row", "Delete table"]) {
      const button = await screen.findByLabelText(label);
      await waitFor(() => expect(button).not.toBeDisabled());
      fireEvent.click(button);
    }

    fireEvent.click(screen.getByLabelText("Details"));
    fireEvent.click(screen.getByLabelText("Details"));

    prompt.mockRestore();
  });

  it("inserts an emoji from the picker", async () => {
    renderField(fakeNode({ type: "field.rich-editor", props: { name: "body", label: "Body" } }));

    await screen.findByLabelText("Insert emoji");

    fireEvent.click(screen.getByLabelText("Insert emoji"));
    expect(screen.getByText("🚀")).toBeInTheDocument();

    fireEvent.click(screen.getByText("🎉"));

    expect(screen.queryByText("🚀")).not.toBeInTheDocument();
  });
});
