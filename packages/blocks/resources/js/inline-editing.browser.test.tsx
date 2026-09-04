import { page, userEvent } from "vitest/browser";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRegistry } from "@lattice-php/core";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { fakeNode, jsonResponse } from "@lattice-php/core/test-support";
import { formComponents } from "@lattice-php/form";
import { uiComponents } from "@lattice-php/ui";
import BlockEditorView from "./components/editor/block-editor-view";
import blocksPlugin from "./plugin";
import {
  block,
  ctaType,
  document,
  headingType,
  paragraphType,
  renderedFor,
  renderedFrame,
  richDoc,
  testStyleClasses,
  testTypes,
} from "./test-support";
import type { BlockDocument, BlockNode } from "./types";

const registry = createRegistry(uiComponents, formComponents, blocksPlugin);

type Call = { op: string; body: Record<string, unknown> };

function stubEndpoint(): Call[] {
  const calls: Call[] = [];

  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      const op = init?.method === "PATCH" ? "draft" : String(body._op);
      calls.push({ body, op });

      if (op === "render") {
        return jsonResponse({ errors: {}, node: renderedFrame(body.block as BlockNode) });
      }

      return jsonResponse({ errors: {}, revision: 2 });
    }),
  );

  return calls;
}

function renderEditor(doc: BlockDocument) {
  const node = fakeNode({
    id: "pages",
    props: {
      document: doc,
      endpoint: "/lattice/block-editors/pages",
      previewUrl: null,
      ref: "sealed",
      rendered: renderedFor(doc),
      revision: 1,
      seedType: "lattice.paragraph",
      styleClasses: testStyleClasses,
      title: "Landing",
      types: testTypes,
    },
    type: "blocks.editor",
  });

  return renderWithRegistry(<BlockEditorView node={node} />, registry);
}

function rootBlocks(): { id: string; type: string }[] {
  return Array.from(
    globalThis.document.querySelectorAll('[data-test="blocks-canvas-root"] > [data-block-id]'),
    (element) => ({
      id: element.getAttribute("data-block-id") ?? "",
      type: element.getAttribute("data-block-type") ?? "",
    }),
  );
}

function renders(calls: Call[]): BlockNode[] {
  return calls.filter((call) => call.op === "render").map((call) => call.body.block as BlockNode);
}

function focusedBlockId(): string | null {
  return (
    globalThis.document.activeElement?.closest("[data-block-id]")?.getAttribute("data-block-id") ??
    null
  );
}

