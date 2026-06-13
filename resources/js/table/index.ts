import { createPlugin, lazyComponent } from "@lattice-php/lattice/core/registry";
import type { RendererComponentModule } from "@lattice-php/lattice/core/types";

export const tableComponents = createPlugin({
  components: {
    // The table renders an enriched TableNode (rows/pagination/state the server
    // hydrates onto it); the registry erases per-component node types here.
    table: lazyComponent(
      () => import("./components/table") as unknown as Promise<RendererComponentModule<"table">>,
    ),
  },
  name: "lattice/table",
});
