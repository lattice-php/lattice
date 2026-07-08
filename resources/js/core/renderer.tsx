import { Suspense } from "react";
import type { ReactNode } from "react";
import type { Node } from "./types";
import { useCollapsed } from "./collapsed-context";
import { useComponentRegistry } from "./registry-context";

const warnedMissingTypes = new Set<string>();

function warnMissingComponent(type: string): void {
  if (!import.meta.env.DEV || warnedMissingTypes.has(type)) {
    return;
  }

  warnedMissingTypes.add(type);
  console.warn(
    `[lattice] No component registered for node type "${type}" — the renderer skipped it. ` +
      "Likely causes: your app registry was not passed to createLatticeApp({ registry }), " +
      "or the registry key does not match the PHP #[AsComponent]/AsField type.",
  );
}

function MissingComponent({ node }: { node: Node }) {
  warnMissingComponent(node.type);

  if (!import.meta.env.DEV) {
    return null;
  }

  return <div data-lattice-missing-component={node.type}>Missing component: {node.type}</div>;
}

function nodeKey(node: Node, index: number): string {
  return node.key ?? node.id ?? `${node.type}-${index}`;
}

export function Renderer({ nodes }: { nodes: Node[] }): ReactNode {
  return nodes.map((node, index) => <NodeRenderer key={nodeKey(node, index)} node={node} />);
}

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
