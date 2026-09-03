import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core";
import { fakeNode, jsonResponse, renderWithRegistry } from "@lattice-php/core/test-support";
import { formComponents } from "@lattice-php/form";
import { uiComponents } from "@lattice-php/ui";
import BlockEditorView from "./components/editor/block-editor-view";
import blocksPlugin from "./plugin";
import {
  block,
  columnsType,
  document,
  renderedFor,
  testPatterns,
  TestText,
  testTypes,
  textFrame,
  textOnlySectionType,
} from "./test-support";
import type { BlockDocument, BlockNode } from "./types";

const registry = createRegistry(uiComponents, formComponents, blocksPlugin, {
  components: { "test.text": eagerComponent(TestText) },
  name: "test/blocks-jsdom",
});

type EndpointCall = { op: string; body: Record<string, unknown> };

function stubEditorEndpoint(
  respond: (op: string, body: Record<string, unknown>) => Response = () =>
    jsonResponse({ errors: {}, revision: 2 }),
) {
  const calls: EndpointCall[] = [];

  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      const op = init?.method === "PATCH" ? "draft" : String(body._op);
      calls.push({ body, op });

      if (op === "render") {
        const node = body.block as BlockNode;

        return jsonResponse({
          errors: {},
          node: textFrame(node, `Rendered ${String(node.data.text ?? node.type)}`),
        });
      }

      return respond(op, body);
    }),
  );

  return calls;
}

function renderEditor(
  doc: BlockDocument,
  rendered = renderedFor(doc),
  types = testTypes,
  patterns = testPatterns,
) {
  const node = fakeNode({
    id: "pages",
    props: {
      document: doc,
      patterns,
      endpoint: "/lattice/block-editors/pages",
      previewUrl: "/preview",
      ref: "sealed",
      rendered,
      revision: 1,
      title: "Landing",
      types,
    },
    type: "blocks.editor",
  });

  return renderWithRegistry(<BlockEditorView node={node} />, registry);
}

const baseDocument = () =>
  document(
    block("h", "lattice.heading", { text: "Hello" }),
    block(
      "c",
      columnsType.type,
      {},
      { col_1: [block("p", "lattice.paragraph", { text: "Inside" })], col_2: [] },
    ),
    block("s", textOnlySectionType.type, {}, { content: [] }),
  );

function rootBlockIds(): string[] {
  return Array.from(
    globalThis.document.querySelectorAll('[data-test="blocks-canvas-root"] > [data-block-id]'),
    (element) => element.getAttribute("data-block-id") ?? "",
  );
}

function blockIdsIn(container: string): string[] {
  return Array.from(
    globalThis.document.querySelectorAll(`[data-test="${container}"] [data-block-id]`),
    (element) => element.getAttribute("data-block-id") ?? "",
  );
}

function blockTypesIn(container: string): string[] {
  return Array.from(
    globalThis.document.querySelectorAll(`[data-test="${container}"] > [data-block-type]`),
    (element) => element.getAttribute("data-block-type") ?? "",
  );
}

function selectBlock(id: string) {
  fireEvent.click(screen.getByTestId(`block-${id}`));
}

function keyOnBlock(id: string, init: KeyboardEventInit) {
  fireEvent.keyDown(screen.getByTestId(`block-${id}`), init);
}

function saveState() {
  return screen.getByTestId("blocks-save-state").getAttribute("data-save-state");
}

