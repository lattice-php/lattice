import { Suspense } from "react";
import type { ReactNode } from "react";
import type { Node } from "./types";
import { useCollapsed } from "./collapsed-context";
import { useComponentRegistry } from "./registry-context";

function MissingComponent({ node }: { node: Node }) {
  if (!import.meta.env.DEV) {
    return null;
  }

  return <div data-lattice-missing-component={node.type}>Missing component: {node.type}</div>;
}

function nodeKey(node: Node, index: number): string {
  return node.key ?? node.id ?? `${node.type}-${index}`;
}

/** Renders a schema (list of nodes) against the active component registry. */
export function Renderer({ nodes }: { nodes: Node[] }): ReactNode {
  return nodes.map((node, index) => <NodeRenderer key={nodeKey(node, index)} node={node} />);
}

/** Renders a single node against the active component registry. */
export function RenderNode({ node }: { node: Node }): ReactNode {
  return <NodeRenderer node={node} />;
}

function NodeRenderer({ node }: { node: Node }) {
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
  const renderedComponent = <Component node={node}>{children}</Component>;

  if (registration.mode === "lazy") {
    const FallbackComponent = registration.fallback;
    const fallback = FallbackComponent ? (
      <FallbackComponent node={node}>{null}</FallbackComponent>
    ) : null;

    return <Suspense fallback={fallback}>{renderedComponent}</Suspense>;
  }

  return renderedComponent;
}
