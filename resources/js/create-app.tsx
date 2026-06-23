import { createInertiaApp } from "@inertiajs/react";
import type { ReactElement } from "react";
import { initializeTheme } from "./appearance";
import type { Registry } from "./core/registry";
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
  sprite,
  pages = {},
  defaultLayout,
  strictMode = true,
  ...inertiaOptions
}: CreateLatticeAppOptions = {}) {
  const activeRegistry = registry ?? defaultRegistry;

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
