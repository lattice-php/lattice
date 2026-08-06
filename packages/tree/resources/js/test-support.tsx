import type { RenderResult } from "@testing-library/react";
import { createRegistry, eagerComponent, type RendererComponent } from "@lattice-php/core";
import { fakeNode, renderWithRegistry } from "@lattice-php/core/test-support";
import TreeComponent, { type TreeNodeData } from "./tree";

export { fakeNode, renderWithRegistry };

/**
 * Stand-in body component registered under `"test.text"` alongside
 * `"test.action"`, mirroring the compiled `text` envelope a real node's
 * schema carries.
 */
export const TestText: RendererComponent = ({ node }) => (
  <span>{String(node.props?.text ?? "")}</span>
);

/**
 * Builds a schema-shaped `TreeNodeData` fixture so tests can stay terse
 * without hand-writing the wrapping `test.text` envelope every time.
 */
export function treeNode(
  id: string,
  label: string,
  extra: Partial<TreeNodeData> = {},
): TreeNodeData {
  return {
    id,
    label,
    schema: [{ props: { text: label }, type: "test.text" }],
    ...extra,
  } as TreeNodeData;
}

/** Labels of the `test.action` buttons clicked since the last reset. */
export const actionClicks: string[] = [];

export const TestAction: RendererComponent = ({ node }) => (
  <button onClick={() => actionClicks.push(String(node.props?.label ?? ""))} type="button">
    {String(node.props?.label ?? "")}
  </button>
);

export const TestLink: RendererComponent = ({ node }) => (
  <a href={String(node.props?.href ?? "#")} onClick={(event) => event.preventDefault()}>
    {String(node.props?.label ?? "")}
  </a>
);

/**
 * The registry every renderer suite renders through: the tree itself plus the
 * stand-in body components a node's compiled schema can carry.
 */
export const testRegistry = createRegistry({
  components: {
    "test.action": eagerComponent(TestAction),
    "test.link": eagerComponent(TestLink),
    "test.text": eagerComponent(TestText),
    tree: eagerComponent(TreeComponent),
  },
  name: "test/tree",
});

/**
 * Renders the tree with `props` merged over the inert defaults, so a case
 * spells out only the wire props it exercises.
 */
export function renderTree(props: Record<string, unknown>, id = "t1"): RenderResult {
  const node = fakeNode({
    id,
    props: { defaultExpanded: [], rememberState: false, ...props },
    type: "tree",
  });

  return renderWithRegistry(<TreeComponent node={node}>{null}</TreeComponent>, testRegistry);
}

/**
 * A parent with two children (one linked) plus an unloaded boundary — the
 * shape the render and keyboard suites navigate.
 */
export const sampleNodes: TreeNodeData[] = [
  treeNode("1", "Electronics", {
    children: [treeNode("2", "Laptops", { href: "/c/2" }), treeNode("3", "Phones")],
  }),
  treeNode("9", "Suppliers", { hasChildren: true }),
];
