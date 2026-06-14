import { createContext, useContext } from "react";
import type { ComponentRegistry, Registry } from "./registry";
import type { ColumnRegistry } from "../table/column-registry";
import type { EffectHandlerRegistry } from "../effects/registry";

/**
 * Holds the active Registry for the current Provider subtree. Extracted into
 * its own module to break the circular reference between provider.tsx (which
 * imports the default registry instance) and use-effect-dispatcher.ts (which
 * imports the context selector). Neither file imports from the other; both
 * import from here.
 *
 * The context default is null. Selectors fall back to `_defaultRegistry`,
 * which provider.tsx sets at module evaluation time (after registry.ts has
 * finished loading). This avoids a synchronous evaluation cycle while
 * preserving the pre-existing behaviour that components work without a
 * surrounding <Provider>.
 */
export const RegistryContext = createContext<Registry | null>(null);

/**
 * Set by provider.tsx at module-evaluation time, after registry.ts finishes.
 * Must not be imported in any module that is transitively reachable from
 * registry.ts before it completes (i.e. action.tsx, use-effect-dispatcher.ts).
 */
let _defaultRegistry: Registry | null = null;

export function setDefaultRegistry(registry: Registry): void {
  _defaultRegistry = registry;
}

export function useRegistry(): ComponentRegistry {
  const registry = useContext(RegistryContext) ?? _defaultRegistry;
  return registry?.components ?? {};
}

export function useColumnRegistry(): ColumnRegistry {
  const registry = useContext(RegistryContext) ?? _defaultRegistry;
  return registry?.columns ?? {};
}

export function useEffectHandlers(): EffectHandlerRegistry {
  const registry = useContext(RegistryContext) ?? _defaultRegistry;
  return registry?.effects ?? {};
}
