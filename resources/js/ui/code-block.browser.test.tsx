import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./code-block";

describe("CodeBlock in a browser", () => {
  it("renders highlighted PHP in a read-only CodeMirror view", async () => {
    const screen = await render(
      <CodeBlock aria-label="PHP example" language="php" wrap>
        {"<?php echo 'Hello';"}
      </CodeBlock>,
    );

    await expect.poll(() => document.querySelector(".cm-editor")).not.toBeNull();

    const content = document.querySelector(".cm-content");

    expect(content).toHaveAttribute("contenteditable", "false");
    expect(content).toHaveAttribute("role", "code");
    expect(content?.querySelector("span")).not.toBeNull();
    expect(screen.getByRole("region", { name: "PHP example" })).toBeVisible();
    expect(screen.getByText("<?php echo 'Hello';")).toBeVisible();
  });

  it("keeps the fallback and CodeMirror chrome aligned", async () => {
    const screen = await render(
      <CodeBlock aria-label="Code example" copyable lineNumbers maxHeight={100}>
        {"one\ntwo\nthree\nfour\nfive\nsix\nseven"}
      </CodeBlock>,
    );

    await expect.poll(() => document.querySelector(".cm-editor")).not.toBeNull();

    const content = document.querySelector<HTMLElement>(".cm-content");
    const gutters = document.querySelector<HTMLElement>(".cm-gutters");
    const gutterElement = document.querySelector<HTMLElement>(".cm-gutterElement");
    const button = screen.getByRole("button", { name: "Copy Code example" }).element();
    const block = button.closest<HTMLElement>('[data-slot="code-block"]');

    expect(content).not.toBeNull();
    expect(gutters).not.toBeNull();
    expect(gutterElement).not.toBeNull();
    expect(block).not.toBeNull();
    expect(getComputedStyle(content!).paddingTop).toBe("12px");
    expect(getComputedStyle(gutters!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(gutterElement!).paddingLeft).toBe("12px");
    expect(getComputedStyle(gutterElement!).paddingRight).toBe("12px");
    expect(button.getBoundingClientRect().top - block!.getBoundingClientRect().top).toBe(12);
    expect(block!.getBoundingClientRect().right - button.getBoundingClientRect().right).toBe(24);
  });
});
