import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { TableNodeType } from "./generated";
import type { RendererComponent } from "@lattice-php/core/types";
import { TableComponent } from "./components/table";

// The table renders an enriched TableNode (rows/pagination/state the server
// hydrates onto it); the registry erases per-component node types here.
export const tableComponents: Plugin = {
  components: {
    table: eagerComponent(TableComponent as unknown as RendererComponent<"table">),
    // A row's click behavior travels on the row payload, where the table reads
    // its props directly; the node never sits in a schema, so it has nothing
    // to render.
    "table.row-click": eagerComponent(() => null),
  } satisfies ComponentRegistryFor<TableNodeType>,
  name: "lattice/table",
};

export default tableComponents;
