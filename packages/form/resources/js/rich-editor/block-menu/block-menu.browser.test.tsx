import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { createRef } from "react";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BlockCommandEntry } from "../registry";
import { BlockMenu } from "./block-menu";
import { BlockMenuController } from "./block-menu-controller";
import type { SlashMenuHandle } from "./slash-extension";

const items: BlockCommandEntry[] = [
  { group: "text", icon: "heading", key: "heading", label: "Heading", run: () => {} },
  { group: "layout", icon: "columns-2", key: "columns", label: "Columns", run: () => {} },
];

describe("BlockMenu", () => {
  it("labels items through the host's translator and reports the picked one", async () => {
    const onSelect = vi.fn();

    await render(
      <BlockMenu
        activeIndex={0}
        id="menu"
        items={items}
        onHighlight={() => {}}
        onSelect={onSelect}
        translate={(key, fallback) => (key === "columns" ? "Spalten" : fallback)}
      />,
    );

    await userEvent.click(page.getByRole("option", { name: "Spalten" }));

    expect(onSelect).toHaveBeenCalledWith(items[1]);
    await expect.element(page.getByRole("option", { name: "Heading" })).toBeInTheDocument();
  });
});

describe("BlockMenuController", () => {
  let editor: Editor;

  afterEach(() => {
    editor.destroy();
  });

  it("shows the floating add-block button only while the host wants it", async () => {
    const mount = document.createElement("div");
    document.body.appendChild(mount);
    editor = new Editor({ content: "<p></p>", element: mount, extensions: [StarterKit] });
    const handleRef = createRef<SlashMenuHandle | null>();

    const screen = await render(<BlockMenuController editor={editor} handleRef={handleRef} />);
    editor.commands.focus();

    await expect.element(page.getByTestId("editor-add-block")).toBeInTheDocument();
    expect(handleRef.current).not.toBeNull();

    await screen.rerender(
      <BlockMenuController editor={editor} handleRef={handleRef} plusButton={false} />,
    );

    await expect.poll(() => document.querySelector('[data-test="editor-add-block"]')).toBeNull();
    mount.remove();
  });
});
