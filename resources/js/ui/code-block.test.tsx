import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import CodeBlockComponent from "./code-block";
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

  it("server-renders the maximum height on the fallback", () => {
    const html = renderToString(<CodeBlock maxHeight={240}>one\ntwo</CodeBlock>);

    expect(html).toContain('style="max-height:240px"');
  });

  it("server-renders line numbers on the fallback", () => {
    const html = renderToString(<CodeBlock lineNumbers>{"one\ntwo"}</CodeBlock>);
    const container = document.createElement("div");
    container.innerHTML = html;

    expect(
      Array.from(container.querySelectorAll('[aria-hidden="true"]'), (line) => line.textContent),
    ).toEqual(["1", "2"]);
  });

  it("makes a height-limited fallback vertically scrollable", () => {
    const html = renderToString(<CodeBlock maxHeight={240}>one\ntwo</CodeBlock>);

    expect(html).toContain("overflow-auto");
  });

  it("renders serialized node props", async () => {
    const node = fakeNode({
      type: "code-block",
      props: {
        code: "<?php echo 'Hello';",
        language: "php",
        copyable: false,
        lineNumbers: true,
        maxHeight: 240,
        wrap: true,
      },
    });
    const { container } = render(<CodeBlockComponent node={node}>{null}</CodeBlockComponent>);

    await waitFor(() => expect(container.querySelector(".cm-editor")).toBeInTheDocument());

    expect(container.querySelector(".cm-content")).toHaveTextContent("<?php echo 'Hello';");
    expect(container.querySelector(".cm-gutters")).toBeInTheDocument();
    expect(container.querySelector(".cm-editor")).toHaveStyle({ maxHeight: "240px" });
    expect(container.querySelector(".cm-lineWrapping")).toBeInTheDocument();
    expect(container.querySelector(".cm-content span")).toBeInTheDocument();
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

  it("updates content without recreating the CodeMirror view", async () => {
    const { container, rerender } = render(<CodeBlock>one\ntwo\nthree</CodeBlock>);

    await waitFor(() => expect(container.querySelector(".cm-editor")).toBeInTheDocument());

    const editor = container.querySelector(".cm-editor");
    const scroller = container.querySelector<HTMLElement>(".cm-scroller");
    expect(scroller).not.toBeNull();
    scroller!.scrollTop = 24;

    rerender(<CodeBlock>four\nfive\nsix</CodeBlock>);

    await waitFor(() => expect(container.querySelector(".cm-content")).toHaveTextContent("four"));
    expect(container.querySelector(".cm-editor")).toBe(editor);
    expect(container.querySelector(".cm-scroller")).toBe(scroller);
    expect(scroller).toHaveProperty("scrollTop", 24);
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
