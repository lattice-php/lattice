import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, type Registry } from "@lattice-php/core/registry";
import type { Node } from "@lattice-php/core";
import { fakeNode } from "@lattice-php/core/test-support";
import { renderWithForm, RICH_EDITOR_EXTENSIONS } from "@lattice-php/form/test-support";
import type { RichEditorExtensionRegistry } from "@lattice-php/form/rich-editor/registry";
import { RichEditorComponent } from "./rich-editor";

function renderField(
  node: Node<"field.rich-editor">,
  initial: Record<string, unknown> = {},
  registry: Registry = createRegistry(),
) {
  return renderWithForm(<RichEditorComponent node={node}>{null}</RichEditorComponent>, {
    initial,
    registry,
  });
}

describe("RichEditorComponent", () => {
  it("reflects mark state in the toolbar on selection-only transactions", async () => {
    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: { name: "body", label: "Body", extensions: RICH_EDITOR_EXTENSIONS },
      }),
    );

    const bold = await screen.findByLabelText("Bold");
    expect(bold).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(bold);

    await waitFor(() => expect(bold).toHaveAttribute("aria-pressed", "true"));
  });

  it("limits the heading dropdown to the configured levels", async () => {
    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: {
          name: "body",
          label: "Body",
          extensions: [{ type: "heading", props: { levels: [1, 2] } }],
        },
      }),
    );

    fireEvent.click(await screen.findByLabelText("Heading"));

    expect(screen.getByText("Heading 1")).toBeInTheDocument();
    expect(screen.getByText("Heading 2")).toBeInTheDocument();
    expect(screen.queryByText("Heading 3")).not.toBeInTheDocument();
  });

  it("renders a custom extension from the plugin registry", async () => {
    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: {
          name: "body",
          label: "Body",
          extensions: [
            { type: "bold", props: {} },
            { type: "stamp", props: {} },
          ],
        },
      }),
      {},
      createRegistry({
        name: "test",
        extensions: {
          "form.rich-editor": {
            stamp: {
              toolbar: () => [
                {
                  icon: "check",
                  key: "stamp",
                  label: "Stamp",
                  isActive: () => false,
                  run: (editor) => editor.chain().focus().insertContent("STAMPED").run(),
                },
              ],
            },
          } satisfies RichEditorExtensionRegistry,
        },
      }),
    );

    fireEvent.click(await screen.findByLabelText("Stamp"));

    await waitFor(() =>
      expect(document.querySelector(".lattice-prose")).toHaveTextContent("STAMPED"),
    );
  });
});
