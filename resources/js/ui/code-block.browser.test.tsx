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
});