describe("block editor (jsdom)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("selection and block toolbar", () => {
    it("selects a block on click and shows its type in the inspector", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());

      expect(screen.getByTestId("blocks-inspector-empty")).toBeInTheDocument();

      selectBlock("h");

      expect(screen.getByTestId("block-h")).toHaveAttribute("data-selected", "true");
      expect(screen.getByTestId("blocks-inspector-title")).toHaveTextContent("Heading");
      expect(screen.getByTestId("block-toolbar-h")).toBeInTheDocument();
    });

    it("moves the block down and up with the toolbar, disabling the edge direction", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("h");

      expect(screen.getByTestId("block-move-up-h")).toBeDisabled();

      fireEvent.click(screen.getByTestId("block-move-down-h"));
      expect(rootBlockIds()).toEqual(["c", "h", "s"]);
      expect(saveState()).toBe("dirty");

      fireEvent.click(screen.getByTestId("block-move-up-h"));
      expect(rootBlockIds()).toEqual(["h", "c", "s"]);
    });

    it("moves a nested block out of its column when it reaches the slot edge", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("p");

      fireEvent.click(screen.getByTestId("block-move-up-p"));

      expect(rootBlockIds()).toEqual(["h", "p", "c", "s"]);
      expect(blockIdsIn("slot-c-col_1")).toEqual([]);
    });

    it("duplicates the block right after itself and selects the copy", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("h");

      fireEvent.click(screen.getByTestId("block-duplicate-h"));

      const ids = rootBlockIds();
      expect(ids).toHaveLength(4);
      expect(ids[0]).toBe("h");
      expect(screen.getByTestId(`block-${ids[1]}`)).toHaveAttribute("data-selected", "true");
      expect(within(screen.getByTestId(`block-${ids[1]}`)).getByText("Hello")).toBeInTheDocument();
    });

    it("removes the block and clears the inspector", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("h");

      fireEvent.click(screen.getByTestId("block-remove-h"));

      expect(rootBlockIds()).toEqual(["c", "s"]);
      expect(screen.getByTestId("blocks-inspector-empty")).toBeInTheDocument();
    });

    it("shows the hover label for unselected blocks only", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());

      expect(within(screen.getByTestId("block-h")).queryByText("Heading")).toBeNull();

      fireEvent.mouseEnter(screen.getByTestId("block-h"));
      expect(within(screen.getByTestId("block-h")).getByText("Heading")).toBeInTheDocument();

      fireEvent.mouseLeave(screen.getByTestId("block-h"));
      expect(within(screen.getByTestId("block-h")).queryByText("Heading")).toBeNull();

      fireEvent.mouseEnter(screen.getByTestId("block-h"));
      selectBlock("h");
      expect(within(screen.getByTestId("block-h")).getAllByText("Heading")).toHaveLength(1);
      expect(
        within(screen.getByTestId("block-toolbar-h")).getByText("Heading"),
      ).toBeInTheDocument();
    });
  });

  describe("topbar", () => {
    it("enables undo after a change, reverts it, and offers redo", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());

      expect(screen.getByTestId("blocks-undo")).toBeDisabled();
      expect(screen.getByTestId("blocks-redo")).toBeDisabled();

      selectBlock("h");
      fireEvent.click(screen.getByTestId("block-remove-h"));
      expect(screen.getByTestId("blocks-undo")).toBeEnabled();

      fireEvent.click(screen.getByTestId("blocks-undo"));
      expect(rootBlockIds()).toEqual(["h", "c", "s"]);
      expect(screen.getByTestId("blocks-redo")).toBeEnabled();

      fireEvent.click(screen.getByTestId("blocks-redo"));
      expect(rootBlockIds()).toEqual(["c", "s"]);
    });

    it("links to the preview and publishes the document, then reports it as published", async () => {
      const calls = stubEditorEndpoint(() => jsonResponse({ errors: {}, revision: 7 }));
      renderEditor(baseDocument());

      expect(screen.getByTestId("blocks-preview")).toHaveAttribute("href", "/preview");

      fireEvent.click(screen.getByTestId("blocks-publish"));

      await waitFor(() => expect(saveState()).toBe("saved"));
      expect(screen.getByTestId("blocks-save-state")).toHaveTextContent("Published");
      expect(calls.map((call) => call.op)).toEqual(["publish"]);
      expect(calls[0]?.body).toMatchObject({ revision: 1 });
    });

    it("marks a conflict when publishing hits a newer revision and blocks further publishing", async () => {
      stubEditorEndpoint(() => jsonResponse({ message: "stale", revision: 9 }, { status: 409 }));
      renderEditor(baseDocument());

      fireEvent.click(screen.getByTestId("blocks-publish"));

      await waitFor(() => expect(saveState()).toBe("conflict"));
      expect(screen.getByTestId("blocks-save-state")).toHaveTextContent("Changed elsewhere");
      expect(screen.getByTestId("blocks-conflict-dialog")).toBeInTheDocument();
      expect(screen.getByTestId("blocks-publish")).toBeDisabled();
    });

    it("reloads the page from the conflict dialog", async () => {
      stubEditorEndpoint(() => jsonResponse({ message: "stale", revision: 9 }, { status: 409 }));
      const reload = vi.fn();
      vi.stubGlobal("location", { ...window.location, reload });
      renderEditor(baseDocument());

      fireEvent.click(screen.getByTestId("blocks-publish"));
      await waitFor(() => expect(saveState()).toBe("conflict"));

      fireEvent.click(screen.getByTestId("blocks-conflict-reload"));

      expect(reload).toHaveBeenCalledTimes(1);
    });

    it("overwrites the newer revision from the conflict dialog and resumes saving", async () => {
      const calls = stubEditorEndpoint((op) =>
        op === "publish"
          ? jsonResponse({ message: "stale", revision: 9 }, { status: 409 })
          : jsonResponse({ errors: {}, revision: 10 }),
      );
      renderEditor(baseDocument());

      fireEvent.click(screen.getByTestId("blocks-publish"));
      await waitFor(() => expect(saveState()).toBe("conflict"));

      fireEvent.click(screen.getByTestId("blocks-conflict-overwrite"));

      await waitFor(() => expect(saveState()).toBe("saved"));
      const draft = calls.find((call) => call.op === "draft");
      expect(draft?.body.revision).toBe(9);
      expect(screen.queryByTestId("blocks-conflict-dialog")).toBeNull();
      expect(screen.getByTestId("blocks-publish")).toBeEnabled();
    });

    it("announces a successful publish as a toast", async () => {
      stubEditorEndpoint(() => jsonResponse({ revision: 4 }));
      const toasts: unknown[] = [];
      const listener = (event: Event) => toasts.push((event as CustomEvent).detail);
      window.addEventListener("lattice:toast", listener);
      renderEditor(baseDocument());

      fireEvent.click(screen.getByTestId("blocks-publish"));

      await waitFor(() => expect(saveState()).toBe("saved"));
      expect(toasts).toEqual([{ message: "The page is published.", variant: "success" }]);
      window.removeEventListener("lattice:toast", listener);
    });

    it("switches the canvas width preview from the topbar", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());

      expect(screen.getByTestId("blocks-canvas")).toHaveAttribute("data-canvas-width", "desktop");

      fireEvent.click(
        within(screen.getByTestId("blocks-canvas-width")).getByRole("radio", { name: "Mobile" }),
      );

      expect(screen.getByTestId("blocks-canvas")).toHaveAttribute("data-canvas-width", "mobile");
      expect(
        within(screen.getByTestId("blocks-canvas-width")).getByRole("radio", { name: "Mobile" }),
      ).toHaveAttribute("aria-checked", "true");
    });

    it("surfaces publish validation errors on the block's content fields", async () => {
      stubEditorEndpoint(() =>
        jsonResponse({ errors: { n: { text: ["Text is required"] } } }, { status: 422 }),
      );
      renderEditor(document(block("n", "lattice.note", { text: "" })));

      fireEvent.click(screen.getByTestId("blocks-publish"));
      await waitFor(() => expect(screen.getByTestId("blocks-publish")).toBeEnabled());

      selectBlock("n");
      fireEvent.click(screen.getByTestId("blocks-inspector-tab-content"));

      expect(await screen.findByText("Text is required")).toBeInTheDocument();
    });

    it("reports a failed publish without leaving the button stuck", async () => {
      stubEditorEndpoint(() => jsonResponse({}, { status: 500 }));
      renderEditor(baseDocument());

      fireEvent.click(screen.getByTestId("blocks-publish"));

      await waitFor(() => expect(saveState()).toBe("error"));
      expect(screen.getByTestId("blocks-save-state")).toHaveTextContent("Could not save");
      expect(screen.getByTestId("blocks-publish")).toBeEnabled();
    });
  });

  describe("keyboard", () => {
    it("walks the selection with the arrow keys and clears it with Escape", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("h");

      keyOnBlock("h", { key: "ArrowDown" });
      expect(screen.getByTestId("block-c")).toHaveAttribute("data-selected", "true");

      keyOnBlock("c", { key: "ArrowDown" });
      expect(screen.getByTestId("block-p")).toHaveAttribute("data-selected", "true");

      keyOnBlock("p", { key: "ArrowUp" });
      expect(screen.getByTestId("block-c")).toHaveAttribute("data-selected", "true");

      keyOnBlock("c", { key: "Escape" });
      expect(screen.getByTestId("blocks-inspector-empty")).toBeInTheDocument();
    });

    it("deletes the selected block with Backspace and brings it back with undo and redo shortcuts", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("p");

      keyOnBlock("p", { key: "Backspace" });
      expect(blockIdsIn("slot-c-col_1")).toEqual([]);

      fireEvent.keyDown(screen.getByTestId("blocks-canvas-root"), { key: "z", metaKey: true });
      expect(blockIdsIn("slot-c-col_1")).toEqual(["p"]);

      fireEvent.keyDown(screen.getByTestId("blocks-canvas-root"), { key: "y", ctrlKey: true });
      expect(blockIdsIn("slot-c-col_1")).toEqual([]);

      fireEvent.keyDown(screen.getByTestId("blocks-canvas-root"), { key: "z", ctrlKey: true });
      fireEvent.keyDown(screen.getByTestId("blocks-canvas-root"), {
        key: "z",
        metaKey: true,
        shiftKey: true,
      });
      expect(blockIdsIn("slot-c-col_1")).toEqual([]);
    });

    it("duplicates with Cmd+Shift+D and moves with Alt+Arrow", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("h");

      keyOnBlock("h", { key: "D", metaKey: true, shiftKey: true });
      expect(rootBlockIds()).toHaveLength(4);
      const copyId = rootBlockIds()[1] as string;
      expect(screen.getByTestId(`block-${copyId}`)).toHaveAttribute("data-selected", "true");

      keyOnBlock(copyId, { key: "ArrowDown", altKey: true });
      expect(rootBlockIds()).toEqual(["h", "c", copyId, "s"]);

      keyOnBlock(copyId, { key: "ArrowUp", altKey: true });
      expect(rootBlockIds()).toEqual(["h", copyId, "c", "s"]);
    });

    it("ignores editing shortcuts while typing in the inspector", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("h");
      fireEvent.click(screen.getByTestId("blocks-inspector-tab-advanced"));

      fireEvent.keyDown(screen.getByTestId("blocks-style-anchor"), { key: "Backspace" });
      fireEvent.keyDown(screen.getByTestId("blocks-style-anchor"), { key: "z", metaKey: true });

      expect(rootBlockIds()).toEqual(["h", "c", "s"]);
      expect(screen.getByTestId("block-h")).toHaveAttribute("data-selected", "true");
    });

    it("does nothing for block shortcuts without a selection", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());

      fireEvent.keyDown(screen.getByTestId("blocks-canvas-root"), { key: "Backspace" });
      fireEvent.keyDown(screen.getByTestId("blocks-canvas-root"), { key: "ArrowDown" });

      expect(rootBlockIds()).toEqual(["h", "c", "s"]);
      expect(screen.getByTestId("blocks-inspector-empty")).toBeInTheDocument();
    });
  });

  describe("library", () => {
    it("inserts a pattern's blocks with fresh ids after the selected block", async () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("h");

      fireEvent.click(
        within(screen.getByTestId("blocks-library-tabs")).getByRole("radio", { name: "Patterns" }),
      );
      fireEvent.click(screen.getByTestId("pattern-intro"));

      expect(await screen.findByText("Rendered Pattern heading")).toBeInTheDocument();
      expect(await screen.findByText("Rendered lattice.paragraph")).toBeInTheDocument();

      const ids = rootBlockIds();
      expect(ids).toHaveLength(5);
      expect(ids[0]).toBe("h");
      expect(ids).not.toContain("tpl_h");
      expect(blockTypesIn("blocks-canvas-root").slice(1, 3)).toEqual([
        "lattice.heading",
        "lattice.paragraph",
      ]);
      expect(saveState()).toBe("dirty");
    });

    it("hides the pattern tabs when the editor offers no patterns", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument(), renderedFor(baseDocument()), testTypes, []);

      expect(screen.queryByTestId("blocks-library-tabs")).toBeNull();
      expect(screen.getByTestId("library-lattice.paragraph")).toBeInTheDocument();
    });

    it("filters block types by the search query and reports when nothing matches", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      const search = screen.getByTestId("blocks-library-search");

      fireEvent.change(search, { target: { value: "para" } });
      expect(screen.getByTestId("library-lattice.paragraph")).toBeInTheDocument();
      expect(screen.queryByTestId("library-lattice.heading")).toBeNull();

      fireEvent.change(search, { target: { value: "zzz" } });
      expect(screen.getByText("No blocks match.")).toBeInTheDocument();

      fireEvent.change(search, { target: { value: "" } });
      expect(screen.getByTestId("library-lattice.heading")).toBeInTheDocument();
    });

    it("inserts a clicked type after the selected block and renders it", async () => {
      const calls = stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("p");

      fireEvent.click(screen.getByTestId("library-lattice.heading"));

      expect(await screen.findByText("Rendered lattice.heading")).toBeInTheDocument();
      const ids = blockIdsIn("slot-c-col_1");
      expect(ids).toHaveLength(2);
      expect(ids[0]).toBe("p");
      expect(screen.getByTestId(`block-${ids[1]}`)).toHaveAttribute("data-selected", "true");
      expect(calls.filter((call) => call.op === "render")).toHaveLength(1);
    });

    it("appends to the root when the selected slot forbids the clicked type", async () => {
      stubEditorEndpoint();
      renderEditor(
        document(
          block(
            "s",
            textOnlySectionType.type,
            {},
            {
              content: [block("p", "lattice.paragraph", { text: "Only text" })],
            },
          ),
        ),
      );
      selectBlock("p");

      fireEvent.click(screen.getByTestId("library-lattice.heading"));

      await waitFor(() => expect(rootBlockIds()).toHaveLength(2));
      expect(blockIdsIn("slot-s-content")).toEqual(["p"]);
      expect(blockTypesIn("blocks-canvas-root")[1]).toBe("lattice.heading");
    });

    it("appends to the root when nothing is selected", async () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());

      fireEvent.click(screen.getByTestId("library-lattice.paragraph"));

      expect(await screen.findByText("Rendered lattice.paragraph")).toBeInTheDocument();
      expect(rootBlockIds()).toHaveLength(4);
      expect(blockTypesIn("blocks-canvas-root")[3]).toBe("lattice.paragraph");
    });
  });

  describe("insert menus", () => {
    it("lists every type at the root and inserts the chosen one at the end", async () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());

      fireEvent.click(screen.getByTestId("insert-root-root"));
      const menu = screen.getByTestId("insert-root-root-menu");
      expect(within(menu).getAllByRole("menuitem")).toHaveLength(testTypes.length);

      fireEvent.click(screen.getByTestId("insert-root-root-lattice.columns"));

      expect(screen.queryByTestId("insert-root-root-menu")).toBeNull();
      expect(await screen.findByText("Rendered lattice.columns")).toBeInTheDocument();
      expect(rootBlockIds()).toHaveLength(4);
      expect(blockTypesIn("blocks-canvas-root")[3]).toBe("lattice.columns");
    });

    it("offers only the slot's allowed types and closes on an outside click", async () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());

      fireEvent.click(screen.getByTestId("insert-s-content"));
      const menu = screen.getByTestId("insert-s-content-menu");
      expect(within(menu).getAllByRole("menuitem")).toHaveLength(1);
      expect(screen.getByTestId("insert-s-content-lattice.paragraph")).toBeInTheDocument();

      fireEvent.mouseDown(screen.getByTestId("blocks-canvas-root"));
      expect(screen.queryByTestId("insert-s-content-menu")).toBeNull();

      fireEvent.click(screen.getByTestId("insert-s-content"));
      fireEvent.click(screen.getByTestId("insert-s-content-lattice.paragraph"));
      expect(await screen.findByText("Rendered lattice.paragraph")).toBeInTheDocument();
      expect(blockIdsIn("slot-s-content")).toHaveLength(1);
    });

    it("hides the insert button of a slot that is full", () => {
      stubEditorEndpoint();
      renderEditor(
        document(
          block(
            "c",
            columnsType.type,
            {},
            {
              col_1: [],
              col_2: [block("a", "lattice.paragraph"), block("b", "lattice.paragraph")],
            },
          ),
        ),
      );

      expect(screen.queryByTestId("insert-c-col_2")).toBeNull();
      expect(screen.getByTestId("insert-c-col_1")).toBeInTheDocument();
    });
  });

  describe("inspector panels", () => {
    it("writes the anchor into the block frame id and undoes it", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("h");
      fireEvent.click(screen.getByTestId("blocks-inspector-tab-advanced"));

      fireEvent.change(screen.getByTestId("blocks-style-anchor"), { target: { value: " intro " } });

      expect(screen.getByTestId("blocks-style-anchor")).toHaveValue("intro");
      expect(screen.getByTestId("block-h").querySelector("#intro")).not.toBeNull();

      fireEvent.click(screen.getByTestId("blocks-undo"));
      expect(screen.getByTestId("block-h").querySelector("#intro")).toBeNull();
      expect(screen.getByTestId("blocks-style-anchor")).toHaveValue("");
    });

    it("changes spacing, background, alignment and visibility from the style panel", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("h");

      fireEvent.change(screen.getByTestId("blocks-style-paddingTop"), { target: { value: "lg" } });
      expect(screen.getByTestId("blocks-style-paddingTop")).toHaveValue("lg");

      fireEvent.change(screen.getByTestId("blocks-style-paddingTop"), { target: { value: "" } });
      expect(screen.getByTestId("blocks-style-paddingTop")).toHaveValue("");

      fireEvent.click(within(screen.getByTestId("blocks-style-background")).getByText("Muted"));
      expect(
        within(screen.getByTestId("blocks-style-background")).getByText("Muted"),
      ).toHaveAttribute("aria-checked", "true");

      fireEvent.click(within(screen.getByTestId("blocks-style-align")).getByText("Center"));
      expect(within(screen.getByTestId("blocks-style-align")).getByText("Center")).toHaveAttribute(
        "aria-checked",
        "true",
      );

      fireEvent.click(screen.getByTestId("blocks-style-hide-mobile"));
      expect(screen.getByTestId("blocks-style-hide-mobile")).toHaveAttribute(
        "aria-checked",
        "true",
      );

      fireEvent.click(screen.getByTestId("blocks-style-hide-desktop"));
      expect(screen.getByTestId("blocks-style-hide-desktop")).toHaveAttribute(
        "aria-checked",
        "true",
      );

      expect(saveState()).toBe("dirty");
    });

    it("keeps the style tab when a selected block has no unbound fields", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("h");
      fireEvent.click(screen.getByTestId("blocks-inspector-tab-content"));
      expect(screen.getByTestId("blocks-inspector-tab-content")).toHaveAttribute(
        "aria-selected",
        "true",
      );

      selectBlock("p");

      expect(screen.queryByTestId("blocks-inspector-tab-content")).toBeNull();
      expect(screen.getByTestId("blocks-inspector-tab-style")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByTestId("blocks-style-panel")).toBeInTheDocument();
    });

    it("selects blocks from the structure panel and the breadcrumbs", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());

      fireEvent.click(screen.getByTestId("structure-p"));

      expect(screen.getByTestId("block-p")).toHaveAttribute("data-selected", "true");
      const crumbs = within(screen.getByTestId("blocks-breadcrumbs")).getAllByRole("button");
      expect(crumbs.map((crumb) => crumb.textContent)).toEqual(["Columns", "Paragraph"]);

      fireEvent.click(crumbs[0] as HTMLElement);
      expect(screen.getByTestId("block-c")).toHaveAttribute("data-selected", "true");

      fireEvent.click(screen.getByTestId("blocks-inspector-tab-structure"));
      expect(screen.getByTestId("structure-c")).toHaveAttribute("aria-current", "true");
    });

    it("deselects when clicking the empty canvas", () => {
      stubEditorEndpoint();
      renderEditor(baseDocument());
      selectBlock("h");

      fireEvent.click(screen.getByTestId("blocks-canvas-root"));

      expect(screen.getByTestId("blocks-inspector-empty")).toBeInTheDocument();
      expect(screen.queryByTestId("blocks-breadcrumbs")).toBeNull();
    });
  });

  describe("rendering", () => {
    it("renders a block that arrived without markup through the endpoint", async () => {
      const calls = stubEditorEndpoint();
      const doc = document(block("h", "lattice.heading", { text: "Late" }));
      renderEditor(doc, {});

      expect(screen.getByTestId("block-h")).toHaveAttribute("data-block-pending");

      expect(await screen.findByText("Rendered Late")).toBeInTheDocument();
      expect(calls.filter((call) => call.op === "render")).toHaveLength(1);
    });

    it("opens an empty page with one paragraph ready for typing", async () => {
      stubEditorEndpoint();
      renderEditor(document());

      expect(screen.queryByTestId("blocks-empty")).toBeNull();
      await waitFor(() =>
        expect(blockTypesIn("blocks-canvas-root")).toEqual(["lattice.paragraph"]),
      );
    });

    it("shows the empty state without a paragraph type and hides it once a block exists", async () => {
      stubEditorEndpoint();
      const types = testTypes.filter((type) => type.type !== "lattice.paragraph");
      renderEditor(document(), renderedFor(document()), types);

      expect(screen.getByTestId("blocks-empty")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("library-lattice.heading"));

      expect(screen.queryByTestId("blocks-empty")).toBeNull();
      expect(await screen.findByText("Rendered lattice.heading")).toBeInTheDocument();
      expect(rootBlockIds()).toHaveLength(1);
    });

    it("autosaves the draft after edits and reports the saved state", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const calls = stubEditorEndpoint(() => jsonResponse({ errors: {}, revision: 3 }));
      renderEditor(baseDocument());
      selectBlock("h");
      fireEvent.click(screen.getByTestId("block-remove-h"));
      expect(saveState()).toBe("dirty");

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5_100);
      });

      await waitFor(() => expect(saveState()).toBe("saved"));
      expect(calls.filter((call) => call.op === "draft")).toHaveLength(1);
      expect(screen.getByTestId("blocks-save-state")).toHaveTextContent("Draft saved");
      vi.useRealTimers();
    });
  });
});
