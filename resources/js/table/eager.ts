import { createPlugin, eagerComponent } from "@lattice-php/lattice/core/registry";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import TableComponent from "./components/table";

export const eagerTableComponents = createPlugin({
  components: {
    table: eagerComponent(TableComponent as unknown as RendererComponent<"table">),
  },
  name: "lattice/table",
});
