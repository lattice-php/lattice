import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./code-block";

describe("CodeBlock", () => {
  it("server-renders an accessible, scrollable pre fallback while CodeMirror loads", () => {
    const html = renderToString(
      <CodeBlock aria-label="PHP example" copyable lineNumbers maxHeight={240}>
        {"<?php echo 'Hello';\ntwo"}
      </CodeBlock>,
    );
    const container = document.createElement("div");
    container.innerHTML = html;

    expect(container.querySelector("pre")).not.toBeNull();
    expect(container.querySelector('[data-slot="code-block"]')).toHaveAttribute(
      "aria-label",
      "PHP example",
    );
    expect(container.querySelector("pre")).toHaveTextContent("<?php echo 'Hello';");
    expect(html).toContain('style="max-height:240px"');
    expect(
      Array.from(
        container.querySelectorAll('pre [aria-hidden="true"]'),
        (line) => line.textContent,
      ),
    ).toEqual(["1", "2"]);
  });
});
