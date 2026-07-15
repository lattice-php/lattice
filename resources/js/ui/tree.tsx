import { router } from "@inertiajs/react";
import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { Icon, IconRenderer } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
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

function TreeItem({
  depth,
  node,
  parentPath,
  siblingCount,
  siblingIndex,
}: {
  depth: number;
  node: TreeNodeData;
  parentPath: string | null;
  siblingCount: number;
  siblingIndex: number;
}) {
  const {
    activate,
    activeId,
    expanded,
    focusedId,
    moveFocus,
    register,
    toggle,
    typeAhead,
    unregister,
  } = useTreeContext();
  const { t } = useT("lattice");
  const ref = useRef<HTMLLIElement>(null);
  const path = parentPath ? `${parentPath}/${node.id}` : node.id;
  const isExpanded = expanded.has(node.id);
  const isActive = activeId === node.id;
  const isFocused = focusedId === node.id;
  const isDisabled = node.disabled === true;
  const expandable = hasExpandableChildren(node);

  useEffect(() => {
    register({ id: node.id, label: node.label, parentPath, path, ref });

    return () => unregister(path);
  }, [node.id, node.label, parentPath, path, register, unregister]);

  function onKeyDown(event: KeyboardEvent<HTMLLIElement>): void {
    if (event.target !== event.currentTarget) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveFocus(node.id, "next");
        return;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(node.id, "prev");
        return;
      case "ArrowRight":
        event.preventDefault();
        if (expandable && !isExpanded) {
          toggle(node.id);
        } else if (expandable) {
          moveFocus(node.id, "firstChild");
        }
        return;
      case "ArrowLeft":
        event.preventDefault();
        if (expandable && isExpanded) {
          toggle(node.id);
        } else {
          moveFocus(node.id, "parent");
        }
        return;
      case "Home":
        event.preventDefault();
        moveFocus(node.id, "first");
        return;
      case "End":
        event.preventDefault();
        moveFocus(node.id, "last");
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (isDisabled) {
          return;
        }
        if (node.href) {
          router.visit(node.href);
        } else {
          activate(node.id);
        }
        return;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          typeAhead(node.id, event.key);
        }
    }
  }

  return (
    <li
      aria-disabled={isDisabled}
      aria-expanded={expandable ? isExpanded : undefined}
      aria-level={depth}
      aria-posinset={siblingIndex}
      aria-selected={isActive}
      aria-setsize={siblingCount}
      data-test={`tree-node-${node.id}`}
      onKeyDown={onKeyDown}
      ref={ref}
      role="treeitem"
      tabIndex={isFocused ? 0 : -1}
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
            aria-label={
              isExpanded
                ? t("common.tree.collapse", "Collapse {{label}}", { label: node.label })
                : t("common.tree.expand", "Expand {{label}}", { label: node.label })
            }
            data-test={`tree-node-${node.id}-toggle`}
            onClick={() => toggle(node.id)}
            tabIndex={-1}
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
          <TextLink href={node.href} tabIndex={-1}>
            {node.label}
          </TextLink>
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
          {node.children.map((child, index) => (
            <TreeItem
              depth={depth + 1}
              key={child.id}
              node={child}
              parentPath={path}
              siblingCount={node.children?.length ?? 1}
              siblingIndex={index + 1}
            />
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
    nodes: node.props.nodes,
    rememberState: node.props.rememberState,
    storageKey: `lattice:tree:${identity ?? "default"}`,
  });

  return (
    <TreeContext.Provider value={value}>
      <ul data-lattice-component={identity} role="tree">
        {node.props.nodes.map((child, index) => (
          <TreeItem
            depth={1}
            key={child.id}
            node={child}
            parentPath={null}
            siblingCount={node.props.nodes.length}
            siblingIndex={index + 1}
          />
        ))}
      </ul>
    </TreeContext.Provider>
  );
};

export default TreeComponent;
