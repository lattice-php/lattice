import { createRegistry } from "@lattice/lattice/core/registry";
import { actionComponents } from "./action";
import { coreComponents } from "./core/components";
import { formComponents } from "./form";
import { layoutComponents } from "./layout/components";
import { tableComponents } from "./table";

export const registry = createRegistry(
  coreComponents,
  actionComponents,
  formComponents,
  layoutComponents,
  tableComponents,
);
