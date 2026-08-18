import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./code-block";

describe("CodeBlock", () => {
  it("server-renders the readable fallback while CodeMirror loads", () => {
    const html = renderToString(
      <CodeBlock aria-label="PHP example" lineNumbers>
        {"<?php echo 'Hello';\ntwo"}
      </CodeBlock>,
    );
    const container = document.createElement("div");
    container.innerHTML = html;

    expect(container.querySelector("pre")).toHaveTextContent("<?php echo 'Hello';");
    expect(container.querySelector('[role="region"]')).toHaveAccessibleName("PHP example");
    expect(
      Array.from(
        container.querySelectorAll('pre [aria-hidden="true"]'),
        (line) => line.textContent,
      ),
    ).toEqual(["1", "2"]);
  });
});
