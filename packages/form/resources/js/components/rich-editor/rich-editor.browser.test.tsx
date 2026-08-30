import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { createRegistry, type Registry } from "@lattice-php/core/registry";
import { fakeNode } from "@lattice-php/core/test-support";
import { formFrame, RICH_EDITOR_EXTENSIONS } from "../../test-support";
import type { RichEditorExtensionRegistry } from "../../rich-editor/registry";
import { RichEditorAdapter } from "./rich-editor-adapter";

const seededDoc = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Visit docs" }] }],
};

function renderEditor(
  initial: Record<string, unknown> = {},
  registry: Registry = createRegistry(),
  extensions = RICH_EDITOR_EXTENSIONS,
) {
  return render(
    formFrame(
      <RichEditorAdapter
        node={fakeNode({
          type: "field.rich-editor",
          props: { name: "body", label: "Body", toolbar: true, extensions },
        })}
      >
        {null}
      </RichEditorAdapter>,
      { initial, registry },
    ),
  );
}

function editorContent(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".lattice-prose");
}

describe("RichEditorAdapter in a browser", () => {
  it("applies and removes a link on the selection through the popover", async () => {
    const screen = await renderEditor({ body: seededDoc });

    await screen.getByText("Visit docs").tripleClick();
    await screen.getByLabelText("Link").click();
    await page.getByLabelText("Link URL").fill("https://example.com");
    await page.getByLabelText("Apply link").click();

    await expect
      .poll(() => editorContent()?.querySelector('a[href="https://example.com"]')?.textContent)
      .toBe("Visit docs");
    await expect.element(page.getByLabelText("Link URL")).not.toBeInTheDocument();

    await screen.getByLabelText("Link").click();
    await page.getByLabelText("Remove link").click();

    await expect.poll(() => editorContent()?.querySelector("a")).toBeNull();
  });

  it("toggles a heading level through the dropdown", async () => {
    const screen = await renderEditor();

    await screen.getByLabelText("Heading").click();
    await page.getByTestId("editor-heading-2").click();

    await expect.poll(() => editorContent()?.querySelector("h2")).not.toBeNull();
  });

  it("inserts an emoji from the picker", async () => {
    const screen = await renderEditor();

    await screen.getByLabelText("Insert emoji").click();
    await expect.element(page.getByText("🚀")).toBeVisible();

    await page.getByText("🎉").click();

    await expect.poll(() => editorContent()?.textContent).toContain("🎉");
    await expect.element(page.getByText("🚀")).not.toBeInTheDocument();
  });

  it("inserts a table into the editor from the toolbar", async () => {
    const screen = await renderEditor();

    await screen.getByLabelText("Insert table").click();

    await expect.poll(() => editorContent()?.querySelectorAll("table th").length).toBe(3);
    await expect.poll(() => editorContent()?.querySelectorAll("table td").length).toBe(6);
  });
});

describe("slash menu in a browser", () => {
  it("opens on /, filters while typing, and inserts the block picked with the keyboard", async () => {
    await renderEditor();

    await userEvent.click(editorContent()!);
    await userEvent.keyboard("/");

    await expect.element(page.getByTestId("editor-block-menu")).toBeVisible();
    await expect.element(page.getByTestId("editor-block-bullet-list")).toBeVisible();

    await userEvent.keyboard("head");

    await expect.element(page.getByTestId("editor-block-bullet-list")).not.toBeInTheDocument();
    await expect
      .element(page.getByTestId("editor-block-heading-1"))
      .toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}{Enter}");

    await expect.poll(() => editorContent()?.querySelector("h2")).not.toBeNull();
    await expect.poll(() => editorContent()?.textContent).not.toContain("/head");
    await expect.element(page.getByTestId("editor-block-menu")).not.toBeInTheDocument();
  });

  it("closes on Escape, keeps the typed slash, and stays dismissed while typing on", async () => {
    await renderEditor();

    await userEvent.click(editorContent()!);
    await userEvent.keyboard("/");
    await expect.element(page.getByTestId("editor-block-menu")).toBeVisible();

    await userEvent.keyboard("{Escape}");

    await expect.element(page.getByTestId("editor-block-menu")).not.toBeInTheDocument();
    await expect.poll(() => editorContent()?.textContent).toContain("/");

    await userEvent.keyboard("x");

    await expect.poll(() => editorContent()?.textContent).toContain("/x");
    await expect.element(page.getByTestId("editor-block-menu")).not.toBeInTheDocument();
  });

  it("shows a plus button on an empty line that opens the same menu", async () => {
    await renderEditor();

    await userEvent.click(editorContent()!);

    await expect.element(page.getByTestId("editor-add-block")).toBeVisible();

    await page.getByTestId("editor-add-block").click();

    await expect.element(page.getByTestId("editor-block-menu")).toBeVisible();

    await page.getByTestId("editor-block-bullet-list").click();

    await expect.poll(() => editorContent()?.querySelector("ul li")).not.toBeNull();
    await expect.poll(() => editorContent()?.textContent).not.toContain("/");
  });

  it("lists the block commands of a registry-provided custom extension", async () => {
    await renderEditor(
      {},
      createRegistry({
        name: "test",
        extensions: {
          "form.rich-editor": {
            stamp: {
              commands: () => [
                {
                  icon: "check",
                  key: "stamp",
                  label: "Stamp",
                  run: (editor) => editor.chain().focus().insertContent("Stamped!").run(),
                },
              ],
            },
          } satisfies RichEditorExtensionRegistry,
        },
      }),
      [...RICH_EDITOR_EXTENSIONS, { type: "stamp", props: {} }],
    );

    await userEvent.click(editorContent()!);
    await userEvent.keyboard("/stam");

    await page.getByTestId("editor-block-stamp").click();

    await expect.poll(() => editorContent()?.textContent).toBe("Stamped!");
  });
});
