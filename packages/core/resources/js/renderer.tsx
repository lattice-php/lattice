import { memo, Suspense } from "react";
import type { ReactNode } from "react";
import type { Node } from "./types";
import { nodeKey } from "./nodes";
import { useCollapsed } from "./collapsed-context";
import { useComponentRegistry } from "./registry-context";

const warnedMissingTypes = new Set<string>();

export type VisibilityBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

const HIDDEN_FROM_CLASS: Record<VisibilityBreakpoint, string> = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
  "2xl": "2xl:hidden",
};

const VISIBLE_FROM_CLASS: Record<VisibilityBreakpoint, string> = {
  sm: "sm:contents",
  md: "md:contents",
  lg: "lg:contents",
  xl: "xl:contents",
  "2xl": "2xl:contents",
};

function breakpointClass(
  map: Record<VisibilityBreakpoint, string>,
  value: string | undefined,
): string | undefined {
  return value !== undefined && value in map ? map[value as VisibilityBreakpoint] : undefined;
}

/**
 * A `display: contents` wrapper stays transparent to the parent layout, so the
 * responsive visibility classes can toggle any node without disturbing flex or
 * grid parents.
 */
function responsiveVisibilityClass(props: Node["props"]): string | null {
  const hiddenFrom = breakpointClass(
    HIDDEN_FROM_CLASS,
    (props as { hiddenFrom?: string })?.hiddenFrom,
  );
  const visibleFrom = breakpointClass(
    VISIBLE_FROM_CLASS,
    (props as { visibleFrom?: string })?.visibleFrom,
  );

  if (visibleFrom && hiddenFrom) {
    return `hidden ${visibleFrom} ${hiddenFrom}`;
  }

  if (visibleFrom) {
    return `hidden ${visibleFrom}`;
  }

  if (hiddenFrom) {
    return `contents ${hiddenFrom}`;
  }

  return null;
}

function warnMissingComponent(type: string): void {
  if (!import.meta.env.DEV || warnedMissingTypes.has(type)) {
    return;
  }

  warnedMissingTypes.add(type);
  console.warn(
    `[lattice] No component registered for node type "${type}" — Lattice rendered a fallback ` +
      "placeholder. Likely causes: your app registry was not passed to " +
      "createLatticeApp({ registry }), or the registry key does not match the PHP " +
      "#[AsComponent]/AsField type.",
  );
}

function MissingComponentIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-lt-icon-md shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect height="18" rx="2" strokeDasharray="4 3" width="18" x="3" y="3" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

/**
 * Fallback for a node whose type has no registered renderer. Always renders a
 * visible, muted marker — icon-only survives tight spots like table cells — so
 * the gap is never invisible. Shows the type inline in development; keeps it
 * screen-reader-only (plus a hover tooltip) in production.
 */
function MissingComponent({ node }: { node: Node }) {
  warnMissingComponent(node.type);

  const label = `Missing component: ${node.type}`;

  return (
    <span
      className="inline-flex items-center gap-1.5 align-middle text-lt-muted-fg"
      data-lattice-missing-component={node.type}
      title={label}
    >
      <MissingComponentIcon />
      <span className={import.meta.env.DEV ? "text-sm" : "sr-only"}>{label}</span>
    </span>
  );
}

export function Renderer({ nodes }: { nodes: Node[] }): ReactNode {
  return nodes.map((node, index) => <NodeRenderer key={nodeKey(node, index)} node={node} />);
}

export function RenderNode({ node }: { node: Node }): ReactNode {
  return <NodeRenderer node={node} />;
}

const NodeRenderer = memo(function NodeRenderer({ node }: { node: Node }) {
  const collapsed = useCollapsed();
  const registry = useComponentRegistry();
  const registration = registry[node.type];

  if (collapsed && node.props?.hideWhenCollapsed === true) {
    return null;
  }

  if (!registration) {
    return <MissingComponent node={node} />;
  }

  const Component = registration.component;
  const children = node.schema?.length ? <Renderer nodes={node.schema} /> : null;
  let renderedComponent = <Component node={node}>{children}</Component>;

  if (registration.mode === "lazy") {
    renderedComponent = <Suspense fallback={null}>{renderedComponent}</Suspense>;
  }

  const visibilityClass = responsiveVisibilityClass(node.props);

  if (visibilityClass) {
    return <span className={visibilityClass}>{renderedComponent}</span>;
  }

  return renderedComponent;
});
