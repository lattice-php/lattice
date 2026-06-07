import { createLatticeRegistry } from "@/lattice/core/registry";
import { authComponents } from "./auth";
import { coreComponents } from "./core/components";
import { formComponents } from "./form";
import { tableComponents } from "./table";

export const latticeRegistry = createLatticeRegistry(
  coreComponents,
  authComponents,
  formComponents,
  tableComponents,
);