describe("inline editing", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("types into a bound heading and patches the render locally", async () => {
    const calls = stubEndpoint();
    renderEditor(document(block("h", headingType.type, { text: "Hello" })));

    await userEvent.click(page.getByTestId("inline-h-text"));
    await userEvent.keyboard("{End} world");

    await expect.element(page.getByTestId("inline-h-text")).toMatchTextContent("Hello world");
    await expect
      .element(page.getByTestId("blocks-save-state"))
      .toHaveAttribute("data-save-state", "dirty");
    expect(renders(calls)).toHaveLength(0);
  });

  it("undoes inline typing as one step", async () => {
    stubEndpoint();
    renderEditor(document(block("h", headingType.type, { text: "Hello" })));

    await userEvent.click(page.getByTestId("inline-h-text"));
    await userEvent.keyboard("{End} there");
    await expect.element(page.getByTestId("inline-h-text")).toMatchTextContent("Hello there");

    await userEvent.keyboard("{Meta>}z{/Meta}");

    await expect.element(page.getByTestId("inline-h-text")).toMatchTextContent("Hello");
  });

  it("opens a paragraph below a heading on Enter and moves the caret into it", async () => {
    const calls = stubEndpoint();
    renderEditor(document(block("h", headingType.type, { text: "Hello" })));

    await userEvent.click(page.getByTestId("inline-h-text"));
    await userEvent.keyboard("{End}{Enter}");

    await expect
      .poll(() => rootBlocks().map((entry) => entry.type))
      .toEqual([headingType.type, paragraphType.type]);
    const created = rootBlocks()[1]?.id as string;
    await expect.element(page.getByTestId(`inline-${created}-content`)).toBeInTheDocument();
    await expect.poll(focusedBlockId).toBe(created);
    expect(renders(calls).map((node) => node.type)).toEqual([paragraphType.type]);
  });

  it("splits a rich paragraph at the caret", async () => {
    stubEndpoint();
    renderEditor(document(block("p", paragraphType.type, { content: richDoc("Hello world") })));

    await userEvent.click(page.getByTestId("inline-p-content"));
    await userEvent.keyboard("{Home}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}");
    await userEvent.keyboard("{Enter}");

    await expect.poll(() => rootBlocks().length).toBe(2);
    const created = rootBlocks()[1]?.id as string;
    await expect.element(page.getByTestId("inline-p-content")).toMatchTextContent(/^Hello$/);
    await expect.element(page.getByTestId(`inline-${created}-content`)).toMatchTextContent("world");
  });

  it("merges a paragraph into the previous one on Backspace at its start", async () => {
    stubEndpoint();
    renderEditor(
      document(
        block("a", paragraphType.type, { content: richDoc("Hello") }),
        block("b", paragraphType.type, { content: richDoc("World") }),
      ),
    );

    await userEvent.click(page.getByTestId("inline-b-content"));
    await userEvent.keyboard("{Home}");
    await userEvent.keyboard("{Backspace}");

    await expect.poll(() => rootBlocks().map((entry) => entry.id)).toEqual(["a"]);
    await expect.element(page.getByTestId("inline-a-content")).toMatchTextContent("HelloWorld");
    await expect.poll(focusedBlockId).toBe("a");
  });

  it("replaces an empty paragraph with the block picked from the slash menu", async () => {
    stubEndpoint();
    renderEditor(document(block("p", paragraphType.type)));

    await userEvent.click(page.getByTestId("inline-p-content"));
    await userEvent.keyboard("/head");

    await expect.element(page.getByTestId("editor-block-menu")).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");

    await expect.poll(() => rootBlocks().map((entry) => entry.type)).toEqual([headingType.type]);
    const created = rootBlocks()[0]?.id as string;
    await expect.element(page.getByTestId(`inline-${created}-text`)).toBeInTheDocument();
  });

  it("edits a bound non-text field through a popover at the element", async () => {
    const calls = stubEndpoint();
    renderEditor(document(block("cta", ctaType.type, { external: false, label: "Go" })));

    await userEvent.click(page.getByTestId("inline-cta-external"));
    await userEvent.click(page.getByRole("switch", { name: "Open in new tab" }));

    await expect.poll(() => renders(calls).at(-1)?.data.external).toBe(true);
    await expect
      .element(page.getByTestId("inline-cta-external"))
      .toMatchTextContent("opens in new tab");
  });

  it("keeps only unbound fields in the inspector content tab", async () => {
    stubEndpoint();
    renderEditor(document(block("h", headingType.type, { text: "Hello" })));

    await userEvent.click(page.getByTestId("block-h"));
    await userEvent.click(page.getByTestId("blocks-inspector-tab-content"));

    await expect.element(page.getByText("Level")).toBeInTheDocument();
    expect(
      globalThis.document.querySelector('[data-test="blocks-content-panel"] input[type="text"]'),
    ).toBeNull();
  });

  it("moves between blocks with the arrow keys", async () => {
    stubEndpoint();
    renderEditor(
      document(
        block("h", headingType.type, { text: "Hello" }),
        block("p", paragraphType.type, { content: richDoc("Body") }),
      ),
    );

    await userEvent.click(page.getByTestId("inline-h-text"));
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(focusedBlockId).toBe("p");

    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(focusedBlockId).toBe("h");
  });
});
