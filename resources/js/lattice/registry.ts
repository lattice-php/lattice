import { createLatticeRegistry } from "@/lattice/core/registry";
import { actionComponents } from "./action";
import { authComponents } from "./auth";
import { coreComponents } from "./core/components";
import { formComponents } from "./form";
import { tableComponents } from "./table";

export const latticeRegistry = createLatticeRegistry(
  coreComponents,
  actionComponents,
  authComponents,
  formComponents,
  tableComponents,
);
