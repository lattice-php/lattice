import type { Node } from "@lattice-php/core";
import { createRegistry, eagerComponent } from "@lattice-php/core";
import type { RendererComponent } from "@lattice-php/core";
import { fakeNode, jsonResponse } from "@lattice-php/core/test-support";
import { vi } from "vitest";
import blocksPlugin from "./plugin";
import type {
  BlockDocument,
  BlockNode,
  BlockPatternData,
  BlockStyle,
  BlockTypeData,
  SlotData,
  StyleClasses,
} from "./types";

export const TestText: RendererComponent = ({ node }) => (
  <p data-test="test-text">{String(node.props?.text ?? "")}</p>
);

export const TestField: RendererComponent<"field.text-input"> = () => null;

export const testRegistry = createRegistry(blocksPlugin, {
  components: { "test.text": eagerComponent(TestText) },
  name: "test/blocks",
});

/** The default style vocabulary, as the server ships it on the editor wire. */
export const testStyleClasses: StyleClasses = {
  align: { center: "text-center", start: "text-start" },
  background: {
    inverted: "bg-lt-fg text-lt-bg",
    muted: "bg-lt-muted text-lt-fg",
    none: "",
    primary: "bg-lt-primary",
  },
  backgroundPadding: "px-6",
  hideOnDesktop: "md:hidden",
  hideOnMobile: "max-md:hidden",
  marginBottom: { lg: "mb-12", md: "mb-8", none: "mb-0", sm: "mb-4", xl: "mb-20", xs: "mb-2" },
  marginTop: { lg: "mt-12", md: "mt-8", none: "mt-0", sm: "mt-4", xl: "mt-20", xs: "mt-2" },
  paddingBottom: { lg: "pb-12", md: "pb-8", none: "pb-0", sm: "pb-4", xl: "pb-20", xs: "pb-2" },
  paddingTop: { lg: "pt-12", md: "pt-8", none: "pt-0", sm: "pt-4", xl: "pt-20", xs: "pt-2" },
  width: { content: "mx-auto w-full max-w-3xl", full: "w-full", wide: "mx-auto w-full max-w-6xl" },
};

function emptyStyle(): BlockStyle {
  return {
    align: null,
    anchor: null,
    background: null,
    hideOnDesktop: false,
    hideOnMobile: false,
    marginBottom: null,
    marginTop: null,
    paddingBottom: null,
    paddingTop: null,
    width: null,
  };
}

export function slot(name: string, extra: Partial<SlotData> = {}): SlotData {
  return { allows: null, label: name, max: null, min: null, name, ...extra };
}

export function blockType(type: string, extra: Partial<BlockTypeData> = {}): BlockTypeData {
  return {
    category: "text",
    defaults: {},
    description: null,
    icon: null,
    keywords: [],
    label: type.split(".").pop() ?? type,
    schema: [],
    slots: [],
    supports: {
      align: true,
      anchor: true,
      background: true,
      spacing: true,
      visibility: true,
      width: true,
    },
    type,
    ...extra,
  };
}

export const paragraphType = blockType("lattice.paragraph", {
  label: "Paragraph",
  schema: [
    fakeNode({
      props: {
        extensions: [],
        label: "Content",
        name: "content",
        placeholder: "Write something or type / for blocks",
      },
      type: "field.rich-editor",
    }),
  ],
});
export const headingType = blockType("lattice.heading", {
  label: "Heading",
  schema: [
    fakeNode({
      props: { label: "Text", name: "text", placeholder: "Heading" },
      type: "field.text-input",
    }),
    fakeNode({
      props: { label: "Level", name: "level", options: [{ label: "H2", value: "2" }] },
      type: "field.select",
    }),
  ],
});
/** A block edited only through the inspector: nothing in its render is bound. */
export const noteType = blockType("lattice.note", {
  label: "Note",
  schema: [fakeNode({ props: { label: "Text", name: "text" }, type: "field.text-input" })],
});
export const ctaType = blockType("lattice.cta", {
  category: "layout",
  label: "Call to action",
  schema: [
    fakeNode({ props: { label: "Label", name: "label" }, type: "field.text-input" }),
    fakeNode({ props: { label: "Open in new tab", name: "external" }, type: "field.toggle" }),
  ],
});
export const columnsType = blockType("lattice.columns", {
  category: "layout",
  label: "Columns",
  slots: [slot("col_1", { label: "Column 1" }), slot("col_2", { label: "Column 2", max: 2 })],
});
export const textOnlySectionType = blockType("lattice.text-section", {
  category: "layout",
  label: "Text section",
  slots: [slot("content", { allows: ["lattice.paragraph"], label: "Content" })],
});

export const testTypes: BlockTypeData[] = [
  paragraphType,
  headingType,
  noteType,
  ctaType,
  columnsType,
  textOnlySectionType,
];

export const testPatterns: BlockPatternData[] = [
  {
    blocks: [
      block("tpl_h", "lattice.heading", { text: "Pattern heading" }),
      block("tpl_p", "lattice.paragraph", { content: richDoc("Pattern text") }),
    ],
    description: "A heading followed by a paragraph.",
    icon: null,
    key: "intro",
    label: "Intro",
  },
  {
    blocks: [block("tpl_n", "lattice.note", { text: "Note" })],
    description: null,
    icon: null,
    key: "note-only",
    label: "Note only",
  },
];

export function richDoc(text: string): Record<string, unknown> {
  return { content: [{ content: [{ text, type: "text" }], type: "paragraph" }], type: "doc" };
}

