import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { router } from "@inertiajs/react";
import { nodeIdentity, Renderer } from "@lattice-php/core";
import type { RendererComponent, Schema } from "@lattice-php/core";
import { cn, Icon, useT } from "@lattice-php/ui";
import { ROOTS_KEY, TreeContext, useTreeContext, useTreeState } from "./tree-context";

/**
 * The sparse wire shape a tree node serializes as (see `TreeNode::jsonSerialize()`):
 * every optional/falsy field is omitted rather than sent as `null`/`false`. `schema`
 * is the compiled body — icon/text-or-link/badge/actions — rendered by core's
 * `<Renderer>`; `label` stays a plain string used for typeahead and registry
 * registration, not for rendering.
 */
export type TreeNodeData = {
  readonly id: string;
  readonly label: string;
  schema: Schema;
  href?: string;
  disabled?: boolean;
  hasChildren?: boolean;
  children?: TreeNodeData[];
};

export type TreeWireProps = {
  activeId: string | null;
  defaultExpanded: string[];
  rememberState: boolean;
  nodes: TreeNodeData[];
  ref: string | null;
  endpoint: string | null;
  lazy: boolean;
};

declare module "@lattice-php/core" {
  interface ComponentProps {
    tree: TreeWireProps;
  }
}

function isExpandable(
  node: TreeNodeData,
  children: TreeNodeData[] | undefined,
  canLoad: boolean,
): boolean {
  return (
    Boolean(children?.length) ||
    (node.hasChildren === true && (canLoad || Boolean(node.children?.length)))
  );
}

const ORDER_PATH_SEGMENT_WIDTH = 6;

function orderPathSegment(index: number): string {
  return String(index).padStart(ORDER_PATH_SEGMENT_WIDTH, "0");
}

function TreeItem({
  depth,
  node,
  orderPath,
  parentPath,
  siblingCount,
  siblingIndex,
}: {
  depth: number;
  node: TreeNodeData;
  orderPath: string;
  parentPath: string | null;
  siblingCount: number;
  siblingIndex: number;
}) {
  const {
    activate,
    activeId,
    canLoad,
    childrenFor,
    expanded,
    focusedId,
    isLoading,
    loadChildren,
    moveFocus,
    register,
    toggle,
    typeAhead,
    unregister,
  } = useTreeContext();
  const { t } = useT("tree");
  const ref = useRef<HTMLLIElement>(null);
  const path = parentPath ? `${parentPath}/${node.id}` : node.id;
  const isExpanded = expanded.has(node.id);
  const isActive = activeId === node.id;
  const isFocused = focusedId === node.id;
  const isDisabled = node.disabled === true;
  const children = node.children ?? childrenFor(node.id);
  const expandable = isExpandable(node, children, canLoad);
  const loading = isLoading(node.id);
  const bodyRef = useRef<HTMLSpanElement>(null);

  // Fetching is an effect of "expanded but unloaded", so chevron clicks,
  // ArrowRight, defaultExpanded, and a rememberState restore all share it.
  useEffect(() => {
    if (isExpanded && node.hasChildren === true && !node.children && !children) {
      loadChildren(node.id);
    }
  }, [isExpanded, node, children, loadChildren]);

  useEffect(() => {
    register({ id: node.id, label: node.label, orderPath, parentPath, path, ref });

    return () => unregister(path);
  }, [node.id, node.label, orderPath, parentPath, path, register, unregister]);

  useEffect(() => {
    const container = bodyRef.current;

    if (!container) {
      return;
    }

    container.querySelectorAll<HTMLElement>("button, a[href], [tabindex]").forEach((control) => {
      control.tabIndex = -1;
    });
  }, [node.schema]);

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
          const trigger = bodyRef.current?.querySelector("button");

          if (trigger) {
            trigger.click();
            ref.current?.focus();
          } else {
            activate(node.id);
          }
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
      aria-label={node.label}
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
                ? t("tree.collapse", "Collapse {{label}}", { label: node.label })
                : t("tree.expand", "Expand {{label}}", { label: node.label })
            }
            data-test={`tree-node-${node.id}-toggle`}
            onClick={() => toggle(node.id)}
            tabIndex={-1}
            type="button"
          >
            {loading ? (
              <Icon className="size-lt-icon-md shrink-0 animate-spin" name="loader-2" />
            ) : (
              <Icon
                className={cn(
                  "size-lt-icon-md shrink-0 transition-transform",
                  isExpanded && "rotate-90",
                )}
                name="chevron-right"
              />
            )}
          </button>
        ) : null}
        <span className="flex min-w-0 flex-1 items-center gap-2" ref={bodyRef}>
          <Renderer nodes={node.schema} />
        </span>
      </div>
      {expandable && isExpanded && children && children.length > 0 ? (
        <ul className="pl-6" role="group">
          {children.map((child, index) => (
            <TreeItem
              depth={depth + 1}
              key={child.id}
              node={child}
              orderPath={`${orderPath}.${orderPathSegment(index)}`}
              parentPath={path}
              siblingCount={children.length}
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
    endpoint: node.props.endpoint ?? null,
    componentRef: node.props.ref ?? null,
    lazy: node.props.lazy === true,
    nodes: node.props.nodes,
    rememberState: node.props.rememberState,
    storageKey: `lattice:tree:${identity ?? "default"}`,
  });
  const roots =
    node.props.nodes.length > 0 ? node.props.nodes : (value.childrenFor(ROOTS_KEY) ?? []);

  return (
    <TreeContext.Provider value={value}>
      <ul data-lattice-component={identity} role="tree">
        {roots.map((child, index) => (
          <TreeItem
            depth={1}
            key={child.id}
            node={child}
            orderPath={orderPathSegment(index)}
            parentPath={null}
            siblingCount={roots.length}
            siblingIndex={index + 1}
          />
        ))}
      </ul>
    </TreeContext.Provider>
  );
};

export default TreeComponent;
