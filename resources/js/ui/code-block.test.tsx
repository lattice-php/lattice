import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeBlock, type CodeBlockLanguageLoader } from "./index";

afterEach(() => {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  vi.restoreAllMocks();
});

describe("CodeBlock", () => {
  it("server-renders an accessible pre while CodeMirror loads", () => {
    const html = renderToString(
      <CodeBlock aria-label="PHP example" language="php">
        {"<?php echo 'Hello';"}
      </CodeBlock>,
    );

    expect(html).toContain("<pre");
    expect(html).toContain('aria-label="PHP example"');
    expect(html).toContain("&lt;?php echo &#x27;Hello&#x27;;");
  });

  it("renders a read-only CodeMirror view for built-in languages", async () => {
    const { container } = render(
      <CodeBlock aria-label="PHP example" language="php" data-test="php-example">
        {"<?php echo 'Hello';"}
      </CodeBlock>,
    );

    await waitFor(() => expect(container.querySelector(".cm-editor")).toBeInTheDocument());

    expect(screen.getByRole("region", { name: "PHP example" })).toHaveAttribute(
      "data-slot",
      "code-block",
    );
    expect(container.querySelector(".cm-content")).toHaveAttribute("contenteditable", "false");
    expect(container.querySelector(".cm-content")).toHaveAttribute("role", "code");
    expect(container.querySelector(".cm-content")).toHaveTextContent("<?php echo 'Hello';");
    expect(container.querySelector(".cm-content span")).toBeInTheDocument();
  });

  it("loads custom languages through the public lazy loader", async () => {
    const language: CodeBlockLanguageLoader = vi.fn(async () => {
      const { json } = await import("@codemirror/lang-json");

      return json();
    });
    const { container } = render(<CodeBlock language={language}>{'{"ok":true}'}</CodeBlock>);

    await waitFor(() => expect(language).toHaveBeenCalledOnce());
    await waitFor(() => expect(container.querySelector(".cm-content span")).toBeInTheDocument());
  });

  it("wraps content when requested", async () => {
    const { container } = render(<CodeBlock wrap>long response body</CodeBlock>);

    await waitFor(() => expect(container.querySelector(".cm-lineWrapping")).toBeInTheDocument());
  });

  it("copies its content when requested", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <CodeBlock aria-label="Request snippet" copyable language="shell">
        curl https://example.com
      </CodeBlock>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy Request snippet" }));

    expect(writeText).toHaveBeenCalledWith("curl https://example.com");
    expect(await screen.findByRole("button", { name: "Copied Request snippet" })).toBeVisible();
  });
});
