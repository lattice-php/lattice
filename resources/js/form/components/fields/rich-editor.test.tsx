import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeConditions, fakeNode } from "@lattice-php/lattice/test-support";
import { FieldScopeProvider } from "@lattice-php/lattice/form/hooks/field-scope";
import { FormValuesProvider } from "@lattice-php/lattice/form/hooks/values";
import { registerRichEditorExtension } from "@lattice-php/lattice/form/rich-editor/registry";
import type { EditorExtension } from "@lattice-php/lattice/types/generated";
import { RichEditorComponent } from "./rich-editor";

const DEFAULT_EXTENSIONS: EditorExtension[] = [
  { type: "bold" },
  { type: "italic" },
  { type: "strike" },
  { type: "underline" },
  { type: "highlight" },
  { type: "code" },
  { type: "heading" },
  { type: "bullet-list" },
  { type: "ordered-list" },
  { type: "blockquote" },
  { type: "code-block" },
  { type: "horizontal-rule" },
  { type: "text-align" },
  { type: "link" },
  { type: "table" },
  { type: "details" },
  { type: "emoji" },
];

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
          extensions: DEFAULT_EXTENSIONS,
          conditions: fakeConditions({
            visible: [{ field: "mode", operator: "eq", value: "edit" }],
          }),
        },
      }),
      { mode: "view" },
    );

    expect(document.querySelector('input[name="body"]')).not.toBeInTheDocument();
  });

  it("renders the toolbar and a hidden input for submission", async () => {
    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: { name: "body", label: "Body", extensions: DEFAULT_EXTENSIONS },
      }),
    );

    expect(await screen.findByLabelText("Bold")).toBeInTheDocument();
    expect(document.querySelector('input[type="hidden"][name="body"]')).toBeInTheDocument();
  });

  it("uses scoped names inside row fields", async () => {
    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: { name: "body", label: "Body", extensions: DEFAULT_EXTENSIONS },
      }),
      { items: [{ children: [{}, { body: { type: "doc", content: [] } }] }] },
      true,
    );

    expect(await screen.findByLabelText("Bold")).toBeInTheDocument();
    expect(
      document.querySelector('input[type="hidden"][name="items[0][children][1][body]"]'),
    ).toBeInTheDocument();
  });

  it("runs every toolbar command without error", async () => {
    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: { name: "body", label: "Body", extensions: DEFAULT_EXTENSIONS },
      }),
    );

    await screen.findByLabelText("Bold");

    const markCommands = [
      "Bold",
      "Italic",
      "Strikethrough",
      "Underline",
      "Highlight",
      "Code",
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

    fireEvent.click(screen.getByLabelText("Insert table"));
    for (const label of ["Add column", "Add row", "Delete table"]) {
      const button = await screen.findByLabelText(label);
      await waitFor(() => expect(button).not.toBeDisabled());
      fireEvent.click(button);
    }

    fireEvent.click(screen.getByLabelText("Details"));
    fireEvent.click(screen.getByLabelText("Details"));
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

  it("renders only the configured extensions", async () => {
    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: {
          name: "body",
          label: "Body",
          extensions: [{ type: "bold" }, { type: "italic" }, { type: "link" }],
        },
      }),
    );

    expect(await screen.findByLabelText("Bold")).toBeInTheDocument();
    expect(screen.getByLabelText("Italic")).toBeInTheDocument();
    expect(screen.getByLabelText("Link")).toBeInTheDocument();
    expect(screen.queryByLabelText("Heading")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Insert table")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Insert emoji")).not.toBeInTheDocument();
  });

  it("renders a client-registered custom extension", async () => {
    registerRichEditorExtension("stamp", {
      toolbar: () => [
        {
          icon: "check",
          key: "stamp",
          label: "Stamp",
          isActive: () => false,
          run: (editor) => editor.chain().focus().insertContent("STAMPED").run(),
        },
      ],
    });

    renderField(
      fakeNode({
        type: "field.rich-editor",
        props: {
          name: "body",
          label: "Body",
          extensions: [{ type: "bold" }, { type: "stamp" }],
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
