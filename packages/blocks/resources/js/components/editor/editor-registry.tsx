import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import {
  eagerComponent,
  RegistryProvider,
  RenderNode,
  useComponentRegistry,
  useExtensionRegistry,
} from "@lattice-php/core";
import type { Node, Registry } from "@lattice-php/core";
import { RICH_EDITOR_EXTENSION } from "@lattice-php/form/rich-editor";
import { inlineOverride } from "../../inline/inline-override";
import EditorFrameAdapter from "./editor-frame";
import EditorSlotAdapter from "./editor-slot";

const INLINE_NODE_TYPES = ["heading", "text", "button", "image", "raw-block", "blocks.rich-text"];

const BaseRegistryContext = createContext<Registry | null>(null);

export function BaseRegistryProvider({
  registry,
  children,
}: {
  registry: Registry;
  children: ReactNode;
}) {
  return <BaseRegistryContext.Provider value={registry}>{children}</BaseRegistryContext.Provider>;
}

/**
 * Render a node with the app's own components, bypassing the editor overrides.
 * Inline editors use it for nodes that are not bound to a field.
 */
export function BaseNode({ node }: { node: Node }) {
  const base = useContext(BaseRegistryContext);

  if (!base) {
    return <RenderNode node={node} />;
  }

  return (
    <RegistryProvider registry={base}>
      <RenderNode node={node} />
    </RegistryProvider>
  );
}

/**
 * The canvas renders blocks with the app's own components, swapping only the
 * frame, the slot outlets, and the node types that can carry a field binding
 * for their editing counterparts.
 */
export function useEditorRegistry(): { registry: Registry; base: Registry } {
  const components = useComponentRegistry();
  const richEditorExtensions = useExtensionRegistry(RICH_EDITOR_EXTENSION);

  return useMemo(() => {
    const extensions = { [RICH_EDITOR_EXTENSION]: richEditorExtensions };
    const overrides = Object.fromEntries(
      INLINE_NODE_TYPES.map((type) => [type, eagerComponent(inlineOverride(type))]),
    );

    return {
      base: { components, extensions },
      registry: {
        components: {
          ...components,
          ...overrides,
          "blocks.frame": eagerComponent(EditorFrameAdapter),
          "blocks.slot": eagerComponent(EditorSlotAdapter),
        },
        extensions,
      },
    };
  }, [components, richEditorExtensions]);
}
