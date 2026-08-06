import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { describe, expect, it } from "vitest";
import { MediaImageNode } from "./media-image";

function Harness({
  attrs,
  conversions = [],
  onEditor,
}: {
  attrs: Record<string, unknown>;
  conversions?: string[];
  onEditor: (editor: Editor) => void;
}) {
  const editor = useEditor({
    content: { type: "doc", content: [{ type: "mediaImage", attrs }] },
    extensions: [StarterKit, MediaImageNode.configure({ conversions })],
    immediatelyRender: true,
  });

  if (editor) {
    onEditor(editor);
  }

  return editor ? <EditorContent editor={editor} /> : null;
}

async function mountNode(attrs: Record<string, unknown>, conversions: string[] = []) {
  let editor: Editor | undefined;
  render(<Harness attrs={attrs} conversions={conversions} onEditor={(e) => (editor = e)} />);
  await waitFor(() =>
    expect(document.querySelector("[data-test=editor-media-image]")).not.toBeNull(),
  );

  return editor!;
}

describe("MediaImageNode", () => {
  it("renders the image from the ephemeral url attr", async () => {
    await mountNode({ id: 7, url: "https://cdn.test/a.jpg", mediaAlt: "Lamp" });

    const img = document.querySelector("[data-test=editor-media-image] img")!;
    expect(img.getAttribute("src")).toBe("https://cdn.test/a.jpg");
    expect(img.getAttribute("alt")).toBe("Lamp");
  });

  it("shows a placeholder when the media no longer resolves", async () => {
    await mountNode({ id: 999 });

    expect(document.querySelector("[data-test=editor-media-image-missing]")).not.toBeNull();
  });

  it("edits the alt override into the node attrs when selected", async () => {
    const editor = await mountNode({ id: 7, url: "https://cdn.test/a.jpg" });
    editor.commands.setNodeSelection(0);

    await waitFor(() =>
      expect(document.querySelector("[data-test=editor-media-image-controls]")).not.toBeNull(),
    );
    fireEvent.change(screen.getByLabelText("Alt text"), { target: { value: "Better alt" } });

    await waitFor(() => {
      const node = editor.getJSON().content?.find((child) => child.type === "mediaImage");
      expect(node?.attrs?.alt).toBe("Better alt");
    });
  });

  it("offers the configured conversions plus the original", async () => {
    const editor = await mountNode({ id: 7, url: "https://cdn.test/a.jpg" }, ["hero"]);
    editor.commands.setNodeSelection(0);

    await waitFor(() => expect(screen.getByLabelText("Size")).not.toBeNull());
    expect(screen.getByRole("option", { name: "Original" })).not.toBeNull();
    fireEvent.change(screen.getByLabelText("Size"), { target: { value: "hero" } });

    await waitFor(() => {
      const node = editor.getJSON().content?.find((child) => child.type === "mediaImage");
      expect(node?.attrs?.conversion).toBe("hero");
    });
  });
});
