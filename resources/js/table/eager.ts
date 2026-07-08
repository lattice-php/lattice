import {
  type ComponentRegistration,
  createPlugin,
  eagerComponent,
} from "@lattice-php/lattice/core/registry";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import type { TableComponentType } from "./index";
import TableComponent from "./components/table";

const components = {
  table: eagerComponent(TableComponent as unknown as RendererComponent<"table">),
} satisfies Record<TableComponentType, ComponentRegistration>;

export const eagerTableComponents = createPlugin({ components, name: "lattice/table" });
