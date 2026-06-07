import { Suspense } from "react";
import type { ReactNode } from "react";
import type { LatticeComponentRegistry } from "./registry";
import type { LatticeNode, LatticeUnknownComponent } from "./types";

function MissingComponent({ node }: { node: LatticeNode }) {
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div data-lattice-missing-component={node.type}>Missing Lattice component: {node.type}</div>
  );
}

export function LatticeRenderer({
  fallback = null,
  missingComponent: UnknownComponent = MissingComponent,
  nodes,
  registry,
}: {
  fallback?: ReactNode;
  missingComponent?: LatticeUnknownComponent;
  nodes: LatticeNode[];
  registry: LatticeComponentRegistry;
}) {
  return nodes.map((node, index) => (
    <LatticeNodeRenderer
      fallback={fallback}
      key={node.key ?? node.id ?? `${node.type}-${index}`}
      missingComponent={UnknownComponent}
      node={node}
      registry={registry}
    />
  ));
}

function LatticeNodeRenderer({
  fallback,
  missingComponent: UnknownComponent,
  node,
  registry,
}: {
  fallback: ReactNode;
  missingComponent: LatticeUnknownComponent;
  node: LatticeNode;
  registry: LatticeComponentRegistry;
}) {
  const registration = registry[node.type];

  if (!registration) {
    return <UnknownComponent node={node} />;
  }

  const Component = registration.component;
  const children = node.children?.length ? (
    <LatticeRenderer
      fallback={fallback}
      missingComponent={UnknownComponent}
      nodes={node.children}
      registry={registry}
    />
  ) : null;

  const renderedComponent = <Component node={node}>{children}</Component>;

  if (registration.mode === "lazy") {
    const FallbackComponent = registration.fallback;
    const suspenseFallback = FallbackComponent ? (
      <FallbackComponent node={node}>{null}</FallbackComponent>
    ) : (
      fallback
    );

    return <Suspense fallback={suspenseFallback}>{renderedComponent}</Suspense>;
  }

  return renderedComponent;
}
