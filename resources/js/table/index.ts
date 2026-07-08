import {
  type ComponentRegistry,
  createPlugin,
  lazyComponent,
} from "@lattice-php/lattice/core/registry";
import type { RendererComponentModule } from "@lattice-php/lattice/core/types";

const components = {
  // The table renders an enriched TableNode (rows/pagination/state the server
  // hydrates onto it); the registry erases per-component node types here.
  table: lazyComponent(
    () => import("./components/table") as unknown as Promise<RendererComponentModule<"table">>,
  ),
} satisfies ComponentRegistry;

export const tableComponents = createPlugin({ components, name: "lattice/table" });

/** The component types this domain registers; its eager twin is pinned to this. */
export type TableComponentType = keyof typeof components;
