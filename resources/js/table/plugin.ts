import {
  createPlugin,
  eagerComponent,
  type ComponentRegistryFor,
} from "@lattice-php/lattice/core/registry";
import type { TableNodeType } from "@lattice-php/lattice/types/generated";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import TableComponent from "./components/table";

// The table renders an enriched TableNode (rows/pagination/state the server
// hydrates onto it); the registry erases per-component node types here.
export const tableComponents = createPlugin({
  components: {
    table: eagerComponent(TableComponent as unknown as RendererComponent<"table">),
  } satisfies ComponentRegistryFor<TableNodeType>,
  name: "lattice/table",
});
