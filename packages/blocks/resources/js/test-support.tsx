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
  schema: [fakeNode({ props: { label: "Text", name: "text" }, type: "field.text-input" })],
});
export const headingType = blockType("lattice.heading", { label: "Heading" });
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
  columnsType,
  textOnlySectionType,
];

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

export function renderedFor(
  doc: BlockDocument,
  textOf: (node: BlockNode) => string = (node) => String(node.data.text ?? node.type),
): Record<string, Node> {
  const rendered: Record<string, Node> = {};

  const visit = (nodes: readonly BlockNode[]) => {
    for (const node of nodes) {
      const slotNames = Object.keys(node.slots);
      rendered[node.id] =
        slotNames.length > 0 || node.type === columnsType.type
          ? frameFor(node, [], slotNames.length > 0 ? slotNames : ["col_1", "col_2"])
          : textFrame(node, textOf(node));
      Object.values(node.slots).forEach(visit);
    }
  };

  visit(doc.blocks);

  return rendered;
}
