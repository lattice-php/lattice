import { createContext, Suspense, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { ComponentRegistry } from "./registry";
import type { Node, UnknownComponent } from "./types";

function MissingComponent({ node }: { node: Node }) {
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div data-lattice-missing-component={node.type}>Missing Lattice component: {node.type}</div>
  );
}

type RendererContextValue = {
  fallback: ReactNode;
  missingComponent: UnknownComponent;
  registry: ComponentRegistry;
};

const LatticeRendererContext = createContext<RendererContextValue | null>(null);

export function useLatticeRendererContext(): RendererContextValue {
  const context = useContext(LatticeRendererContext);

  if (!context) {
    throw new Error("Lattice renderer context is not available.");
  }

  return context;
}

export function LatticeRenderer({
  fallback = null,
  missingComponent: UnknownComponent = MissingComponent,
  nodes,
  registry,
}: {
  fallback?: ReactNode;
  missingComponent?: UnknownComponent;
  nodes: Node[];
  registry: ComponentRegistry;
}) {
  const context = useMemo(
    () => ({
      fallback,
      missingComponent: UnknownComponent,
      registry,
    }),
    [fallback, registry, UnknownComponent],
  );

  return (
    <LatticeRendererContext.Provider value={context}>
      {nodes.map((node, index) => (
        <LatticeNodeRenderer
          fallback={fallback}
          key={node.key ?? node.id ?? `${node.type}-${index}`}
          missingComponent={UnknownComponent}
          node={node}
          registry={registry}
        />
      ))}
    </LatticeRendererContext.Provider>
  );
}

function LatticeNodeRenderer({
  fallback,
  missingComponent: UnknownComponent,
  node,
  registry,
}: {
  fallback: ReactNode;
  missingComponent: UnknownComponent;
  node: Node;
  registry: ComponentRegistry;
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
