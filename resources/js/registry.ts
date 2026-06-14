import { createRegistry } from "@lattice-php/lattice/core/registry";
import { actionComponents } from "./action";
import { coreComponents } from "./core/components";
import { effectsPlugin } from "./effects";
import { formComponents } from "./form";
import { layoutComponents } from "./layout/components";
import { tableComponents } from "./table";

export const registry = createRegistry(
  coreComponents,
  actionComponents,
  formComponents,
  layoutComponents,
  tableComponents,
  effectsPlugin,
);
