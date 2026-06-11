import { createContext, Suspense, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { ComponentRegistry } from "./registry";
import type { Node, UnknownComponent } from "./types";

function MissingComponent({ node }: { node: Node }) {
  if (!import.meta.env.DEV) {
    return null;
  }

  return <div data-lattice-missing-component={node.type}>Missing component: {node.type}</div>;
}

type RendererContextValue = {
  fallback: ReactNode;
  missingComponent: UnknownComponent;
  registry: ComponentRegistry;
};

const RendererContext = createContext<RendererContextValue | null>(null);

export function useRendererContext(): RendererContextValue {
  const context = useContext(RendererContext);

  if (!context) {
    throw new Error("Renderer context is not available.");
  }

  return context;
}

function nodeKey(node: Node, index: number): string {
  return node.key ?? node.id ?? `${node.type}-${index}`;
}

export function Renderer({
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
    <RendererContext.Provider value={context}>
      {nodes.map((node, index) => (
        <NodeRenderer key={nodeKey(node, index)} node={node} />
      ))}
    </RendererContext.Provider>
  );
}

function NodeRenderer({ node }: { node: Node }) {
  const { fallback, missingComponent: UnknownComponent, registry } = useRendererContext();
  const registration = registry[node.type];

  if (!registration) {
    return <UnknownComponent node={node} />;
  }

  const Component = registration.component;
  const children = node.schema?.length
    ? node.schema.map((child, index) => <NodeRenderer key={nodeKey(child, index)} node={child} />)
    : null;

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
