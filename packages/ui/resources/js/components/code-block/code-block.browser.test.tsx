import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";
import { CodeBlock, type CodeBlockLanguageLoader } from "./code-block";

describe("CodeBlock in a browser", () => {
  it("renders highlighted PHP in a read-only CodeMirror view", async () => {
    const screen = await render(
      <CodeBlock aria-label="PHP example" language="php" wrap>
        {"<?php echo 'Hello';"}
      </CodeBlock>,
    );

    const content = screen.getByRole("code");

    await expect.element(content).toHaveAttribute("contenteditable", "false");
    await expect.element(screen.getByRole("region", { name: "PHP example" })).toBeVisible();
    await expect.element(screen.getByText("<?php echo 'Hello';")).toBeVisible();
    expect(content.element().querySelector("span")).not.toBeNull();
    expect(document.querySelector(".cm-lineWrapping")).not.toBeNull();
  });

  it("updates content without recreating the CodeMirror view", async () => {
    const lines = (word: string) =>
      Array.from({ length: 30 }, (_, index) => `${word} ${index + 1}`).join("\n");
    const screen = await render(<CodeBlock maxHeight={80}>{lines("first")}</CodeBlock>);

    await expect.poll(() => document.querySelector(".cm-editor")).not.toBeNull();

    const editor = document.querySelector(".cm-editor");
    const scroller = document.querySelector<HTMLElement>(".cm-scroller");
    expect(scroller).not.toBeNull();
    scroller!.scrollTop = 24;
    await expect.poll(() => scroller!.scrollTop).toBe(24);

    screen.rerender(<CodeBlock maxHeight={80}>{lines("second")}</CodeBlock>);

    await expect.poll(() => document.querySelector(".cm-content")?.textContent).toContain("second");
    expect(document.querySelector(".cm-editor")).toBe(editor);
    expect(document.querySelector(".cm-scroller")).toBe(scroller);
    expect(scroller!.scrollTop).toBeGreaterThan(0);
  });

  it("loads custom languages through the public lazy loader", async () => {
    const language: CodeBlockLanguageLoader = vi.fn(async () => {
      const { json } = await import("@codemirror/lang-json");

      return json();
    });
    await render(<CodeBlock language={language}>{'{"ok":true}'}</CodeBlock>);

    await expect.poll(() => vi.mocked(language).mock.calls.length).toBe(1);
    await expect.poll(() => document.querySelector(".cm-content span")).not.toBeNull();
  });
});
