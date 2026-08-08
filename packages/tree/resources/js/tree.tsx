import { router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { nodeIdentity, Renderer } from "@lattice-php/core";
import { cn } from "@lattice-php/ui/lib/utils";
import type { RendererComponent } from "@lattice-php/core";
import {
  announce,
  attachTreeItemInstruction,
  combine,
  draggable,
  dropTargetForElements,
  extractTreeItemInstruction,
} from "@lattice-php/lattice/dnd";
import type { TreeItemInstruction } from "@lattice-php/lattice/dnd";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import type { TreeNodeData } from "./types";
import { ROOTS_KEY, TreeContext, useTreeContext, useTreeState } from "./tree-context";

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
const TREE_DRAG_TYPE = "lattice-tree-node";
const HOVER_EXPAND_MS = 500;

function orderPathSegment(index: number): string {
  return String(index).padStart(ORDER_PATH_SEGMENT_WIDTH, "0");
}

function TreeItem({
  depth,
  node,
  orderPath,
  parentPath,
  ancestors,
  siblingCount,
  siblingIndex,
}: {
  depth: number;
  node: TreeNodeData;
  orderPath: string;
  parentPath: string | null;
  ancestors: string[];
  siblingCount: number;
  siblingIndex: number;
}) {
  const {
    activate,
    activeId,
    canDropOn,
    canLoad,
    canMove,
    childrenCount,
    childrenFor,
    expand,
    expanded,
    focus,
    focusedId,
    isLoaded,
    isLoading,
    loadChildren,
    move,
    moveFocus,
    moving,
    parentFor,
    positionFor,
    register,
    toggle,
    typeAhead,
    unregister,
  } = useTreeContext();
  const { t } = useT("tree");
  const ref = useRef<HTMLLIElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dropInstruction, setDropInstruction] = useState<TreeItemInstruction["type"] | null>(null);
  const path = parentPath ? `${parentPath}/${node.id}` : node.id;
  const isExpanded = expanded.has(node.id);
  const isActive = activeId === node.id;
  const isFocused = focusedId === node.id;
  const isDisabled = node.disabled === true;
  const children = childrenFor(node.id);
  const expandable = isExpandable(node, children, canLoad);
  const loading = isLoading(node.id);
  const bodyRef = useRef<HTMLSpanElement>(null);

  // Fetching is an effect of "expanded but unloaded", so chevron clicks,
  // ArrowRight, defaultExpanded, and a rememberState restore all share it.
  useEffect(() => {
    if (isExpanded && node.hasChildren === true && !children) {
      void loadChildren(node.id);
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

  function clearHoverTimer(): void {
    if (hoverTimerRef.current !== null) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }

  function relativePosition(sourceId: string, targetId: string, after: boolean): number {
    const targetParentId = parentFor(targetId);
    const targetPosition = positionFor(targetId);
    const sourceAdjustment =
      parentFor(sourceId) === targetParentId && positionFor(sourceId) < targetPosition ? 1 : 0;

    return targetPosition + (after ? 1 : 0) - sourceAdjustment;
  }

  async function dropNode(
    sourceData: Record<string, unknown>,
    targetData: Record<string | symbol, unknown>,
  ): Promise<void> {
    const sourceId = sourceData.nodeId;
    const sourceLabel = typeof sourceData.label === "string" ? sourceData.label : sourceId;
    const instruction = extractTreeItemInstruction(targetData);

    if (
      typeof sourceId !== "string" ||
      typeof sourceLabel !== "string" ||
      !instruction ||
      instruction.type === "instruction-blocked"
    ) {
      return;
    }

    let request: { nodeId: string; parentId: string | null; position: number } | null = null;

    if (instruction.type === "reorder-above" || instruction.type === "reorder-below") {
      request = {
        nodeId: sourceId,
        parentId: parentFor(node.id),
        position: relativePosition(sourceId, node.id, instruction.type === "reorder-below"),
      };
    } else if (instruction.type === "make-child") {
      if (node.hasChildren === true && !isLoaded(node.id)) {
        await loadChildren(node.id);

        if (!isLoaded(node.id)) {
          return;
        }
      }

      expand(node.id);
      request = { nodeId: sourceId, parentId: node.id, position: childrenCount(node.id) };
    } else if (instruction.type === "reparent") {
      const path = [...ancestors, node.id];
      const desiredLevel = Math.max(0, Math.min(instruction.desiredLevel, path.length - 1));
      const anchorId = path[desiredLevel];
      const parentId = desiredLevel === 0 ? null : path[desiredLevel - 1];

      request = {
        nodeId: sourceId,
        parentId,
        position: relativePosition(sourceId, anchorId, true),
      };
    }

    if (!request) {
      return;
    }

    const accepted = await move(request);
    announce(
      accepted
        ? t("tree.moved", "Moved {{label}}", { label: sourceLabel })
        : t("tree.move_failed", "Could not move {{label}}", { label: sourceLabel }),
    );
  }

  useEffect(() => {
    const element = rowRef.current;

    if (!element || !canMove || isDisabled) {
      return;
    }

    return combine(
      draggable({
        canDrag: () => !moving,
        element,
        getInitialData: () => ({ label: node.label, nodeId: node.id, type: TREE_DRAG_TYPE }),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
      }),
      dropTargetForElements({
        canDrop: ({ source }) =>
          source.data.type === TREE_DRAG_TYPE &&
          typeof source.data.nodeId === "string" &&
          canDropOn(source.data.nodeId, node.id),
        element,
        getData: ({ element: target, input }) =>
          attachTreeItemInstruction(
            { nodeId: node.id, type: TREE_DRAG_TYPE },
            {
              currentLevel: depth - 1,
              element: target,
              indentPerLevel: 24,
              input,
              mode: isExpanded
                ? "expanded"
                : siblingIndex === siblingCount
                  ? "last-in-group"
                  : "standard",
            },
          ),
        onDrag: ({ self }) =>
          setDropInstruction(extractTreeItemInstruction(self.data)?.type ?? null),
        onDragEnter: ({ self }) => {
          setDropInstruction(extractTreeItemInstruction(self.data)?.type ?? null);

          if (expandable && !isExpanded) {
            clearHoverTimer();
            hoverTimerRef.current = setTimeout(() => {
              expand(node.id);

              if (node.hasChildren === true) {
                void loadChildren(node.id);
              }
            }, HOVER_EXPAND_MS);
          }
        },
        onDragLeave: () => {
          clearHoverTimer();
          setDropInstruction(null);
        },
        onDrop: ({ self, source }) => {
          clearHoverTimer();
          setDropInstruction(null);
          void dropNode(source.data, self.data);
        },
      }),
    );
  }, [
    ancestors,
    canDropOn,
    canMove,
    childrenCount,
    depth,
    expand,
    expandable,
    isDisabled,
    isExpanded,
    isLoaded,
    loadChildren,
    move,
    moving,
    node,
    parentFor,
    positionFor,
    siblingCount,
    siblingIndex,
    t,
  ]);

  useEffect(() => clearHoverTimer, []);

  async function moveWithKeyboard(key: string): Promise<void> {
    const parentId = parentFor(node.id);
    const position = positionFor(node.id);
    let request: { nodeId: string; parentId: string | null; position: number } | null = null;

    if (key === "ArrowUp" && position > 0) {
      request = { nodeId: node.id, parentId, position: position - 1 };
    } else if (key === "ArrowDown" && position < childrenCount(parentId) - 1) {
      request = { nodeId: node.id, parentId, position: position + 1 };
    } else if (key === "ArrowRight" && position > 0) {
      const previous = childrenFor(parentId ?? ROOTS_KEY)?.[position - 1];

      if (!previous || previous.disabled === true) {
        return;
      }

      if (previous.hasChildren === true && !isLoaded(previous.id)) {
        await loadChildren(previous.id);

        if (!isLoaded(previous.id)) {
          return;
        }
      }

      expand(previous.id);
      request = { nodeId: node.id, parentId: previous.id, position: childrenCount(previous.id) };
    } else if (key === "ArrowLeft" && parentId !== null) {
      const grandparentId = parentFor(parentId);
      request = {
        nodeId: node.id,
        parentId: grandparentId,
        position: positionFor(parentId) + 1,
      };
    }

    if (!request) {
      return;
    }

    const accepted = await move(request);
    announce(
      accepted
        ? t("tree.moved", "Moved {{label}}", { label: node.label })
        : t("tree.move_failed", "Could not move {{label}}", { label: node.label }),
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLLIElement>): void {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (
      canMove &&
      !isDisabled &&
      !moving &&
      event.ctrlKey &&
      event.shiftKey &&
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
    ) {
      event.preventDefault();
      void moveWithKeyboard(event.key);
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

  function onClick(event: MouseEvent<HTMLLIElement>): void {
    const target = event.target;

    if (
      isDisabled ||
      !(target instanceof Element) ||
      target.closest('[role="treeitem"]') !== event.currentTarget ||
      target.closest('button, a[href], [role="button"]')
    ) {
      return;
    }

    focus(node.id);
    activate(node.id);
  }

  return (
    <li
      aria-disabled={isDisabled}
      aria-expanded={expandable ? isExpanded : undefined}
      aria-label={node.label}
      aria-level={depth}
      aria-keyshortcuts={
        canMove && !isDisabled
          ? "Control+Shift+ArrowUp Control+Shift+ArrowDown Control+Shift+ArrowLeft Control+Shift+ArrowRight"
          : undefined
      }
      aria-posinset={siblingIndex}
      aria-selected={isActive}
      aria-setsize={siblingCount}
      data-test={`tree-node-${node.id}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      ref={ref}
      role="treeitem"
      tabIndex={isFocused ? 0 : -1}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-lt-sm border-y border-transparent px-2 py-1.5 text-sm text-lt-fg",
          isActive && "bg-lt-muted font-medium",
          isDisabled && "pointer-events-none opacity-50",
          canMove && !isDisabled && "cursor-grab",
          dragging && "opacity-50",
          dropInstruction === "reorder-above" && "border-t-lt-primary",
          dropInstruction === "reorder-below" && "border-b-lt-primary",
          (dropInstruction === "make-child" || dropInstruction === "reparent") &&
            "ring-1 ring-lt-primary",
        )}
        data-drop-instruction={dropInstruction ?? undefined}
        ref={rowRef}
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
              ancestors={[...ancestors, node.id]}
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
    activePath: node.props.activePath,
    defaultExpanded: node.props.defaultExpanded,
    endpoint: node.props.endpoint ?? null,
    componentRef: node.props.ref ?? null,
    lazy: node.props.lazy === true,
    moveAction: node.props.moveAction ?? null,
    nodes: node.props.nodes,
    rememberState: node.props.rememberState,
    revision: node.props.revision ?? null,
    selectAction: node.props.selectAction ?? null,
    storageKey: `lattice:tree:${identity ?? "default"}`,
  });
  const roots = value.childrenFor(ROOTS_KEY) ?? [];

  return (
    <TreeContext.Provider value={value}>
      <ul data-lattice-component={identity} role="tree">
        {roots.map((child, index) => (
          <TreeItem
            ancestors={[]}
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
