import { createInertiaApp } from "@inertiajs/react";
import type { ReactElement } from "react";
import { initializeTheme } from "./appearance";
import { extendRegistry, type Plugin, type Registry } from "./core/registry";
import { setDefaultRegistry } from "./core/registry-context";
import type { SpriteValue } from "./icons/sprite";
import {
  createLayoutResolver,
  createPageResolver,
  type CreateLayoutResolverOptions,
  type PageModules,
} from "./inertia";
import { ProviderBase } from "./provider-base";
import { registry as defaultRegistry } from "./registry";

type InertiaAppOptions = NonNullable<Parameters<typeof createInertiaApp>[0]>;

export type CreateLatticeAppOptions = Omit<
  InertiaAppOptions,
  "resolve" | "layout" | "setup" | "withApp" | "pages"
> & {
  registry?: Registry;
  /**
   * Component-package plugins to merge onto the registry — pass the
   * Composer-discovered `virtual:lattice/plugins` here to register vendor
   * components with no manual `extendRegistry` call.
   */
  plugins?: Plugin[];
  sprite?: SpriteValue;
  /** Normal Inertia page modules, e.g. `import.meta.glob('./pages/**\/*.tsx')`. */
  pages?: PageModules;
  defaultLayout?: CreateLayoutResolverOptions["defaultLayout"];
};

/**
 * Bootstrap an Inertia app with the Lattice shell: the page/layout resolvers
 * (server-driven Lattice pages and normal Inertia pages alike), the Provider —
 * registry, sprite, flash toasts via Lattice's own Toaster — and theme
 * initialization. Forwards any other createInertiaApp option.
 */
export function createLatticeApp({
  registry,
  plugins,
  sprite,
  pages = {},
  defaultLayout,
  strictMode = true,
  ...inertiaOptions
}: CreateLatticeAppOptions = {}) {
  const baseRegistry = registry ?? defaultRegistry;
  const activeRegistry =
    plugins && plugins.length > 0 ? extendRegistry(baseRegistry, ...plugins) : baseRegistry;

  setDefaultRegistry(activeRegistry);

  const app = createInertiaApp({
    ...inertiaOptions,
    strictMode,
    resolve: createPageResolver(pages),
    layout: createLayoutResolver({ defaultLayout }),
    withApp: (node: ReactElement): ReactElement => (
      <ProviderBase registry={activeRegistry} sprite={sprite}>
        {node}
      </ProviderBase>
    ),
  });

  initializeTheme();

  return app;
}
