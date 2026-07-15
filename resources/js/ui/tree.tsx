import { Renderer } from "@lattice-php/lattice/core/renderer";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { Icon, IconRenderer } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import type {
  Tree as TreeProps,
  TreeNode as GeneratedTreeNode,
} from "@lattice-php/lattice/types/generated";
import { Badge } from "./badge";
import { TextLink } from "./link";
import { TreeContext, useTreeContext, useTreeState } from "./tree-context";

/**
 * The actual sparse wire shape a tree node serializes as (see `TreeNode::jsonSerialize()`):
 * every optional/falsy field is omitted rather than sent as `null`/`false`, unlike the
 * generated `TreeNode`, which reflects every declared PHP property as required.
 */
export type TreeNodeData = Pick<GeneratedTreeNode, "id" | "label"> &
  Partial<Omit<GeneratedTreeNode, "children" | "id" | "label">> & {
    children?: TreeNodeData[];
  };

declare module "@lattice-php/lattice/core/types" {
  interface ComponentProps {
    tree: TreeProps & { nodes: TreeNodeData[] };
  }
}

function hasExpandableChildren(node: TreeNodeData): boolean {
  return Boolean(node.children?.length) || node.hasChildren === true;
}

function TreeItem({ node }: { node: TreeNodeData }) {
  const { activeId, expanded, toggle } = useTreeContext();
  const isExpanded = expanded.has(node.id);
  const isActive = activeId === node.id;
  const isDisabled = node.disabled === true;
  const expandable = hasExpandableChildren(node);

  return (
    <li
      aria-disabled={isDisabled}
      aria-selected={isActive}
      data-test={`tree-node-${node.id}`}
      role="treeitem"
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-lt-sm px-2 py-1.5 text-sm text-lt-fg",
          isActive && "bg-lt-muted font-medium",
          isDisabled && "pointer-events-none opacity-50",
        )}
      >
        {expandable ? (
          <button
            aria-expanded={isExpanded}
            data-test={`tree-node-${node.id}-toggle`}
            onClick={() => toggle(node.id)}
            type="button"
          >
            <Icon
              className={cn(
                "size-lt-icon-md shrink-0 transition-transform",
                isExpanded && "rotate-90",
              )}
              name="chevron-right"
            />
          </button>
        ) : null}
        {node.icon ? <IconRenderer className="size-lt-icon-md shrink-0" icon={node.icon} /> : null}
        {node.href && !isDisabled ? (
          <TextLink href={node.href}>{node.label}</TextLink>
        ) : (
          <span>{node.label}</span>
        )}
        {node.badge ? <Badge variant="secondary">{node.badge}</Badge> : null}
        {node.actions ? (
          <span className="ml-auto">
            <Renderer nodes={[node.actions]} />
          </span>
        ) : null}
      </div>
      {expandable && isExpanded && node.children && node.children.length > 0 ? (
        <ul className="pl-6" role="group">
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

const TreeComponent: RendererComponent<"tree"> = ({ node }) => {
  const identity = nodeIdentity(node);
  const value = useTreeState({
    activeId: node.props.activeId,
    defaultExpanded: node.props.defaultExpanded,
    rememberState: node.props.rememberState,
    storageKey: `lattice:tree:${identity ?? "default"}`,
  });

  return (
    <TreeContext.Provider value={value}>
      <ul data-lattice-component={identity} role="tree">
        {node.props.nodes.map((child) => (
          <TreeItem key={child.id} node={child} />
        ))}
      </ul>
    </TreeContext.Provider>
  );
};

export default TreeComponent;
