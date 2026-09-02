import type { Node } from "@lattice-php/core";
import { createRegistry, eagerComponent } from "@lattice-php/core";
import type { RendererComponent } from "@lattice-php/core";
import { fakeNode } from "@lattice-php/core/test-support";
import blocksPlugin from "./plugin";
import type { BlockDocument, BlockNode, BlockStyle, BlockTypeData, SlotData } from "./types";
import { emptyStyle } from "./document/tree";

export const TestText: RendererComponent = ({ node }) => (
  <p data-test="test-text">{String(node.props?.text ?? "")}</p>
);

export const TestField: RendererComponent<"field.text-input"> = () => null;

export const testRegistry = createRegistry(blocksPlugin, {
  components: { "test.text": eagerComponent(TestText) },
  name: "test/blocks",
});

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
      props: { allows: null, blockId: node.id, label: name, max: null, min: null, name },
      type: "blocks.slot",
    }),
  );

  return fakeNode({
    props: {
      blockId: node.id,
      blockType: node.type,
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
