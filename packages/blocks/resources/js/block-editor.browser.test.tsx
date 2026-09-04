import { page, userEvent } from "vitest/browser";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { formComponents } from "@lattice-php/form";
import { uiComponents } from "@lattice-php/ui";
import BlockEditorView from "./components/editor/block-editor-view";
import blocksPlugin from "./plugin";
import {
  block,
  blockEditorNode,
  blockIdsIn,
  columnsType,
  document,
  noteType,
  renderedTextFrame,
  rootBlockIds,
  stubEditorFetch,
  TestText,
  textOnlySectionType,
} from "./test-support";
import type { BlockDocument } from "./types";

const registry = createRegistry(uiComponents, formComponents, blocksPlugin, {
  components: { "test.text": eagerComponent(TestText) },
  name: "test/blocks-browser",
});

const stubEditorEndpoint = () => stubEditorFetch({ render: renderedTextFrame });

function renderEditor(doc: BlockDocument) {
  return renderWithRegistry(<BlockEditorView node={blockEditorNode(doc)} />, registry);
}

const baseDocument = () =>
  document(
    block("h", "lattice.heading", { text: "Hello" }),
    block(
      "c",
      columnsType.type,
      {},
      { col_1: [block("p", noteType.type, { text: "Inside" })], col_2: [] },
    ),
    block("s", textOnlySectionType.type, {}, { content: [] }),
  );

function byTest(id: string) {
  return page.getByTestId(id);
}

describe("block editor", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("drops a library block into a slot and renders it through the endpoint", async () => {
    const calls = stubEditorEndpoint();
    renderEditor(baseDocument());

    await userEvent.dragAndDrop(byTest("library-lattice.paragraph"), byTest("slot-c-col_2"));

    await expect.poll(() => blockIdsIn("slot-c-col_2").length).toBe(1);
    await expect.element(page.getByText("Rendered lattice.paragraph")).toBeInTheDocument();
    expect(calls.filter((call) => call.op === "render")).toHaveLength(1);
  });

  it("refuses a drop the slot rules forbid", async () => {
    stubEditorEndpoint();
    renderEditor(baseDocument());

    await userEvent.dragAndDrop(byTest("library-lattice.heading"), byTest("slot-s-content"));

    await expect.poll(() => blockIdsIn("slot-s-content").length).toBe(0);
    await expect.element(byTest("blocks-save-state")).toHaveAttribute("data-save-state", "idle");
  });

  it("reorders root blocks with a pointer drag onto a sibling's lower half", async () => {
    stubEditorEndpoint();
    renderEditor(baseDocument());
    const target = byTest("block-h");
    await expect.element(target).toBeInTheDocument();
    const rect = target.element().getBoundingClientRect();

    await userEvent.dragAndDrop(byTest("block-s"), target, {
      sourcePosition: { x: 8, y: 4 },
      targetPosition: { x: Math.round(rect.width / 2), y: Math.round(rect.height * 0.9) },
    });

    await expect.poll(() => rootBlockIds()).toEqual(["h", "s", "c"]);
    await expect.element(byTest("blocks-save-state")).toHaveAttribute("data-save-state", "dirty");
  });

  it("changes a block's width from the style panel without a server round trip", async () => {
    const calls = stubEditorEndpoint();
    renderEditor(baseDocument());

    await userEvent.click(byTest("block-h"));
    await expect.element(byTest("block-h")).toHaveAttribute("data-block-width", "full");

    await userEvent.click(byTest("blocks-style-width").getByText("Content"));

    await expect.element(byTest("block-h")).toHaveAttribute("data-block-width", "content");
    await expect.element(byTest("block-h").getByText("Hello")).toBeInTheDocument();
    expect(calls.filter((call) => call.op === "render")).toHaveLength(0);
  });
});
