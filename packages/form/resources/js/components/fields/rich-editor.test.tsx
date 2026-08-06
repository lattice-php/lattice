import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, type Registry } from "@lattice-php/core/registry";
import { RegistryContext } from "@lattice-php/core/registry-context";
import type { Node } from "@lattice-php/core";
import { fakeNode } from "@lattice-php/core/test-support";
import { FormValuesProvider } from "@lattice-php/form/hooks/values";
import type { RichEditorExtensionRegistry } from "@lattice-php/form/rich-editor/registry";
import type { EditorExtension } from "@lattice-php/form/generated";
import { RichEditorComponent } from "./rich-editor";

const DEFAULT_EXTENSIONS: EditorExtension[] = [
  { type: "bold", props: {} },
  { type: "italic", props: {} },
  { type: "strike", props: {} },
  { type: "underline", props: {} },
  { type: "highlight", props: {} },
  { type: "code", props: {} },
  { type: "heading", props: {} },
  { type: "bullet-list", props: {} },
  { type: "ordered-list", props: {} },
  { type: "blockquote", props: {} },
  { type: "code-block", props: {} },
  { type: "horizontal-rule", props: {} },
  { type: "text-align", props: {} },
  { type: "link", props: {} },
  { type: "table", props: {} },
  { type: "details", props: {} },
  { type: "emoji", props: {} },
];

function renderField(
  node: Node<"field.rich-editor">,
  initial: Record<string, unknown> = {},
  registry: Registry = createRegistry(),
) {
  return render(
    <RegistryContext.Provider value={registry}>
      <FormValuesProvider initial={initial}>
        <RichEditorComponent node={node}>{null}</RichEditorComponent>
      </FormValuesProvider>
    </RegistryContext.Provider>,
  );
}

describe("RichEditorComponent", () => {
  it("reflects mark state in the toolbar on selection-only transactions", async () => {
    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: { name: "body", label: "Body", extensions: DEFAULT_EXTENSIONS },
      }),
    );

    const bold = await screen.findByLabelText("Bold");
    expect(bold).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(bold);

    await waitFor(() => expect(bold).toHaveAttribute("aria-pressed", "true"));
  });

  it("toggles a heading level through the dropdown", async () => {
    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: { name: "body", label: "Body", extensions: DEFAULT_EXTENSIONS },
      }),
    );

    fireEvent.click(await screen.findByLabelText("Heading"));

    for (const level of [1, 2, 3, 4, 5, 6]) {
      expect(screen.getByText(`Heading ${level}`)).toBeInTheDocument();
    }

    fireEvent.click(screen.getByText("Heading 2"));

    await waitFor(() => expect(document.querySelector(".lattice-prose h2")).toBeInTheDocument());
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

  it("sets and removes a link through the popover", async () => {
    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: { name: "body", label: "Body", extensions: DEFAULT_EXTENSIONS },
      }),
    );

    fireEvent.click(await screen.findByLabelText("Link"));

    const input = await screen.findByLabelText("Link URL");
    fireEvent.change(input, { target: { value: "https://example.com" } });
    fireEvent.click(screen.getByLabelText("Apply link"));

    await waitFor(() => expect(screen.queryByLabelText("Link URL")).not.toBeInTheDocument());

    fireEvent.click(screen.getByLabelText("Link"));
    fireEvent.click(await screen.findByLabelText("Remove link"));

    await waitFor(() => expect(screen.queryByLabelText("Link URL")).not.toBeInTheDocument());
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

  it("shows the placeholder while the editor is empty", async () => {
    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: {
          name: "body",
          label: "Body",
          extensions: DEFAULT_EXTENSIONS,
          placeholder: "Write your article…",
        },
      }),
    );

    await screen.findByLabelText("Bold");

    await waitFor(() =>
      expect(
        document.querySelector('[data-placeholder="Write your article…"]'),
      ).toBeInTheDocument(),
    );
  });

  it("inserts an emoji from the picker", async () => {
    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: { name: "body", label: "Body", extensions: DEFAULT_EXTENSIONS },
      }),
    );

    await screen.findByLabelText("Insert emoji");

    fireEvent.click(screen.getByLabelText("Insert emoji"));
    expect(screen.getByText("🚀")).toBeInTheDocument();

    fireEvent.click(screen.getByText("🎉"));

    expect(screen.queryByText("🚀")).not.toBeInTheDocument();
  });
});
