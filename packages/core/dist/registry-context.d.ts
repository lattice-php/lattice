import { ComponentRegistry, ExtensionRegistry, Registry } from "./registry.js";
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
export declare const RegistryContext: import("react").Context<Registry | null>;
export declare function setDefaultRegistry(registry: Registry): void;
export declare function useComponentRegistry(): ComponentRegistry;
export declare function useExtensionRegistry<TRegistry extends ExtensionRegistry>(
  name: string,
): TRegistry;
export declare function useColumnRegistry<TRegistry extends ExtensionRegistry>(): TRegistry;
export declare function useEffectHandlerRegistry<TRegistry extends ExtensionRegistry>(): TRegistry;
