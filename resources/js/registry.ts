import { createRegistry } from "@/lattice/core/registry";
import { actionComponents } from "./action";
import { authComponents } from "./auth";
import { coreComponents } from "./core/components";
import { formComponents } from "./form";
import { tableComponents } from "./table";

export const registry = createRegistry(
  coreComponents,
  actionComponents,
  authComponents,
  formComponents,
  tableComponents,
);
