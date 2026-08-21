import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { createRegistry } from "@lattice-php/core/registry";
import { fakeNode } from "@lattice-php/core/test-support";
import { formFrame, RICH_EDITOR_EXTENSIONS } from "@lattice-php/form/test-support";
import { RichEditorAdapter } from "./rich-editor-adapter";

const seededDoc = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Visit docs" }] }],
};

function renderEditor(initial: Record<string, unknown> = {}) {
  return render(
    formFrame(
      <RichEditorAdapter
        node={fakeNode({
          type: "field.rich-editor",
          props: { name: "body", label: "Body", extensions: RICH_EDITOR_EXTENSIONS },
        })}
      >
        {null}
      </RichEditorAdapter>,
      { initial, registry: createRegistry() },
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
