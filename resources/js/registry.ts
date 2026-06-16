import { createRegistry } from "@lattice-php/lattice/core/registry";
import { actionComponents } from "./action";
import { chatPlugin } from "./chat";
import { coreComponents } from "./core/components";
import { formComponents } from "./form";
import { integrationComponents } from "./integrations";
import { layoutComponents } from "./layout/components";
import { tableComponents } from "./table";

export const registry = createRegistry(
  coreComponents,
  actionComponents,
  formComponents,
  layoutComponents,
  tableComponents,
  chatPlugin,
  integrationComponents,
);
