import { eagerComponent, type ComponentRegistryFor, type Plugin } from "@lattice-php/core/registry";
import type { TableNodeType } from "@lattice-php/core/generated";
import type { RendererComponent } from "@lattice-php/core/types";
import TableComponent from "./components/table";

export const tableComponents: Plugin = {
  components: {
    table: eagerComponent(TableComponent as unknown as RendererComponent<"table">),
  } satisfies ComponentRegistryFor<TableNodeType>,
  name: "lattice/table",
};

export default tableComponents;