export function block(
  id: string,
  type: string,
  data: Record<string, unknown> = {},
  slots: Record<string, BlockNode[]> = {},
  style: Partial<BlockStyle> = {},
): BlockNode {
  return { data, id, slots, style: { ...emptyStyle(), ...style }, type };
}

export function document(...blocks: BlockNode[]): BlockDocument {
  return { blocks, version: 1 };
}

/** The shallow frame node the server would return for a block. */
export function frameFor(node: BlockNode, content: Node[] = [], slotNames: string[] = []): Node {
  const slots: Node[] = slotNames.map((name) =>
    fakeNode({
      key: `${node.id}-${name}`,
      props: { allows: null, blockId: node.id, label: name, max: null, min: null, name },
      type: "blocks.slot",
    }),
  );

  return fakeNode({
    props: {
      blockId: node.id,
      blockType: node.type,
      classes: { inner: "w-full", outer: "" },
      style: node.style,
      supports: {
        align: true,
        anchor: true,
        background: true,
        spacing: true,
        visibility: true,
        width: true,
      },
    },
    schema: [...content, ...slots],
    type: "blocks.frame",
  });
}

export function textFrame(node: BlockNode, text: string): Node {
  return frameFor(node, [fakeNode({ props: { text }, type: "test.text" })]);
}

/** The heading block's render: a real heading whose text is bound to the `text` field. */
export function headingFrame(node: BlockNode): Node {
  return frameFor(node, [
    fakeNode({
      props: { binding: "text", level: 2, text: String(node.data.text ?? "") },
      type: "heading",
    }),
  ]);
}

/** The paragraph block's render: rich text bound to the `content` field. */
export function richFrame(node: BlockNode): Node {
  return frameFor(node, [
    fakeNode({
      props: {
        binding: "content",
        document: node.data.content ?? null,
        html: "",
        placeholder: "Write something or type / for blocks",
      },
      type: "blocks.rich-text",
    }),
  ]);
}

/** The call-to-action render: a button bound to `label` and a marker bound to the `external` toggle. */
export function ctaFrame(node: BlockNode): Node {
  return frameFor(node, [
    fakeNode({
      props: { binding: "label", emphasis: "solid", label: String(node.data.label ?? "") },
      type: "button",
    }),
    fakeNode({
      props: { binding: "external", text: node.data.external ? "opens in new tab" : "same tab" },
      type: "text",
    }),
  ]);
}

/** What the server would render for a block of the fixture types. */
export function renderedFrame(
  node: BlockNode,
  textOf: (node: BlockNode) => string = (node) => String(node.data.text ?? node.type),
): Node {
  const slotNames = Object.keys(node.slots);

  if (slotNames.length > 0 || node.type === columnsType.type) {
    return frameFor(node, [], slotNames.length > 0 ? slotNames : ["col_1", "col_2"]);
  }

  switch (node.type) {
    case headingType.type:
      return headingFrame(node);
    case paragraphType.type:
      return richFrame(node);
    case ctaType.type:
      return ctaFrame(node);
    default:
      return textFrame(node, textOf(node));
  }
}

export function renderedFor(
  doc: BlockDocument,
  textOf: (node: BlockNode) => string = (node) => String(node.data.text ?? node.type),
): Record<string, Node> {
  const rendered: Record<string, Node> = {};

  const visit = (nodes: readonly BlockNode[]) => {
    for (const node of nodes) {
      rendered[node.id] = renderedFrame(node, textOf);
      Object.values(node.slots).forEach(visit);
    }
  };

  visit(doc.blocks);

  return rendered;
}

export type EditorEndpointCall = { op: string; body: Record<string, unknown> };

export function renderedTextFrame(node: BlockNode): Node {
  return textFrame(node, `Rendered ${String(node.data.text ?? node.type)}`);
}

/**
 * Stub the editor endpoint, recording every call. Render ops answer with a
 * frame so the canvas can mount the block; everything else falls to `respond`.
 */
export function stubEditorFetch({
  render = renderedFrame,
  respond = () => jsonResponse({ errors: {}, revision: 2 }),
}: {
  render?: (node: BlockNode) => Node;
  respond?: (op: string, body: Record<string, unknown>) => Response;
} = {}): EditorEndpointCall[] {
  const calls: EditorEndpointCall[] = [];

  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      const op = init?.method === "PATCH" ? "draft" : String(body._op);
      calls.push({ body, op });

      if (op === "render") {
        return jsonResponse({ errors: {}, node: render(body.block as BlockNode) });
      }

      return respond(op, body);
    }),
  );

  return calls;
}

export function blockEditorNode(doc: BlockDocument, props: Record<string, unknown> = {}) {
  return fakeNode({
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
      ...props,
    },
    type: "blocks.editor",
  });
}

export function rootBlocks(): { id: string; type: string }[] {
  return Array.from(
    globalThis.document.querySelectorAll('[data-test="blocks-canvas-root"] > [data-block-id]'),
    (element) => ({
      id: element.getAttribute("data-block-id") ?? "",
      type: element.getAttribute("data-block-type") ?? "",
    }),
  );
}

export function rootBlockIds(): string[] {
  return rootBlocks().map((entry) => entry.id);
}

export function blockIdsIn(container: string): string[] {
  return Array.from(
    globalThis.document.querySelectorAll(`[data-test="${container}"] [data-block-id]`),
    (element) => element.getAttribute("data-block-id") ?? "",
  );
}
